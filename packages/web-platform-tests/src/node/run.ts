import { readFile } from 'node:fs/promises';
import { clearTimeout, setInterval, setTimeout } from 'node:timers';
import { setImmediate } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Script } from 'node:vm';
import type { WPTConfig } from '../config.ts';
import { selectsTest } from '../vitest/selection.ts';
import { populateDocument } from './document.ts';
import { installNamedProperties } from './named-properties.ts';
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
	timeout(): void;
	add_test_state_callback(callback: (test: WPTTest) => void): void;
	add_result_callback(callback: (test: WPTTest) => void): void;
	add_completion_callback(callback: (tests: WPTTest[], status: WPTHarnessStatus) => void): void;
}

class WPTExecutionError extends Error {}

const enqueueMicrotask = globalThis.queueMicrotask;

/** Execute one upstream file in a disposable worker, sharing its consumer's realm. */
export async function runWPTFile({
	file,
	sourceRoot,
	config,
	deadline = Date.now() + (config.timeout ?? 15_000),
}: {
	file: string;
	sourceRoot: string;
	config: WPTConfig;
	deadline?: number;
}): Promise<WPTFileResult> {
	const results: WPTTestResult[] = [];
	const timers = new Set<ReturnType<typeof setTimeout>>();
	const completion = Promise.withResolvers<WPTFileResult>();
	let watchdog: ReturnType<typeof setTimeout> | undefined;
	let restoreNamedProperties: (() => void) | undefined;
	let finished = false;
	let failure: WPTHarnessStatus | undefined;
	let harnessStatus: WPTHarnessStatus | undefined;
	const fail = (error: unknown, status = 1): void => {
		if (finished) {
			return;
		}
		failure ??= { status, ...describeError(error) };
		completion.resolve({ tests: results, status: failure });
	};
	let onError = (error: unknown): void => fail(error);
	let onRejection = (reason: unknown): void => fail(reason);
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
		const scope = globalThis as unknown as Record<string, unknown>;
		const window = new Window(scope);
		const execute = (script: SourceScript): unknown =>
			new Script(script.code, {
				filename: script.file,
				lineOffset: script.lineOffset,
				columnOffset: script.columnOffset,
			}).runInThisContext({ timeout: Math.max(1, deadline - Date.now()) });
		const invoke = (callback: (...args: unknown[]) => void, args: unknown[]): void => {
			if (!finished) {
				try {
					callback.apply(scope, args);
				} catch (error) {
					onError(error);
				}
			}
		};
		const globals = {
			...config.globals,
			window: scope,
			self: scope,
			console,
			// Delegate events to the fixture window while exposing the worker global to listeners.
			addEventListener: window.addEventListener.bind(window),
			removeEventListener: window.removeEventListener.bind(window),
			dispatchEvent: window.dispatchEvent.bind(window),
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
				enqueueMicrotask(() => invoke(callback, []));
			},
		};
		for (const [name, value] of Object.entries(globals)) {
			// Node exposes some globals, such as navigator, through getter-only accessors.
			Object.defineProperty(scope, name, {
				value,
				writable: true,
				enumerable: true,
				configurable: true,
			});
		}
		scope.clearInterval = scope.clearTimeout;
		// Upstream supplies its shell environment, assertions, scheduling, and cleanup.
		// Keep its environment view in shell mode, including later title/stack lookups.
		// Test scripts still see the actual window and document through self.
		scope.self = new Proxy(
			{},
			{
				get: (_, key) => Reflect.get(scope, key),
				set: (_, key, value) => Reflect.set(scope, key, value),
				has: (_, key) => key !== 'document' && Reflect.has(scope, key),
			},
		);
		execute({ file: harnessFile, code: harnessCode });
		scope.self = scope;
		const harness = scope as unknown as Harness;
		harness.setup({ output: false });
		onError = (error): void => {
			const event = new Event('error', { cancelable: true });
			Object.defineProperties(event, {
				error: { value: error },
				message: { value: describeError(error).message },
			});
			// Let upstream's error handler honor allow_uncaught_exception and let
			// EventWatcher observe native listener errors just as window errors.
			window.dispatchEvent(event);
		};
		onRejection = (reason): void => {
			const event = new Event('unhandledrejection', { cancelable: true });
			Object.defineProperty(event, 'reason', { value: reason });
			window.dispatchEvent(event);
		};
		process.on('uncaughtException', onError);
		process.on('unhandledRejection', onRejection);
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
			enqueueMicrotask(finishUnsupportedIframe);
		});
		harness.add_completion_callback((tests, status) => {
			harnessStatus = status;
			completion.resolve({
				tests: Array.from(tests, copyTest),
				status: { status: status.status, message: status.message, stack: status.stack },
			});
		});
		const document = config.createDocument() as Document;
		Object.defineProperty(scope, 'document', { value: document, enumerable: true });
		Object.defineProperty(document, 'defaultView', {
			get: () => scope,
			enumerable: true,
			configurable: true,
		});
		if (source.title !== undefined) {
			scope.META_TITLE = source.title;
		}
		populateDocument(document, source.html);
		restoreNamedProperties = installNamedProperties(scope, document);
		watchdog = setTimeout(
			() => {
				// Upstream retains any earlier harness error when timing out pending tests.
				try {
					harness.timeout();
				} catch (error) {
					fail(error);
				}
				if (!harnessStatus) {
					fail(new WPTExecutionError(`WPT file did not complete within ${timeout}ms: ${file}`), 2);
				}
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
		const status = failure ?? harnessStatus ?? result.status;
		return {
			...result,
			status: { status: status.status, message: status.message, stack: status.stack },
		};
	} catch (error) {
		return { tests: results, status: { status: 1, ...describeError(error) } };
	} finally {
		finished = true;
		clearTimeout(watchdog);
		for (const timer of timers) {
			clearTimeout(timer);
		}
		process.off('uncaughtException', onError);
		process.off('unhandledRejection', onRejection);
		restoreNamedProperties?.();
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
