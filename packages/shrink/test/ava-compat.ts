/**
 * Thin ava → vitest shim.
 * Aliased via vitest.config.ts so `import test from 'ava'` resolves here.
 */
import {
	test as vitestTest,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
	afterEach,
	vi,
} from 'vitest';

export type ExecutionContext = ReturnType<typeof makeT>;

function makeT(teardowns: Array<() => void | Promise<void>>) {
	return {
		is<T>(a: T, b: T, msg?: string) { expect(a, msg).toBe(b); },
		not<T>(a: T, b: T, msg?: string) { expect(a, msg).not.toBe(b); },
		deepEqual<T>(a: T, b: T, msg?: string) { expect(a, msg).toEqual(b); },
		notDeepEqual<T>(a: T, b: T, msg?: string) { expect(a, msg).not.toEqual(b); },
		true(x: unknown, msg?: string) { expect(x, msg).toBe(true); },
		false(x: unknown, msg?: string) { expect(x, msg).toBe(false); },
		truthy(x: unknown, msg?: string) { expect(x, msg).toBeTruthy(); },
		falsy(x: unknown, msg?: string) { expect(x, msg).toBeFalsy(); },
		pass(_msg?: string) { expect(true).toBe(true); },
		fail(msg?: string) { throw new Error(msg ?? 'Test failed'); },
		throws(
			fn: () => unknown,
			opts?: {message?: string | RegExp; instanceOf?: new (...a: any[]) => any},
		) {
			const run = () => expect(fn).toThrow(opts?.message ?? opts?.instanceOf);
			run();
			// ava returns the thrown error; we return undefined (good enough for assertions)
		},
		async throwsAsync(
			promise: Promise<unknown> | (() => Promise<unknown>),
			opts?: {message?: string | RegExp; instanceOf?: new (...a: any[]) => any},
		) {
			const p = typeof promise === 'function' ? promise() : promise;
			await expect(p).rejects.toThrow(opts?.message ?? opts?.instanceOf);
		},
		notThrows(fn: () => unknown) { expect(fn).not.toThrow(); },
		async notThrowsAsync(fn: () => Promise<unknown>) { await expect(fn()).resolves.toBeDefined(); },
		teardown(fn: () => void | Promise<void>) { teardowns.push(fn); },
		timeout(_ms: number) { /* vitest handles timeouts globally */ },
		like<T extends object>(a: T, b: Partial<T>, msg?: string) { expect(a, msg).toMatchObject(b); },
		snapshot(val: unknown) { expect(val).toMatchSnapshot(); },
		regex(str: string, re: RegExp, msg?: string) { expect(str, msg).toMatch(re); },
		notRegex(str: string, re: RegExp, msg?: string) { expect(str, msg).not.toMatch(re); },
		plan(_count: number) { /* noop — ava assertion count planning */ },
		log(...args: unknown[]) { console.log(...args); },
	};
}

type Fn = (t: ExecutionContext) => void | Promise<void>;

function wrap(fn: Fn): () => Promise<void> {
	return async () => {
		const teardowns: Array<() => void | Promise<void>> = [];
		const t = makeT(teardowns);
		try {
			await fn(t);
		} finally {
			for (const td of teardowns.reverse()) await td();
		}
	};
}

function test(name: string, fn: Fn): void {
	vitestTest(name, wrap(fn));
}

test.serial = (name: string, fn: Fn) => vitestTest(name, wrap(fn));
test.skip = (name: string, fn?: Fn) => vitestTest.skip(name, fn ? wrap(fn) : () => {});
test.todo = (name: string) => vitestTest.todo(name);
test.failing = (name: string, fn: Fn) => vitestTest.fails(name, wrap(fn));
test.before = (fn: (t: ExecutionContext) => void | Promise<void>) => {
	beforeAll(async () => {
		const teardowns: Array<() => void | Promise<void>> = [];
		await fn(makeT(teardowns));
	});
};
test.after = (fn: (t: ExecutionContext) => void | Promise<void>) => {
	afterAll(async () => {
		const teardowns: Array<() => void | Promise<void>> = [];
		await fn(makeT(teardowns));
	});
};
test.beforeEach = (fn: (t: ExecutionContext) => void | Promise<void>) => {
	beforeEach(async () => {
		const teardowns: Array<() => void | Promise<void>> = [];
		await fn(makeT(teardowns));
	});
};
test.afterEach = (fn: (t: ExecutionContext) => void | Promise<void>) => {
	afterEach(async () => {
		const teardowns: Array<() => void | Promise<void>> = [];
		await fn(makeT(teardowns));
	});
};

export default test;
export {test};
