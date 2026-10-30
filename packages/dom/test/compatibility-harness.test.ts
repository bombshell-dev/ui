import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, expectTypeOf, it } from 'vitest';
import type { StandardSchemaV1 } from '@standard-schema/spec';
const { Event, EventTarget } = globalThis;
// Harness-only factory token: no shared DOM behavior is implemented here.
class Document {
	createElement(): EventTarget {
		return new EventTarget();
	}
}
import { featureShape as domFeatures } from '../src/compatibility/features.ts';
import type { CompatibilityRunner } from '../src/compatibility/context.ts';
import {
	domFeaturesSchema,
	featureFile,
	featurePaths,
	featureShape,
	type DOMFeatures,
} from '../src/compatibility/features.ts';
import { withFixture } from '../src/compatibility/fixture.ts';
import { registry } from '../src/compatibility/registry.ts';
import { testDOMCompatibility } from '../src/compatibility/test-dom-compatibility.ts';
import type { DOMDocument } from '../src/compatibility/contracts/nodes.ts';
import type { DOMEventConstructor } from '../src/compatibility/contracts/events.ts';
import { MissingInputError, type DOMInputDriver } from '../src/compatibility/input-driver.ts';

function sourceFiles(directory: URL): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		if (entry.isDirectory())
			return sourceFiles(new URL(`${entry.name}/`, directory)).map(
				(file) => `${entry.name}/${file}`,
			);
		return entry.isFile() ? [entry.name] : [];
	});
}

function flags(enabled: string[] = []): DOMFeatures {
	const result: DOMFeatures = structuredClone(domFeatures);
	function visit(value: object, prefix = ''): void {
		for (const [key, child] of Object.entries(value)) {
			const path = prefix ? `${prefix}.${key}` : key;
			if (typeof child === 'boolean') Reflect.set(value, key, enabled.includes(path));
			else visit(child, path);
		}
	}
	visit(result);
	return result;
}

function recordingRunner(): {
	runner: CompatibilityRunner;
	suites: string[];
	tests: { name: string; run(): void | Promise<void> }[];
} {
	const suites: string[] = [];
	const tests: { name: string; run(): void | Promise<void> }[] = [];
	const path: string[] = [];
	return {
		suites,
		tests,
		runner: {
			expect,
			describe(name, register) {
				path.push(name);
				suites.push(path.join('.'));
				try {
					register();
				} finally {
					path.pop();
				}
			},
			it(name, run) {
				tests.push({ name: [...path, name].join('.'), run });
			},
		},
	};
}

describe('compatibility catalogue', () => {
	it('has exactly one registered kebab-case module per schema leaf, outside runner discovery', () => {
		const directory = new URL('../src/compatibility/', import.meta.url);
		const allFiles = sourceFiles(directory);
		const files = allFiles
			.filter(
				(file) => file.endsWith('.ts') && file.includes('/') && !file.startsWith('contracts/'),
			)
			.toSorted();
		const paths = featurePaths().toSorted();
		expect(allFiles.filter((file) => /\.(?:test|spec)\.ts$/.test(file))).toEqual([]);
		expect(Object.keys(registry).toSorted()).toEqual(paths);
		expect(files).toEqual(paths.map(featureFile).toSorted());
		for (const file of files)
			expect(file).toMatch(/^(?:[a-z]+(?:-[a-z]+)*\/)*[a-z]+(?:-[a-z]+)*\.ts$/);
	});
	it('registers substantive tests for every leaf and provides specification provenance', () => {
		for (const [path, leaf] of Object.entries(registry)) {
			let cases = 0;
			leaf.register({
				runner: recordingRunner().runner,
				test() {
					cases++;
				},
			});
			expect(cases, path).toBeGreaterThan(0);
			expect(leaf.spec, path).toMatch(
				/^https:\/\/(?:dom\.spec\.whatwg\.org|html\.spec\.whatwg\.org|w3c\.github\.io|(?:www\.)?w3\.org|drafts\.csswg\.org)\//,
			);
		}
	});
	it('keeps implementation imports and host hooks outside shared tests', () => {
		const directory = new URL('../src/compatibility/', import.meta.url);
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

describe('exhaustive Standard Schema validation', () => {
	it('accepts every explicit true/false decision and has an accurate inferred type', async () => {
		expectTypeOf<
			StandardSchemaV1.InferOutput<typeof domFeaturesSchema>
		>().toEqualTypeOf<DOMFeatures>();
		const result = await domFeaturesSchema['~standard'].validate(domFeatures);
		expect(result.issues).toBeUndefined();
		if (!result.issues) expect(result.value).toBe(domFeatures);
		expect(await domFeaturesSchema['~standard'].validate(flags())).toEqual({ value: flags() });
	});
	it('rejects missing branches, leaves, unknown keys, and non-booleans without filling defaults', async () => {
		for (const value of [
			null,
			[],
			{},
			{ ...domFeatures, node: {} },
			{ ...domFeatures, extra: true },
			{ ...domFeatures, node: { ...domFeatures.node, append: 1 } },
		]) {
			const result = await domFeaturesSchema['~standard'].validate(value);
			expect(result.issues?.length).toBeGreaterThan(0);
		}
		const incomplete = structuredClone(domFeatures);
		Reflect.deleteProperty(incomplete.events.dispatch, 'capture');
		const result = await domFeaturesSchema['~standard'].validate(incomplete);
		expect(result.issues).toContainEqual(
			expect.objectContaining({ path: ['events', 'dispatch', 'capture'] }),
		);
		expect(Object.hasOwn(incomplete.events.dispatch, 'capture')).toBe(false);
		const extra = { ...domFeatures, node: { ...domFeatures.node, surprise: true } };
		const unknown = await domFeaturesSchema['~standard'].validate(extra);
		expect(unknown.issues).toContainEqual(expect.objectContaining({ path: ['node', 'surprise'] }));
		expect(extra.node.surprise).toBe(true);
		const invalid = await domFeaturesSchema['~standard'].validate({
			...domFeatures,
			node: { ...domFeatures.node, append: 1 },
		});
		expect(invalid.issues).toContainEqual(expect.objectContaining({ path: ['node', 'append'] }));
	});
	it('requires the complete structure at compile time', () => {
		// @ts-expect-error Every branch is required, even when no tests are wanted.
		const missing: DOMFeatures = {};
		// @ts-expect-error Capture and the other dispatch leaves cannot be omitted.
		const incomplete: DOMFeatures['events']['dispatch'] = { target: true };
		void missing;
		void incomplete;
		expect(featurePaths(featureShape).length).toBe(Object.keys(registry).length);
	});
});

describe('registration and fixture lifetime', () => {
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
			features: flags(['events.dispatch.target']),
			create() {
				const document = new EventOnlyDocument();
				created.push(document);
				return document;
			},
			globals(document) {
				expectTypeOf(document).toEqualTypeOf<EventOnlyDocument>();
				expect(document).toBe(created.at(-1));
				return { Event };
			},
			dispose(document) {
				expectTypeOf(document).toEqualTypeOf<EventOnlyDocument>();
				disposed.push(document);
			},
		});
		expect(recording.tests).toHaveLength(3);
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
			{ create: () => original, globals: { Event, customVersion: 'test' } },
			({ document, globals }) => {
				expectTypeOf(document).toEqualTypeOf<DOMDocument>();
				expectTypeOf(globals('Event')).toEqualTypeOf<DOMEventConstructor>();
				expectTypeOf(globals('customVersion')).toEqualTypeOf<unknown>();
				expect(document).toBe(original);
				expect(globals('Event')).toBe(Event);
				expect(globals('customVersion')).toBe('test');
				expect(propertyReads).toBe(0);
			},
		);
	});
	it('requires only the global requested by a case', async () => {
		await withFixture({ create: () => null, globals: { available: true } }, ({ globals }) => {
			expect(() => globals('MutationObserver')).toThrow('globals.MutationObserver');
			expect(globals('available')).toBe(true);
		});
	});
	it('registers nothing and constructs nothing when every feature is false', () => {
		const recording = recordingRunner();
		let created = 0;
		testDOMCompatibility({
			runner: recording.runner,
			features: flags(),
			globals: {},
			create() {
				created++;
				return new Document();
			},
		});
		expect(recording.suites).toEqual([]);
		expect(recording.tests).toEqual([]);
		expect(created).toBe(0);
	});
	it('registers target and bubbling without capture or empty unrelated suites', async () => {
		const recording = recordingRunner();
		testDOMCompatibility({
			runner: recording.runner,
			features: flags(['events.dispatch.target', 'events.dispatch.bubbling']),
			globals: { Event },
			create: () => new Document(),
		});
		expect(recording.suites).toEqual([
			'events',
			'events.dispatch',
			'events.dispatch.target',
			'events.dispatch.bubbling',
		]);
		expect(recording.tests.length).toBeGreaterThan(0);
		// Registration shape is independent of any DOM implementation.
	});
	it('rejects unmet prerequisites before registering any suites', () => {
		const recording = recordingRunner();
		expect(() =>
			testDOMCompatibility({
				runner: recording.runner,
				features: flags(['events.dispatch.capture']),
				globals: { Event },
				create: () => new Document(),
			}),
		).toThrow('events.dispatch.capture requires events.dispatch.target');
		expect(recording.suites).toEqual([]);
	});
	it('rejects interaction prerequisites before registering any earlier feature', () => {
		for (const path of ['style.computed', 'focus.transitions', 'input.keyboard.navigation']) {
			const selected = structuredClone(domFeatures);
			const keys = path.split('.');
			let branch: object = selected;
			for (const key of keys.slice(0, -1)) branch = Reflect.get(branch, key) as object;
			Reflect.set(branch, keys.at(-1)!, false);
			const recording = recordingRunner();
			expect(() =>
				testDOMCompatibility({
					runner: recording.runner,
					features: selected,
					create: () => new Document(),
					globals: {},
					input: () => ({ async reset() {} }),
				}),
			).toThrow('requires');
			expect(recording.suites).toEqual([]);
			expect(recording.tests).toEqual([]);
		}
	});
	it('selects focus indication policies independently of trusted events and ordinary input', () => {
		const selected = {
			...domFeatures,
			input: {
				keyboard: { ...domFeatures.input.keyboard, trustedEvents: false, focusVisible: false },
				mouse: { ...domFeatures.input.mouse, trustedEvents: false, focusVisible: false },
			},
		};
		const recording = recordingRunner();
		const register = (): void => {
			testDOMCompatibility({
				runner: recording.runner,
				features: selected,
				create: () => new Document(),
				globals: {},
				input: () => ({ async reset() {} }),
			});
		};
		register();
		expect(recording.suites).toContain('input.keyboard.focusStyles');
		expect(recording.suites).toContain('input.mouse.stateStyles');
		expect(recording.suites).not.toContain('input.keyboard.focusVisible');
		expect(recording.suites).not.toContain('input.mouse.focusVisible');
		selected.input.keyboard.focusVisible = true;
		selected.input.mouse.focusVisible = true;
		register();
		expect(recording.suites).toContain('input.keyboard.focusVisible');
		expect(recording.suites).toContain('input.mouse.focusVisible');
		expect(recording.suites).not.toContain('input.keyboard.trustedEvents');
		expect(recording.suites).not.toContain('input.mouse.trustedEvents');
	});
	it('resolves globals per fresh document and disposes fixtures after failure', async () => {
		const recording = recordingRunner();
		const created: Document[] = [];
		const resolved: Document[] = [];
		const disposed: Document[] = [];
		testDOMCompatibility({
			runner: recording.runner,
			features: flags(['events.dispatch.target']),
			create() {
				const document = new Document();
				created.push(document);
				return document;
			},
			globals(document) {
				resolved.push(document);
				return {};
			},
			dispose(document) {
				disposed.push(document);
			},
		});
		expect(created).toHaveLength(0);
		for (const test of recording.tests) await expect(test.run()).rejects.toThrow('globals.Event');
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
				create: () => new Document(),
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
					create: () => new Document(),
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
	it('rejects enabled input features without a driver before registering any suite', () => {
		const recording = recordingRunner();
		expect(() =>
			testDOMCompatibility({
				runner: recording.runner,
				features: { ...domFeatures },
				create: () => new Document(),
				globals: {},
			}),
		).toThrow('requires an input driver');
		expect(recording.suites).toEqual([]);
		expect(recording.tests).toEqual([]);
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
