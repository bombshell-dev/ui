import { describe, expect, test } from 'vitest';
import { createContext, MissingContextError } from './context.ts';
import { createNode } from './node.ts';

const theme = createContext<string>('theme');
const count = createContext<number>('count');
const locale = createContext<string>('locale', 'en');

describe('context', () => {
	describe('on a single node', () => {
		test('get returns undefined for a context that was never set', () => {
			expect(theme.get(createNode())).toBeUndefined();
		});

		test('get returns the value after it is set', () => {
			const n = createNode();
			theme.set(n, 'dark');
			expect(theme.get(n)).toBe('dark');
		});

		test('the last set wins', () => {
			const n = createNode();
			theme.set(n, 'dark');
			theme.set(n, 'light');
			expect(theme.get(n)).toBe('light');
		});

		test('keeps falsy values — 0 is stored, not treated as unset', () => {
			const n = createNode();
			count.set(n, 0);
			expect(count.get(n)).toBe(0);
		});

		test('distinct contexts do not collide', () => {
			const n = createNode();
			theme.set(n, 'dark');
			expect(count.get(n)).toBeUndefined();
		});

		test('expect returns the value when the context is set', () => {
			const n = createNode();
			theme.set(n, 'dark');
			expect(theme.expect(n)).toBe('dark');
		});

		test('expect throws MissingContextError when unset with no default', () => {
			expect(() => theme.expect(createNode())).toThrow(MissingContextError);
		});

		test('expect falls back to the default when unset', () => {
			expect(locale.expect(createNode())).toBe('en');
		});

		test('a set value takes precedence over the default', () => {
			const n = createNode();
			locale.set(n, 'fr');
			expect(locale.expect(n)).toBe('fr');
		});

		test('get returns the default when the context is unset', () => {
			expect(locale.get(createNode())).toBe('en');
		});

		test('a set value overrides the default for get', () => {
			const n = createNode();
			locale.set(n, 'fr');
			expect(locale.get(n)).toBe('fr');
		});

		test('hasOwn is false before a value is set', () => {
			expect(theme.hasOwn(createNode())).toBe(false);
		});

		test('hasOwn is true once a value is set on the node', () => {
			const n = createNode();
			theme.set(n, 'dark');
			expect(theme.hasOwn(n)).toBe(true);
		});
	});

	describe('inheritance through the node tree', () => {
		test('a child inherits a value set on its parent', () => {
			const parent = createNode();
			theme.set(parent, 'dark');
			expect(theme.get(createNode(parent))).toBe('dark');
		});

		test('a value set on a child shadows the parent for that child only', () => {
			const parent = createNode();
			theme.set(parent, 'dark');
			const child = createNode(parent);
			theme.set(child, 'light');
			expect(theme.get(child)).toBe('light');
			expect(theme.get(parent)).toBe('dark');
		});

		test('setting a value on a child does not leak up to the parent', () => {
			const parent = createNode();
			const child = createNode(parent);
			theme.set(child, 'light');
			expect(theme.get(parent)).toBeUndefined();
		});

		test('expect inherits an ancestor value', () => {
			const parent = createNode();
			theme.set(parent, 'dark');
			expect(theme.expect(createNode(parent))).toBe('dark');
		});

		test('an inherited value resolves through multiple levels', () => {
			const grand = createNode();
			theme.set(grand, 'dark');
			const parent = createNode(grand);
			expect(theme.get(createNode(parent))).toBe('dark');
		});

		test('hasOwn is false for a value that is only inherited', () => {
			const parent = createNode();
			theme.set(parent, 'dark');
			expect(theme.hasOwn(createNode(parent))).toBe(false);
		});

		test('hasOwn is true only for the node that owns the value', () => {
			const parent = createNode();
			theme.set(parent, 'dark');
			const child = createNode(parent);
			theme.set(child, 'light');
			expect(theme.hasOwn(child)).toBe(true);
			expect(theme.hasOwn(parent)).toBe(true);
		});

		test('expect falls back to the default when neither node nor ancestors set it', () => {
			const parent = createNode();
			expect(locale.expect(createNode(parent))).toBe('en');
		});

		test('get falls back to the default when neither node nor ancestors set it', () => {
			const parent = createNode();
			expect(locale.get(createNode(parent))).toBe('en');
		});
	});
});
