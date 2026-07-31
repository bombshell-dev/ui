// oxlint-disable max-params -- Api cores include the dispatch node before method arguments.
import { describe, expect, test } from 'vitest';
import { createApi } from './api.ts';
import { Node } from './node.ts';

describe('createApi', () => {
	test('methods call a core with the node as its first argument', () => {
		const api = createApi('test', {
			add: (_node: Node, a: number, b: number) => a + b,
		});
		expect(api.methods.add(new Node(), 2, 3)).toBe(5);
	});

	test('a core receives the node it is invoked on', () => {
		const api = createApi('test', {
			self: (node: Node) => node,
		});
		const n = new Node();
		expect(api.methods.self(n)).toBe(n);
	});

	test('invoke calls a core using the first argument as the node', () => {
		const api = createApi('test', {
			add: (_node: Node, a: number, b: number) => a + b,
		});
		expect(api.invoke('add', [new Node(), 2, 3])).toBe(5);
	});

	test('invokes the core directly when no middleware is installed', () => {
		const api = createApi('test', {
			num: (_node: Node, value: number) => value,
		});
		expect(api.methods.num(new Node(), 7)).toBe(7);
	});

	test('middleware surrounds a core function', () => {
		const api = createApi('test', {
			num: (_node: Node, value: number) => value,
		});
		const n = new Node();
		api.around(n, {
			num: (args, next) => next(...args) * 2,
		});
		expect(api.methods.num(n, 5)).toBe(10);
	});

	test('middleware receives the invocation node as its first argument', () => {
		const api = createApi('test', {
			num: (_node: Node, value: number) => value,
		});
		const n = new Node();
		let seen: Node | undefined;
		api.around(n, {
			num: (args, next) => {
				seen = args[0];
				return next(...args);
			},
		});
		api.methods.num(n, 1);
		expect(seen).toBe(n);
	});

	test('middleware can substitute the node passed on to the core', () => {
		const api = createApi('test', {
			self: (node: Node) => node,
		});
		const root = new Node();
		const target = new Node(root);
		api.around(root, {
			self: (_args, next) => next(target),
		});
		expect(api.methods.self(root)).toBe(target);
	});

	test('a child node inherits middleware from its parent', () => {
		const api = createApi('test', {
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		api.around(parent, {
			num: (args, next) => next(...args) * 2,
		});
		expect(api.methods.num(new Node(parent), 5)).toBe(10);
	});

	test('composes middleware on a node in the order it was installed', () => {
		const api = createApi('test', {
			seq: (_node: Node, order: string[]) => order,
		});
		const n = new Node();
		api.around(n, {
			seq: (args, next) => next(args[0], args[1].concat('one')).concat('/one'),
		});
		api.around(n, {
			seq: (args, next) => next(args[0], args[1].concat('two')).concat('/two'),
		});
		api.around(n, {
			seq: (args, next) => next(args[0], args[1].concat('three')).concat('/three'),
		});
		expect(api.methods.seq(n, [])).toEqual(['one', 'two', 'three', '/three', '/two', '/one']);
	});

	test('middleware on one key does not affect another key', () => {
		const api = createApi('test', {
			foo: (_node: Node) => 1,
			bar: (_node: Node) => 1,
		});
		const n = new Node();
		api.around(n, {
			foo: (args, next) => next(...args) * 100,
		});
		expect(api.methods.foo(n)).toBe(100);
		expect(api.methods.bar(n)).toBe(1);
	});

	test('sibling nodes are isolated from each other’s middleware', () => {
		const api = createApi('test', {
			seq: (_node: Node, order: string[]) => order,
		});
		const root = new Node();
		const a = new Node(root);
		api.around(a, {
			seq: (args, next) => next(args[0], args[1].concat('a')).concat('/a'),
		});
		const b = new Node(root);
		api.around(b, {
			seq: (args, next) => next(args[0], args[1].concat('b')).concat('/b'),
		});
		expect(api.methods.seq(a, [])).toEqual(['a', '/a']);
		expect(api.methods.seq(b, [])).toEqual(['b', '/b']);
		expect(api.methods.seq(root, [])).toEqual([]);
	});

	test('composes middleware across a three-level node tree, ancestor outermost', () => {
		const api = createApi('test', {
			seq: (_node: Node, order: string[]) => order,
		});
		const grand = new Node();
		api.around(grand, {
			seq: (args, next) => next(args[0], args[1].concat('grand')).concat('/grand'),
		});
		const parent = new Node(grand);
		api.around(parent, {
			seq: (args, next) => next(args[0], args[1].concat('parent')).concat('/parent'),
		});
		const child = new Node(parent);
		api.around(child, {
			seq: (args, next) => next(args[0], args[1].concat('child')).concat('/child'),
		});
		expect(api.methods.seq(child, [])).toEqual([
			'grand',
			'parent',
			'child',
			'/child',
			'/parent',
			'/grand',
		]);
	});

	test('does not duplicate ancestor middleware when an ancestor is extended later', () => {
		const api = createApi('test', {
			seq: (_node: Node, order: string[]) => order,
		});
		const parent = new Node();
		const child = new Node(parent);
		parent.children.add(child);

		api.around(parent, {
			seq: (args, next) => next(args[0], args[1].concat('parent-one')),
		});
		api.around(child, {
			seq: (args, next) => next(args[0], args[1].concat('child')),
		});
		api.around(parent, {
			seq: (args, next) => next(args[0], args[1].concat('parent-two')),
		});

		expect(api.methods.seq(child, [])).toEqual(['parent-one', 'parent-two', 'child']);
	});

	test('a child’s middleware does not leak back to its parent', () => {
		const api = createApi('test', {
			num: (_node: Node, value: number) => value,
		});
		const parent = new Node();
		const child = new Node(parent);
		api.around(child, {
			num: (args, next) => next(...args) * 2,
		});
		expect(api.methods.num(child, 5)).toBe(10);
		expect(api.methods.num(parent, 5)).toBe(5);
	});
});
