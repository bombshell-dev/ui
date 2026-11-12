import type { DOMGlobals } from './globals.ts';
import type { DOMInputCapability, DOMTestInput } from './input-driver.ts';
import type { DOMDocumentOptions } from './fixture.ts';

/** The matcher surface used by the suite, independent of runner internals. */
export interface CompatibilityMatchers {
	readonly not: CompatibilityMatchers;
	readonly rejects: { toMatchObject(expected: unknown): PromiseLike<unknown> };
	toBe(expected: unknown): unknown;
	toEqual(expected: unknown): unknown;
	toBeNull(): unknown;
	toBeUndefined(): unknown;
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
	/** Narrow configured cases before registering suites or tests with the runner. */
	filter?(source: string, name: string): boolean;
	describe(name: string, register: () => void): unknown;
	it: {
		(name: string, run: () => void | Promise<void>): unknown;
		todo(name: string): unknown;
	};
	expect: CompatibilityExpect;
}

export interface DOMFixture extends DOMGlobals {
	readonly document: Document;
	readonly input: DOMTestInput;
	/** WPT step_func: retain failures that event dispatch would otherwise swallow. */
	step<This, Args extends unknown[], Result>(
		callback: (this: This, ...args: Args) => Result,
	): (this: This, ...args: Args) => Result | undefined;
	cleanup(callback: () => void | Promise<void>): void;
	connect<T extends Element>(element: T): T;
}

/** Source document requested by an individual case. */
export interface CompatibilityTestOptions {
	document?: DOMDocumentOptions;
}

export interface CompatibilityContext {
	readonly runner: CompatibilityRunner;
	test(
		name: string,
		run: (fixture: DOMFixture) => void | Promise<void>,
		options?: CompatibilityTestOptions,
	): void;
}

export interface CompatibilityModule {
	readonly input?: readonly DOMInputCapability[];
	register(context: CompatibilityContext): void;
}
