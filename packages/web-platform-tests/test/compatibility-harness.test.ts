/// <reference lib="dom" />
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { CompatibilityRunner, CompatibilityModule } from '../src/shared/context.ts';
import { withFixture, type DOMDocumentOptions } from '../src/shared/fixture.ts';
import { registry } from '../src/shared/registry.ts';
import {
	CompatibilityConfigurationError,
	testDOMCompatibility,
	type WPTConfig,
} from '../src/shared/test-dom-compatibility.ts';
import { MissingGlobalError } from '../src/shared/globals.ts';
import { MissingInputError, type DOMInputDriver } from '../src/shared/input-driver.ts';

const { Event, EventTarget } = globalThis;
// Harness-only factory token: no shared DOM behavior is implemented here.
class HarnessDocument {
	createElement(): EventTarget {
		return new EventTarget();
	}
}

function sourceFiles(directory: URL): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory())
			return sourceFiles(new URL(`${entry.name}/`, directory)).map(
				(file) => `${entry.name}/${file}`,
			);
		return entry.isFile() ? [entry.name] : [];
	});
}

function only(...sources: string[]): Pick<WPTConfig, 'include' | 'exclude'> {
	return {
		exclude: { '**': true },
		include: Object.fromEntries(sources.map((source) => [source, true])),
	};
}

function recordingRunner(): {
	runner: CompatibilityRunner;
	suites: string[];
	todos: string[];
	tests: { source: string; name: string; run(): void | Promise<void> }[];
} {
	const suites: string[] = [];
	const todos: string[] = [];
	const tests: { source: string; name: string; run(): void | Promise<void> }[] = [];
	const path: string[] = [];
	return {
		suites,
		todos,
		tests,
		runner: {
			expect,
			describe(name, registerSuite) {
				path.push(name);
				suites.push(name);
				try {
					registerSuite();
				} finally {
					path.pop();
				}
			},
			it: Object.assign(
				(name: string, run: () => void | Promise<void>) => {
					tests.push({ source: path.join('/'), name, run });
				},
				{
					todo(name: string) {
						todos.push(name);
					},
				},
			),
		},
	};
}

function register(config?: WPTConfig): ReturnType<typeof recordingRunner> {
	const recording = recordingRunner();
	testDOMCompatibility({
		config,
		runner: recording.runner,

		create: () => expect.fail('Registration must not create a document'),
	});
	return recording;
}

function catalogue(): { source: string; name: string }[] {
	const cases: { source: string; name: string }[] = [];
	const modules: Record<string, CompatibilityModule> = registry;
	for (const [source, module] of Object.entries(modules)) {
		let count = 0;
		module.register({
			runner: recordingRunner().runner,
			test(name) {
				cases.push({ source, name });
				count++;
			},
		});
		expect(count, source).toBeGreaterThan(0);
	}
	return cases;
}

const onceSource = 'dom/events/AddEventListenerOptions-once.any.js';
const onceName = 'Once listener should be invoked only once';

describe('compatibility catalogue', () => {
	it('infers every registered source from its filename and keeps all source modules reachable', () => {
		const directory = new URL('../src/', import.meta.url);
		const allFiles = sourceFiles(directory);
		const files = allFiles.filter((file) => file.endsWith('.ts'));
		const entrypoints = files
			.filter(
				(file) =>
					file.startsWith('wpt/') &&
					/^export function register\(/m.test(readFileSync(new URL(file, directory), 'utf8')),
			)
			.toSorted();
		expect(files.filter((file) => /\.(?:test|spec)\.ts$/.test(file))).toEqual([]);
		expect(entrypoints.map((file) => file.slice('wpt/'.length, -'.ts'.length))).toEqual(
			Object.keys(registry).toSorted(),
		);
		for (const [source, module] of Object.entries(registry)) {
			expect(module.register, source).toBeTypeOf('function');
			expect(source, 'Sources must be relative upstream paths').not.toMatch(/^(?:\/|\.\.)/);
		}
		const knownFiles = new Set(allFiles);
		const reachable = new Set<string>();
		const pending = ['index.ts', ...entrypoints];
		while (pending.length) {
			const file = pending.pop()!;
			if (reachable.has(file)) continue;
			reachable.add(file);
			const source = readFileSync(new URL(file, directory), 'utf8');
			for (const match of source.matchAll(/\b(?:from\s*|import\s*\(\s*)['"](\.[^'"]+\.ts)['"]/g)) {
				const imported = new URL(match[1]!, new URL(file, directory));
				if (!imported.href.startsWith(directory.href)) continue;
				const relative = decodeURIComponent(imported.href.slice(directory.href.length));
				if (knownFiles.has(relative)) pending.push(relative);
			}
		}
		for (const file of files) {
			expect(
				reachable.has(file),
				`${file} must be reachable from the package API or a WPT test`,
			).toBe(true);
		}
	});
	it('registers every adapted case by default and groups each source exactly once', () => {
		const expected = catalogue();
		const recording = register();
		const identities = expected.map((test) => `${test.source}\0${test.name}`);
		expect(new Set(identities).size).toBe(identities.length);
		expect(recording.tests.map(({ source, name }) => `${source}\0${name}`).toSorted()).toEqual(
			identities.toSorted(),
		);
		expect(recording.suites.toSorted()).toEqual(
			[...new Set(expected.map((test) => test.source))].toSorted(),
		);
	});
	it('keeps implementation imports and host hooks outside shared tests', () => {
		const directory = new URL('../src/', import.meta.url);
		for (const file of sourceFiles(directory).filter((candidate) => candidate.endsWith('.ts'))) {
			const source = readFileSync(new URL(file, directory), 'utf8');
			expect(source, file).not.toMatch(/from\s+['"][^'"]*(?:\/src\/|@bomb\.sh\/dom)['"]/);
			expect(source, file).not.toMatch(
				/\b(?:focusManager|controlState|onInvalidate|getEventParent|setMarkupParser|reportError)\b/,
			);
			expect(source, file).not.toMatch(
				/\.(?:childNodes|children|attributes|labels)\.(?:map|at|filter|find)\(/,
			);
		}
	});
});

describe('WPT include and exclude selection', () => {
	it('runs the full catalogue when config is omitted or explicitly undefined', () => {
		const omitted = recordingRunner();
		testDOMCompatibility({
			runner: omitted.runner,

			create: () => expect.fail('Registration must not create a document'),
		});
		const explicit = register(undefined);
		const identities = (tests: typeof omitted.tests): string[] =>
			tests.map(({ source, name }) => `${source}\0${name}`).toSorted();
		expect(omitted.tests).toHaveLength(catalogue().length);
		expect(identities(explicit.tests)).toEqual(identities(omitted.tests));
		expect(explicit.suites).toEqual(omitted.suites);
		expect(omitted.todos).toEqual([]);
		expect(explicit.todos).toEqual([]);
	});
	it('registers a todo when all cases are excluded without constructing fixtures or empty suites', () => {
		const recording = register({ exclude: { '**': true } });
		expect(recording.suites).toEqual([]);
		expect(recording.tests).toEqual([]);
		expect(recording.todos).toEqual(['implement DOM features and enable their WPT cases']);
	});
	it('keeps unmatched cases enabled when an include list is present', () => {
		const all = register();
		const included = register({ include: { [onceSource]: true } });
		expect(included.tests.map(({ source, name }) => [source, name])).toEqual(
			all.tests.map(({ source, name }) => [source, name]),
		);
	});
	it('includes a file inside a broadly excluded directory', () => {
		const recording = register(only(onceSource));
		expect(recording.suites).toEqual([onceSource]);
		expect(recording.tests.map((test) => test.name)).toContain(onceName);
		expect(recording.todos).toEqual([]);
	});
	it('lets a broad include override a more specific case exclusion', () => {
		const recording = register({
			exclude: { [onceSource]: [onceName] },
			include: { 'dom/events/**': true },
		});
		expect(recording.tests).toContainEqual(
			expect.objectContaining({ source: onceSource, name: onceName }),
		);
	});
	it('lets exact case includes override whole-file exclusions without enabling neighboring cases', () => {
		const recording = register({ exclude: { '**': true }, include: { [onceSource]: [onceName] } });
		expect(recording.tests.map(({ source, name }) => ({ source, name }))).toEqual([
			{ source: onceSource, name: onceName },
		]);
	});
	it('excludes exact case names and retains the remaining cases from that source', () => {
		const all = register();
		const recording = register({ exclude: { [onceSource]: [onceName] } });
		expect(recording.tests).toHaveLength(all.tests.length - 1);
		expect(recording.tests).not.toContainEqual(
			expect.objectContaining({ source: onceSource, name: onceName }),
		);
		expect(recording.suites).toContain(onceSource);
	});
	it('matches directory globs recursively while single stars stay within a directory', () => {
		const all = register();
		const direct = register(only('shadow-dom/*'));
		expect(direct.tests.map(({ source, name }) => [source, name])).toEqual(
			all.tests
				.filter((test) => /^shadow-dom\/[^/]+$/.test(test.source))
				.map(({ source, name }) => [source, name]),
		);
		const recursive = register(only('shadow-dom/**'));
		expect(recursive.tests.map(({ source, name }) => [source, name])).toEqual(
			all.tests
				.filter((test) => test.source.startsWith('shadow-dom/'))
				.map(({ source, name }) => [source, name]),
		);
		expect(recursive.tests.length).toBeGreaterThan(direct.tests.length);
	});
	it('allows a recursive glob to match zero directories', () => {
		const recording = register(only('dom/events/**/AddEventListenerOptions-once.any.js'));
		expect(recording.suites).toEqual([onceSource]);
	});
	it('matches regex case names without consuming caller state across cases or registrations', () => {
		const pattern = /Once listener/g;
		pattern.lastIndex = 8;
		const config: WPTConfig = { exclude: { '**': true }, include: { [onceSource]: [pattern] } };
		const first = register(config);
		const second = register(config);
		const expected = register(only(onceSource)).tests.filter((test) =>
			test.name.includes('Once listener'),
		);
		expect(first.tests.map((test) => test.name)).toEqual(expected.map((test) => test.name));
		expect(second.tests.map((test) => test.name)).toEqual(expected.map((test) => test.name));
		expect(pattern.lastIndex).toBe(8);
	});
	it('applies regex exclusions to case names', () => {
		const all = register();
		const recording = register({ exclude: { [onceSource]: [/^Once listener/] } });
		expect(recording.tests.map(({ source, name }) => [source, name])).toEqual(
			all.tests
				.filter((test) => test.source !== onceSource || !test.name.startsWith('Once listener'))
				.map(({ source, name }) => [source, name]),
		);
	});
	it.each([
		{ include: { 'missing/upstream.html': true } },
		{ exclude: { 'missing/upstream.html': true } },
		{ include: { [onceSource]: ['no such upstream case'] } },
		{ exclude: { [onceSource]: [/no such upstream case/] } },
		{ include: { [onceSource]: [onceName, 'no such upstream case'] } },
		{ include: { [onceSource]: ['Once listener*'] } },
		{ include: { '': true } },
		{ exclude: { [onceSource]: [] } },
		{ include: { [onceSource]: false } },
		{ exclude: { [onceSource]: [3] } },
		{ include: [] },
		{ exclude: null },
	])('rejects invalid or stale selectors before registering suites: %j', (config) => {
		const recording = recordingRunner();
		expect(() =>
			testDOMCompatibility({
				config: config as unknown as WPTConfig,
				runner: recording.runner,

				create: () => expect.fail('Invalid selection must not create a document'),
			}),
		).toThrow(CompatibilityConfigurationError);
		expect(recording.suites).toEqual([]);
		expect(recording.tests).toEqual([]);
		expect(recording.todos).toEqual([]);
	});
	it('selects insertion cases independently and leaves missing APIs to fail during execution', async () => {
		const source = 'dom/nodes/Node-insertBefore.html';
		const name =
			'Calling insertBefore with a reference child whose parent is not the context node must throw a NotFoundError.';
		const recording = recordingRunner();
		testDOMCompatibility({
			runner: recording.runner,
			config: { exclude: { '**': true }, include: { [source]: [name] }, globals: { DOMException } },
			create: () => ({}),
		});
		expect(recording.suites).toEqual([source]);
		expect(recording.tests).toHaveLength(1);
		await expect(recording.tests[0]!.run()).rejects.toThrow(TypeError);
	});
	it('registers a previously conditional shadow case without enabling other sources', () => {
		const source = 'inert/inert-in-shadow-dom.html';
		const recording = register(only(source));
		expect(recording.suites).toEqual([source]);
		expect(recording.tests.map((test) => test.name)).toEqual([
			'inert on Shadow host affects content in shadow',
		]);
	});
});

describe('registration and fixture lifetime', () => {
	it('uses global bindings supplied in the configuration', async () => {
		const recording = recordingRunner();
		testDOMCompatibility({
			runner: recording.runner,
			config: { ...only(onceSource), globals: { Event, EventTarget } },
			create: () => ({}),
		});
		expect(recording.tests.length).toBeGreaterThan(0);
		for (const test of recording.tests) await test.run();
	});
	it('reports missing configuration globals only when a selected case reads them', async () => {
		const recording = recordingRunner();
		testDOMCompatibility({
			runner: recording.runner,
			config: only(onceSource),
			create: () => ({}),
		});
		expect(recording.suites).toEqual([onceSource]);
		await expect(recording.tests[0]!.run()).rejects.toThrow(new MissingGlobalError('EventTarget'));
	});
	it('accepts a partial document and preserves its actual type for setup and disposal', async () => {
		class EventOnlyDocument {
			createElement(): EventTarget {
				return new EventTarget();
			}
		}
		const recording = recordingRunner();
		const created: EventOnlyDocument[] = [];
		const disposed: EventOnlyDocument[] = [];
		testDOMCompatibility({
			runner: recording.runner,
			config: {
				...only(
					'dom/events/EventTarget-addEventListener.any.js',
					'dom/events/EventTarget-removeEventListener.any.js',
					'dom/events/EventTarget-add-remove-listener.any.js',
					'dom/events/AddEventListenerOptions-once.any.js',
				),
				globals(document) {
					expectTypeOf(document).toEqualTypeOf<EventOnlyDocument>();
					expect(document).toBe(created.at(-1));
					return { Event, EventTarget, window: new EventTarget() };
				},
			},
			create() {
				const document = new EventOnlyDocument();
				created.push(document);
				return document;
			},

			dispose(document) {
				expectTypeOf(document).toEqualTypeOf<EventOnlyDocument>();
				disposed.push(document);
			},
		});
		expect(created).toHaveLength(0);
		expect(recording.tests).toHaveLength(7);
		for (const test of recording.tests) await test.run();
		expect(disposed).toEqual(created);
	});
	it('fails at the tested operation when a required method is missing', async () => {
		await expect(
			withFixture(
				{
					create: () => ({ createElement: () => ({ elements: [] }) }),
					globals: {},
				},
				({ document }) => {
					const controls = document.createElement('form').elements;
					expect(controls.item(0)).toBeNull();
				},
			),
		).rejects.toThrow(TypeError);
	});
	it('uses idealized types without inspecting or wrapping the fixture', async () => {
		let propertyReads = 0;
		const original = {
			get body() {
				propertyReads++;
				return null;
			},
		};
		await withFixture(
			{ create: () => original, globals: { Event } },
			({ document, Event: FixtureEvent }) => {
				expectTypeOf(document).toEqualTypeOf<Document>();
				expectTypeOf(FixtureEvent).toEqualTypeOf<typeof globalThis.Event>();
				expect(document).toBe(original);
				expect(FixtureEvent).toBe(Event);
				expect(propertyReads).toBe(0);
			},
		);
	});
	it('requires only the global requested by a case', async () => {
		await withFixture({ create: () => null, globals: { Event } }, (fixture) => {
			expect(() => fixture.MutationObserver).toThrow('globals.MutationObserver');
			expect(fixture.Event).toBe(Event);
		});
	});
	it('reads supplied global getters lazily and preserves their receiver and identity', async () => {
		let reads = 0;
		const bindings = {
			get Event() {
				expect(this).toBe(bindings);
				reads++;
				return Event;
			},
		};
		await withFixture({ create: () => null, globals: bindings }, (fixture) => {
			expect(reads).toBe(0);
			const { Event: FixtureEvent } = fixture;
			expect(FixtureEvent).toBe(Event);
			expect(reads).toBe(1);
		});
	});
	it('throws when a destructured global is absent or undefined, without a host fallback', async () => {
		for (const globals of [{}, { Event: undefined }]) {
			await expect(
				withFixture({ create: () => null, globals }, ({ Event: _Event }) => {
					expect.fail('Destructuring a missing global must fail before the case runs');
				}),
			).rejects.toThrow(new MissingGlobalError('Event'));
		}
	});
	it('retains callback failures while preserving the callback receiver and result', async () => {
		const failure = new Error('callback assertion failed');
		const receiver = { value: 3 };
		await expect(
			withFixture({ create: () => null, globals: {} }, ({ step }) => {
				const callback = step(function (this: typeof receiver, increment: number) {
					return this.value + increment;
				});
				expect(callback.call(receiver, 2)).toBe(5);
				const listener = step(() => {
					throw failure;
				});
				expect(() => listener()).not.toThrow();
			}),
		).rejects.toBe(failure);
	});
	it('resolves globals per fresh document and disposes fixtures after failure', async () => {
		const recording = recordingRunner();
		const created: HarnessDocument[] = [];
		const resolved: HarnessDocument[] = [];
		const disposed: HarnessDocument[] = [];
		testDOMCompatibility({
			runner: recording.runner,
			config: {
				...only(
					'dom/events/EventTarget-addEventListener.any.js',
					'dom/events/EventTarget-removeEventListener.any.js',
					'dom/events/EventTarget-add-remove-listener.any.js',
					'dom/events/AddEventListenerOptions-once.any.js',
				),
				globals(document) {
					resolved.push(document);
					return {};
				},
			},
			create() {
				const document = new HarnessDocument();
				created.push(document);
				return document;
			},

			dispose(document) {
				disposed.push(document);
			},
		});
		expect(created).toHaveLength(0);
		expect(resolved).toHaveLength(0);
		for (const test of recording.tests)
			await expect(test.run()).rejects.toThrow(/globals\.(EventTarget|window)/);
		expect(created.length).toBe(recording.tests.length);
		expect(resolved).toEqual(created);
		expect(disposed).toEqual(created);
		expect(new Set(created).size).toBe(created.length);
	});
});

describe('fixture cleanup failures', () => {
	it('runs every cleanup and disposal while preserving assertion and cleanup failures', async () => {
		const calls: string[] = [];
		const assertionFailure = new Error('assertion');
		const cleanupFailure = new Error('cleanup');
		const operation = withFixture(
			{
				create: () => new HarnessDocument(),
				globals: {},
				dispose() {
					calls.push('dispose');
				},
			},
			({ cleanup }) => {
				cleanup(() => {
					calls.push('first');
				});
				cleanup(() => {
					calls.push('second');
					throw cleanupFailure;
				});
				throw assertionFailure;
			},
		);
		await expect(operation).rejects.toMatchObject({ errors: [assertionFailure, cleanupFailure] });
		expect(calls).toEqual(['second', 'first', 'dispose']);
	});
	it('disposes a document when its globals resolver throws', async () => {
		let disposed = 0;
		const failure = new Error('globals');
		await expect(
			withFixture(
				{
					create: () => new HarnessDocument(),
					globals() {
						throw failure;
					},
					dispose() {
						disposed++;
					},
				},
				() => expect.fail('Case must not start'),
			),
		).rejects.toBe(failure);
		expect(disposed).toBe(1);
	});
});

describe('host input fixture', () => {
	it('registers selected input cases without a driver and fails only when they execute', async () => {
		const recording = recordingRunner();
		let disposed = 0;
		testDOMCompatibility({
			runner: recording.runner,
			config: only('uievents/keyboard/keyboardevent-composed.html'),
			create: () => ({}),

			dispose() {
				disposed++;
			},
		});
		expect(recording.suites).toEqual(['uievents/keyboard/keyboardevent-composed.html']);
		expect(recording.tests.length).toBeGreaterThan(0);
		await expect(recording.tests[0]!.run()).rejects.toBeInstanceOf(MissingInputError);
		expect(disposed).toBe(1);
	});

	it('does not construct an input session for cases that do not use it', async () => {
		await withFixture(
			{
				create: () => ({ version: 'partial' }),
				globals: {},
				input() {
					return expect.fail('Unused input must not be constructed');
				},
			},
			({ document }) => expect(document).toEqual({ version: 'partial' }),
		);
	});

	it('constructs one session per case with the original inferred document type', async () => {
		const subject = { host: 'test' };
		const constructed: (typeof subject)[] = [];
		let resets = 0;
		for (let index = 0; index < 2; index++) {
			await withFixture(
				{
					create: () => subject,
					globals: {},
					input(document) {
						expectTypeOf(document).toEqualTypeOf<typeof subject>();
						constructed.push(document);
						return {
							async reset() {
								resets++;
							},
						};
					},
				},
				(fixture) => expect(fixture.input).toBe(fixture.input),
			);
		}
		expect(constructed).toEqual([subject, subject]);
		expect(constructed[0]).toBe(subject);
		expect(resets).toBe(2);
	});

	it('awaits host input before advancing to the next action and preserves method receivers', async () => {
		const calls: string[] = [];
		let release: (() => void) | undefined;
		const down = new Promise<void>((resolve) => {
			release = resolve;
		});
		const keyboard = {
			async keyDown(key: string) {
				expect(this).toBe(keyboard);
				calls.push(`down:${key}`);
				await down;
			},
			async keyUp(key: string) {
				expect(this).toBe(keyboard);
				calls.push(`up:${key}`);
			},
		};
		await withFixture(
			{
				create: () => null,
				globals: {},
				input: () => ({
					keyboard,
					async reset() {
						calls.push('reset');
					},
				}),
			},
			async ({ input }) => {
				const pressed = input.press('Enter');
				await Promise.resolve();
				expect(calls).toEqual(['down:Enter']);
				release!();
				await pressed;
				expect(calls).toEqual(['down:Enter', 'up:Enter']);
			},
		);
		expect(calls.at(-1)).toBe('reset');
	});

	it('releases held input before removing targets and disposes after reset failures', async () => {
		const calls: string[] = [];
		const assertion = new Error('case failure');
		const reset = new Error('reset failure');
		const driver: DOMInputDriver = {
			keyboard: {
				async keyDown() {
					calls.push('down');
				},
				async keyUp() {},
			},
			async reset() {
				calls.push('reset');
				throw reset;
			},
		};
		await expect(
			withFixture(
				{
					create: () => null,
					globals: {},
					input: () => driver,
					dispose() {
						calls.push('dispose');
					},
				},
				async ({ input, cleanup }) => {
					cleanup(() => {
						calls.push('remove');
					});
					await input.keyDown(' ');
					throw assertion;
				},
			),
		).rejects.toMatchObject({ errors: [assertion, reset] });
		expect(calls).toEqual(['down', 'reset', 'remove', 'dispose']);
	});

	it('reports missing capabilities without falling back to synthetic events', async () => {
		let resets = 0;
		await withFixture(
			{
				create: () => null,
				globals: {},
				input: () => ({
					async reset() {
						resets++;
					},
				}),
			},
			async ({ input }) => {
				await expect(input.press('Enter')).rejects.toThrow('input.keyboard');
				await expect(input.insertText('text')).rejects.toThrow('input.text');
				await expect(input.down()).rejects.toThrow('input.mouse');
			},
		);
		expect(resets).toBe(1);
		await expect(
			withFixture({ create: () => null, globals: {} }, ({ input }) => input.press('Enter')),
		).rejects.toBeInstanceOf(MissingInputError);
	});

	it('disposes fixtures when the input factory fails', async () => {
		const failure = new Error('input setup');
		let disposed = false;
		await expect(
			withFixture(
				{
					create: () => null,
					globals: {},
					input() {
						throw failure;
					},
					dispose() {
						disposed = true;
					},
				},
				({ input }) => input.press('Enter'),
			),
		).rejects.toBe(failure);
		expect(disposed).toBe(true);
	});
});

describe('requested document creation', () => {
	it('forwards the exact request and awaits creation and disposal after a case fails', async () => {
		const request: DOMDocumentOptions = {
			contentType: 'application/xhtml+xml',
			content: '<html xmlns="http://www.w3.org/1999/xhtml"><body id="target"/></html>',
			fragment: 'target',
		};
		const created = Promise.withResolvers<HarnessDocument>();
		const disposalStarted = Promise.withResolvers<void>();
		const disposalFinished = Promise.withResolvers<void>();
		const subject = new HarnessDocument();
		const calls: string[] = [];
		const failure = new Error('case failure');
		let settled = false;
		const operation = withFixture(
			{
				document: request,
				create(options) {
					expect(options).toBe(request);
					calls.push('create');
					return created.promise;
				},
				globals(document) {
					expectTypeOf(document).toEqualTypeOf<HarnessDocument>();
					expect(document).toBe(subject);
					calls.push('globals');
					return {};
				},
				async dispose(document) {
					expectTypeOf(document).toEqualTypeOf<HarnessDocument>();
					expect(document).toBe(subject);
					calls.push('dispose started');
					disposalStarted.resolve();
					await disposalFinished.promise;
					calls.push('dispose finished');
				},
			},
			({ document, cleanup }) => {
				expect(document).toBe(subject);
				calls.push('case');
				cleanup(() => {
					calls.push('cleanup');
				});
				throw failure;
			},
		);
		const result = operation.catch((error: unknown) => {
			settled = true;
			return error;
		});
		expect(calls).toEqual(['create']);
		created.resolve(subject);
		await disposalStarted.promise;
		expect(calls).toEqual(['create', 'globals', 'case', 'cleanup', 'dispose started']);
		expect(settled).toBe(false);
		disposalFinished.resolve();
		expect(await result).toBe(failure);
		expect(calls.at(-1)).toBe('dispose finished');
	});
	it('does not start a case or dispose an absent document when asynchronous creation rejects', async () => {
		const failure = new Error('document creation failed');
		const calls: string[] = [];
		await expect(
			withFixture(
				{
					async create(options) {
						expect(options).toBeUndefined();
						calls.push('create');
						await Promise.resolve();
						throw failure;
					},
					globals() {
						calls.push('globals');
						return {};
					},
					dispose() {
						calls.push('dispose');
					},
				},
				() => {
					calls.push('case');
				},
			),
		).rejects.toBe(failure);
		expect(calls).toEqual(['create']);
	});
	it('uses fresh asynchronous documents for registered cases without document requests', async () => {
		const recording = recordingRunner();
		const created: HarnessDocument[] = [],
			disposed: HarnessDocument[] = [];
		testDOMCompatibility({
			runner: recording.runner,
			config: {
				...only(
					'dom/events/EventTarget-addEventListener.any.js',
					'dom/events/EventTarget-removeEventListener.any.js',
					'dom/events/EventTarget-add-remove-listener.any.js',
					'dom/events/AddEventListenerOptions-once.any.js',
				),
				globals(document) {
					expectTypeOf(document).toEqualTypeOf<HarnessDocument>();
					expect(document).toBe(created.at(-1));
					return { Event, EventTarget, window: new EventTarget() };
				},
			},
			async create(request: DOMDocumentOptions | undefined) {
				expect(request).toBeUndefined();
				await Promise.resolve();
				const document = new HarnessDocument();
				created.push(document);
				return document;
			},
			async dispose(document) {
				await Promise.resolve();
				disposed.push(document);
			},
		});
		expect(created).toHaveLength(0);
		for (const test of recording.tests) await test.run();
		expect(created).toHaveLength(recording.tests.length);
		expect(new Set(created).size).toBe(recording.tests.length);
		expect(disposed).toEqual(created);
	});
});
