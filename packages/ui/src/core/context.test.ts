import { describe, expect, test } from 'vitest';
import { createContext, MissingContextError } from './context.ts';
import { Node } from './node.ts';

const theme = createContext<string>('theme');
const count = createContext<number>('count');
const locale = createContext<string>('locale', 'en');

describe('context', () => {
	describe('on a single node', () => {
		test('get returns undefined for a context that was never set', () => {
			expect(theme.get(new Node())).toBeUndefined();
		});

		test('does not inherit values from Object.prototype', () => {
			const constructor = createContext('constructor');

			expect(constructor.get(new Node())).toBeUndefined();
		});

		test('get returns the value after it is set', () => {
			const n = new Node();
			theme.set(n, 'dark');
			expect(theme.get(n)).toBe('dark');
		});

		test('the last set wins', () => {
			const n = new Node();
			theme.set(n, 'dark');
			theme.set(n, 'light');
			expect(theme.get(n)).toBe('light');
		});

		test('keeps falsy values — 0 is stored, not treated as unset', () => {
			const n = new Node();
			count.set(n, 0);
			expect(count.get(n)).toBe(0);
		});

		test('distinct contexts do not collide', () => {
			const n = new Node();
			theme.set(n, 'dark');
			expect(count.get(n)).toBeUndefined();
		});

		test('contexts with the same name share a value', () => {
			const first = createContext<string>('shared');
			const second = createContext<string>('shared');
			const n = new Node();
			first.set(n, 'value');
			expect(second.get(n)).toBe('value');
		});

		test('expect returns the value when the context is set', () => {
			const n = new Node();
			theme.set(n, 'dark');
			expect(theme.expect(n)).toBe('dark');
		});

		test('expect throws MissingContextError when unset with no default', () => {
			expect(() => theme.expect(new Node())).toThrow(MissingContextError);
		});

		test('expect falls back to the default when unset', () => {
			expect(locale.expect(new Node())).toBe('en');
		});

		test('a set value takes precedence over the default', () => {
			const n = new Node();
			locale.set(n, 'fr');
			expect(locale.expect(n)).toBe('fr');
		});

		test('get returns the default when the context is unset', () => {
			expect(locale.get(new Node())).toBe('en');
		});

		test('a set value overrides the default for get', () => {
			const n = new Node();
			locale.set(n, 'fr');
			expect(locale.get(n)).toBe('fr');
		});

		test('hasOwn is false before a value is set', () => {
			expect(theme.hasOwn(new Node())).toBe(false);
		});

		test('hasOwn is true once a value is set on the node', () => {
			const n = new Node();
			theme.set(n, 'dark');
			expect(theme.hasOwn(n)).toBe(true);
		});
	});

	describe('inheritance through the node tree', () => {
		test('a child inherits a value set on its parent', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			expect(theme.get(new Node(parent))).toBe('dark');
		});

		test('a value set on a child shadows the parent for that child only', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			const child = new Node(parent);
			theme.set(child, 'light');
			expect(theme.get(child)).toBe('light');
			expect(theme.get(parent)).toBe('dark');
		});

		test('setting a value on a child does not leak up to the parent', () => {
			const parent = new Node();
			const child = new Node(parent);
			theme.set(child, 'light');
			expect(theme.get(parent)).toBeUndefined();
		});

		test('expect inherits an ancestor value', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			expect(theme.expect(new Node(parent))).toBe('dark');
		});

		test('an inherited value resolves through multiple levels', () => {
			const grand = new Node();
			theme.set(grand, 'dark');
			const parent = new Node(grand);
			expect(theme.get(new Node(parent))).toBe('dark');
		});

		test('an explicitly set undefined shadows the ancestor value', () => {
			const parent = new Node();
			locale.set(parent, 'fr');
			const child = new Node(parent);
			locale.set(child, undefined as unknown as string);
			expect(locale.get(child)).toBe('en');
			expect(locale.get(parent)).toBe('fr');
		});

		test('an explicitly set undefined shadows with no default to fall back to', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			const child = new Node(parent);
			theme.set(child, undefined as unknown as string);
			expect(theme.get(child)).toBeUndefined();
			expect(() => theme.expect(child)).toThrow(MissingContextError);
		});

		test('hasOwn is true for an explicitly set undefined', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			const child = new Node(parent);
			theme.set(child, undefined as unknown as string);
			expect(theme.hasOwn(child)).toBe(true);
		});

		test('hasOwn is false for a value that is only inherited', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			expect(theme.hasOwn(new Node(parent))).toBe(false);
		});

		test('hasOwn is true only for the node that owns the value', () => {
			const parent = new Node();
			theme.set(parent, 'dark');
			const child = new Node(parent);
			theme.set(child, 'light');
			expect(theme.hasOwn(child)).toBe(true);
			expect(theme.hasOwn(parent)).toBe(true);
		});

		test('expect falls back to the default when neither node nor ancestors set it', () => {
			const parent = new Node();
			expect(locale.expect(new Node(parent))).toBe('en');
		});

		test('get falls back to the default when neither node nor ancestors set it', () => {
			const parent = new Node();
			expect(locale.get(new Node(parent))).toBe('en');
		});
	});
});
