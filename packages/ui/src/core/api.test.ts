import { describe, expect, test } from 'vitest';
import { createApi } from './api.ts';
import { Node } from './node.ts';

describe('createApi', () => {
	test('binds the node to every member', () => {
		const api = createApi({
			add: (_node: Node, a: number, b: number) => a + b,
		});
		expect(api.for(new Node()).add(2, 3)).toBe(5);
	});

	test('an implementation receives the node it is called on', () => {
		const api = createApi({
			self: (node: Node) => node,
		});
		const n = new Node();
		expect(api.for(n).self()).toBe(n);
	});

	test('uses the default implementation when none is provided', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		expect(api.for(new Node()).num(7)).toBe(7);
	});

	test('a provided implementation replaces the default', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const n = new Node();
		api.provide(n, (base) => ({ ...base, num: (node, value) => base.num(node, value) * 2 }));
		expect(api.for(n).num(5)).toBe(10);
	});

	test('a provided implementation receives the node it is called on', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		const child = new Node(parent);
		let seen: Node | undefined;
		api.provide(parent, (base) => ({
			...base,
			num: (node, value) => {
				seen = node;
				return base.num(node, value);
			},
		}));
		api.for(child).num(1);
		expect(seen).toBe(child);
	});

	test('a child node inherits the implementation provided on its parent', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		api.provide(parent, (base) => ({ ...base, num: (node, value) => base.num(node, value) * 2 }));
		expect(api.for(new Node(parent)).num(5)).toBe(10);
	});

	test('each implementation provided on a node delegates to the one before it', () => {
		const api = createApi({
			seq: (_node: Node, order: string[]) => order,
		});
		const n = new Node();
		for (const label of ['one', 'two', 'three']) {
			api.provide(n, (base) => ({
				...base,
				seq: (node, order) => base.seq(node, order.concat(label)).concat(`/${label}`),
			}));
		}
		expect(api.for(n).seq([])).toEqual(['three', 'two', 'one', '/one', '/two', '/three']);
	});

	test('replacing one member leaves the others alone', () => {
		const api = createApi({
			foo: (_node: Node) => 1,
			bar: (_node: Node) => 1,
		});
		const n = new Node();
		api.provide(n, (base) => ({ ...base, foo: (node) => base.foo(node) * 100 }));
		expect(api.for(n).foo()).toBe(100);
		expect(api.for(n).bar()).toBe(1);
	});

	test('sibling nodes are isolated from each other', () => {
		const api = createApi({
			seq: (_node: Node, order: string[]) => order,
		});
		const root = new Node();
		const a = new Node(root);
		const b = new Node(root);
		api.provide(a, (base) => ({
			...base,
			seq: (node, order) => base.seq(node, order.concat('a')).concat('/a'),
		}));
		api.provide(b, (base) => ({
			...base,
			seq: (node, order) => base.seq(node, order.concat('b')).concat('/b'),
		}));
		expect(api.for(a).seq([])).toEqual(['a', '/a']);
		expect(api.for(b).seq([])).toEqual(['b', '/b']);
		expect(api.for(root).seq([])).toEqual([]);
	});

	test('each node in a tree delegates up to the nearest implementation above it', () => {
		const api = createApi({
			seq: (_node: Node, order: string[]) => order,
		});
		const grand = new Node();
		const parent = new Node(grand);
		const child = new Node(parent);
		for (const [node, label] of [
			[grand, 'grand'],
			[parent, 'parent'],
			[child, 'child'],
		] as const) {
			api.provide(node, (base) => ({
				...base,
				seq: (n, order) => base.seq(n, order.concat(label)).concat(`/${label}`),
			}));
		}
		expect(api.for(child).seq([])).toEqual([
			'child',
			'parent',
			'grand',
			'/grand',
			'/parent',
			'/child',
		]);
	});

	test('a child’s implementation does not leak back to its parent', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		const child = new Node(parent);
		api.provide(child, (base) => ({ ...base, num: (node, value) => base.num(node, value) * 2 }));
		expect(api.for(child).num(5)).toBe(10);
		expect(api.for(parent).num(5)).toBe(5);
	});

	test('disposing restores the implementation that was in effect', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		const child = new Node(parent);
		api.provide(parent, (base) => ({ ...base, num: (node, value) => base.num(node, value) * 2 }));
		const dispose = api.provide(child, (base) => ({
			...base,
			num: (node, value) => base.num(node, value) + 1,
		}));

		expect(api.for(child).num(5)).toBe(11);
		dispose();
		expect(api.for(child).num(5)).toBe(10);
	});

	test('disposing a stacked implementation restores the one below it', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const n = new Node();
		api.provide(n, (base) => ({ ...base, num: (node, value) => base.num(node, value) * 2 }));
		const dispose = api.provide(n, (base) => ({
			...base,
			num: (node, value) => base.num(node, value) + 1,
		}));

		expect(api.for(n).num(5)).toBe(11);
		dispose();
		expect(api.for(n).num(5)).toBe(10);
	});

	test('a handle taken before a later provide sees it', () => {
		const api = createApi({
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		const child = new Node(parent);
		const before = api.for(child);
		api.provide(parent, (base) => ({ ...base, num: (node, value) => base.num(node, value) * 2 }));

		expect(api.for(child).num(5)).toBe(10);
		expect(before.num(5)).toBe(10);
	});
});
