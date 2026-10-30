import type { DOMFeaturePath } from './features.ts';
import type { DOMDocument, DOMElement } from './contracts/nodes.ts';
import type { DOMGlobals } from './globals.ts';
import type { DOMInputCapability, DOMTestInput } from './input-driver.ts';

/** The matcher surface used by the suite, independent of runner internals. */
export interface CompatibilityMatchers {
	readonly not: CompatibilityMatchers;
	readonly rejects: { toMatchObject(expected: unknown): PromiseLike<unknown> };
	toBe(expected: unknown): unknown;
	toEqual(expected: unknown): unknown;
	toBeNull(): unknown;
	toBeUndefined(): unknown;
	toBeGreaterThan(expected: number): unknown;
	toBeInstanceOf(expected: unknown): unknown;
	toContain(expected: unknown): unknown;
	toHaveLength(expected: number): unknown;
	toMatchObject(expected: unknown): unknown;
	toThrow(expected?: unknown): unknown;
}

/** Vitest-compatible assertions supplied by the consumer; no runner is imported. */
export interface CompatibilityExpect {
	(actual: unknown, message?: string): CompatibilityMatchers;
	objectContaining(expected: unknown): unknown;
	fail(message?: string): never;
	unreachable(message?: string): never;
}

export interface CompatibilityRunner {
	describe(name: string, register: () => void): unknown;
	it(name: string, run: () => void | Promise<void>): unknown;
	expect: CompatibilityExpect;
}

export interface DOMFixture {
	readonly document: DOMDocument;
	readonly input: DOMTestInput;
	globals<K extends string>(name: K): DOMGlobals[K];
	cleanup(callback: () => void | Promise<void>): void;
	connect<T extends DOMElement>(element: T): T;
}

export interface CompatibilityContext {
	readonly runner: CompatibilityRunner;
	test(
		name: string,
		run: (fixture: DOMFixture) => void | Promise<void>,
		requires?: readonly DOMFeaturePath[],
	): void;
}

export interface FeatureModule {
	readonly spec: string;
	readonly wpt?: string;
	readonly globals?: readonly string[];
	readonly requires?: readonly DOMFeaturePath[];
	readonly input?: readonly DOMInputCapability[];
	register(context: CompatibilityContext): void;
}
