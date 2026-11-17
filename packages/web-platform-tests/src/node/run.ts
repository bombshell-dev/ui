import { readFile } from 'node:fs/promises';
import { clearTimeout, setInterval, setTimeout } from 'node:timers';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createContext, Script } from 'node:vm';
import type { WPTConfig } from '../config.ts';
import { selectsTest } from '../vitest/selection.ts';
import { populateDocument } from './document.ts';
import { loadSource, type SourceScript } from './source.ts';
import { Window } from './window.ts';

export interface WPTTestResult {
	name: string;
	status: number;
	message: string | null;
	stack?: string | null;
}

export interface WPTHarnessStatus {
	status: number;
	message: string | null;
	stack?: string | null;
}

export interface WPTFileResult {
	tests: WPTTestResult[];
	status: WPTHarnessStatus;
}

interface WPTTest extends WPTTestResult {
	force_timeout(): void;
}

interface Harness {
	setup(properties: object): void;
	add_test_state_callback(callback: (test: WPTTest) => void): void;
	add_result_callback(callback: (test: WPTTest) => void): void;
	add_completion_callback(callback: (tests: WPTTest[], status: WPTHarnessStatus) => void): void;
}

class WPTExecutionError extends Error {}

/** Execute a whole upstream file in one window context before filtering its results. */
export async function runWPTFile({
	file,
	sourceRoot,
	config,
}: {
	file: string;
	sourceRoot: string;
	config: WPTConfig;
}): Promise<WPTFileResult> {
	const results: WPTTestResult[] = [];
	const timers = new Set<ReturnType<typeof setTimeout>>();
	const completion = Promise.withResolvers<WPTFileResult>();
	let watchdog: ReturnType<typeof setTimeout> | undefined;
	let finished = false;
	let failure: WPTHarnessStatus | undefined;
	const fail = (error: unknown, status = 1): void => {
		if (finished) {
			return;
		}
		failure ??= { status, ...describeError(error) };
		completion.resolve({ tests: results, status: failure });
	};
	const onError = (error: unknown): void => fail(error);
	try {
		const timeout = config.timeout ?? 15_000;
		if (!Number.isFinite(timeout) || timeout <= 0) {
			throw new WPTExecutionError('The WPT timeout must be a positive number of milliseconds');
		}
		const source = await loadSource(file, sourceRoot);
		const rootURL = pathToFileURL(sourceRoot.endsWith('/') ? sourceRoot : `${sourceRoot}/`);
		const sourcePath = decodeURIComponent(pathToFileURL(file).href.slice(rootURL.href.length));
		const harnessFile = fileURLToPath(new URL('resources/testharness.js', rootURL));
		const harnessCode = await readFile(harnessFile, 'utf8');
		const deadline = Date.now() + timeout;
		const window = new Window();
		const context = createContext(window);
		const scope = new Script('globalThis').runInContext(context) as Record<string, unknown>;
		const execute = (script: SourceScript): unknown =>
			new Script(script.code, {
				filename: script.file,
				lineOffset: script.lineOffset,
				columnOffset: script.columnOffset,
			}).runInContext(context, { timeout: Math.max(1, deadline - Date.now()) });
		const invoke = (callback: (...args: unknown[]) => void, args: unknown[]): void => {
			if (!finished) {
				try {
					callback.apply(scope, args);
				} catch (error) {
					fail(error);
				}
			}
		};
		Object.assign(window, config.globals, {
			window: scope,
			self: scope,
			console,
			// Bind bare global calls to the context's window, preserving listener receivers.
			addEventListener: window.addEventListener.bind(scope),
			removeEventListener: window.removeEventListener.bind(scope),
			dispatchEvent: window.dispatchEvent.bind(scope),
			setTimeout(callback: (...args: unknown[]) => void, delay = 0, ...args: unknown[]) {
				const timer = setTimeout(() => {
					timers.delete(timer);
					invoke(callback, args);
				}, delay);
				timers.add(timer);
				return timer;
			},
			setInterval(callback: (...args: unknown[]) => void, delay = 0, ...args: unknown[]) {
				const timer = setInterval(() => invoke(callback, args), delay);
				timers.add(timer);
				return timer;
			},
			clearTimeout(timer: ReturnType<typeof setTimeout>) {
				clearTimeout(timer);
				timers.delete(timer);
			},
			queueMicrotask(callback: () => void) {
				queueMicrotask(() => invoke(callback, []));
			},
		});
		scope.clearInterval = scope.clearTimeout;
		process.on('uncaughtException', onError);
		process.on('unhandledRejection', onError);

		// Upstream supplies its shell environment, assertions, scheduling, and cleanup.
		// Supplying the document afterward avoids its browser-only HTML reporting APIs.
		execute({ file: harnessFile, code: harnessCode });
		const harness = scope as unknown as Harness;
		harness.setup({ output: false });
		const registered = new Set<WPTTest>();
		const completed = new Set<WPTTest>();
		let loaded = false;
		const finishUnsupportedIframe = (): void => {
			if (!loaded || sourcePath !== 'dom/nodes/Node-parentNode.html') {
				return;
			}
			const selected = (test: WPTTest): boolean =>
				selectsTest({ source: sourcePath, name: test.name }, config);
			if ([...registered].some((test) => selected(test) && !completed.has(test))) {
				return;
			}
			for (const test of registered) {
				// This independent case waits on an iframe's own load event, which we cannot deliver.
				if (test.name === 'Removed iframe' && !selected(test) && !completed.has(test)) {
					test.force_timeout();
				}
			}
		};
		harness.add_test_state_callback((test) => registered.add(test));
		harness.add_result_callback((test) => {
			completed.add(test);
			results.push(copyTest(test));
			queueMicrotask(finishUnsupportedIframe);
		});
		harness.add_completion_callback((tests, status) => {
			completion.resolve({
				tests: Array.from(tests, copyTest),
				status: { status: status.status, message: status.message, stack: status.stack },
			});
		});
		const document = config.createDocument() as Document;
		Object.defineProperty(window, 'document', { value: document, enumerable: true });
		Object.defineProperty(document, 'defaultView', {
			get: () => scope,
			enumerable: true,
			configurable: true,
		});
		if (source.title !== undefined) {
			scope.META_TITLE = source.title;
		}
		populateDocument(document, source.html);
		watchdog = setTimeout(
			() => {
				fail(new WPTExecutionError(`WPT file did not complete within ${timeout}ms: ${file}`), 2);
			},
			Math.max(1, deadline - Date.now()),
		);
		for (const script of source.scripts) {
			execute(script);
		}
		execute({
			file: 'wpt:load',
			code: `{
				const event = new Event('load');
				Object.defineProperty(event, 'target', { value: document, configurable: true });
				window.dispatchEvent(event);
			}`,
		});
		loaded = true;
		finishUnsupportedIframe();
		const result = await completion.promise;
		// Native EventTarget reports listener exceptions after dispatch returns.
		// Keep those errors associated with this file before releasing its context.
		await setImmediate();
		return failure ? { ...result, status: failure } : result;
	} catch (error) {
		return { tests: results, status: { status: 1, ...describeError(error) } };
	} finally {
		finished = true;
		clearTimeout(watchdog);
		for (const timer of timers) {
			clearTimeout(timer);
		}
		process.off('uncaughtException', onError);
		process.off('unhandledRejection', onError);
	}
}

function copyTest(test: WPTTestResult): WPTTestResult {
	return { name: test.name, status: test.status, message: test.message, stack: test.stack };
}

function describeError(error: unknown): { message: string; stack?: string } {
	if (error && typeof error === 'object' && 'message' in error) {
		return {
			message: String(error.message),
			stack: 'stack' in error ? String(error.stack) : undefined,
		};
	}
	return { message: String(error) };
}
