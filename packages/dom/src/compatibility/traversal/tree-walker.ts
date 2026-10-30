import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-treewalker';
// Additional filter cases adapted from WPT TreeWalker-acceptNode-filter.html,
// itself adapted from WebKit LayoutTests/fast/dom/TreeWalker/script-tests/acceptNode-filter.js.
// Copyright © web-platform-tests contributors. BSD-3-Clause.
// See ../../../test/wpt/LICENSE.txt and docs/wpt-ranges-parsing.md.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/dom/traversal/TreeWalker-acceptNode-filter.html';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'walks accepted descendants in order and prunes rejected subtrees',
		({ document }) => {
			const root = document.createElement('div');
			const a = document.createElement('span');
			const b = document.createElement('b');
			const nested = document.createElement('i');
			a.appendChild(nested);
			root.append(a, b);
			const walker = document.createTreeWalker(root, 1, {
				acceptNode(node) {
					return node === a ? 2 : 1;
				},
			});
			expect(walker.root).toBe(root);
			expect(walker.currentNode).toBe(root);
			expect(walker.nextNode()).toBe(b);
			expect(walker.nextNode()).toBeNull();
			expect(walker.parentNode()).toBe(root);
		},
	);

	context.test('distinguishes FILTER_SKIP from FILTER_REJECT subtrees', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<section><i></i></section><b><u></u></b>';
		const walker = document.createTreeWalker(p, 1, (node) =>
			node.nodeName === 'SECTION' ? 2 : node.nodeName === 'B' ? 3 : 1,
		);
		expect(walker.nextNode()).toBe(p.querySelector('u'));
		expect(walker.nextNode()).toBeNull();
		expect(walker.currentNode).toBe(p.querySelector('u'));
	});

	context.test('supports reverse and sibling traversal without moving on null', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<i></i><b></b>';
		const walker = document.createTreeWalker(p, 1);
		expect(walker.firstChild()).toBe(p.firstChild);
		expect(walker.nextSibling()).toBe(p.lastChild);
		expect(walker.nextSibling()).toBeNull();
		expect(walker.currentNode).toBe(p.lastChild);
		expect(walker.previousSibling()).toBe(p.firstChild);
		expect(walker.parentNode()).toBe(p);
	});
	context.test('rejects missing and non-callable filter methods without advancing', (fixture) => {
		const document = fixture.document as unknown as Document;
		const root = document.createElement('div');
		root.append(document.createElement('i'));
		for (const filter of [{}, { acceptNode: 'invalid' }]) {
			const walker = document.createTreeWalker(root, 1, filter as unknown as NodeFilter);
			for (const traverse of [() => walker.firstChild(), () => walker.nextNode()]) {
				expect(traverse).toThrow(expect.objectContaining({ name: 'TypeError' }));
				expect(walker.currentNode).toBe(root);
			}
		}
	});
	context.test(
		'propagates filter exceptions by identity and recovers on a later traversal',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div'),
				child = document.createElement('i');
			root.append(child);
			const failure = new Error('filter failure');
			let shouldThrow = true;
			const walker = document.createTreeWalker(root, 1, () => {
				if (shouldThrow) throw failure;
				return 1;
			});
			let caught: unknown;
			try {
				walker.nextNode();
			} catch (error) {
				caught = error;
			}
			expect(caught).toBe(failure);
			expect(walker.currentNode).toBe(root);
			shouldThrow = false;
			expect(walker.nextNode()).toBe(child);
		},
	);
	context.test(
		'retrieves acceptNode for every invocation with the filter as its receiver',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div'),
				first = document.createElement('i'),
				second = document.createElement('b');
			root.append(first, second);
			let gets = 0;
			const receivers: unknown[] = [],
				nodes: Node[] = [];
			const filter = {
				get acceptNode() {
					gets++;
					return function (this: unknown, node: Node) {
						receivers.push(this);
						nodes.push(node);
						return 1;
					};
				},
			};
			const walker = document.createTreeWalker(root, 1, filter);
			expect(gets).toBe(0);
			expect(walker.nextNode()).toBe(first);
			expect(walker.nextNode()).toBe(second);
			expect(gets).toBe(2);
			expect(receivers).toEqual([filter, filter]);
			expect(nodes).toEqual([first, second]);
		},
	);
	context.test(
		'propagates getter exceptions without changing currentNode or retaining the active flag',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div'),
				child = document.createElement('i');
			root.append(child);
			const failure = new Error('getter failure');
			let shouldThrow = true;
			const walker = document.createTreeWalker(root, 1, {
				get acceptNode() {
					if (shouldThrow) throw failure;
					return () => 1;
				},
			});
			let caught: unknown;
			try {
				walker.firstChild();
			} catch (error) {
				caught = error;
			}
			expect(caught).toBe(failure);
			expect(walker.currentNode).toBe(root);
			shouldThrow = false;
			expect(walker.firstChild()).toBe(child);
		},
	);
	context.test(
		'calls a callable filter directly even when it has an acceptNode property',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div'),
				child = document.createElement('i');
			root.append(child);
			let methodCalls = 0;
			const filter = Object.assign(() => 1, {
				acceptNode: () => {
					methodCalls++;
					return 2;
				},
			});
			const walker = document.createTreeWalker(root, 1, filter);
			expect(walker.nextNode()).toBe(child);
			expect(methodCalls).toBe(0);
		},
	);
	context.test(
		'rejects recursive filtering with InvalidStateError and allows later calls',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div'),
				first = document.createElement('i'),
				second = document.createElement('b');
			root.append(first, second);
			let invocations = 0;
			const walker = document.createTreeWalker(root, 1, () => {
				invocations++;
				expect(() => walker.nextNode()).toThrow(
					expect.objectContaining({ name: 'InvalidStateError' }),
				);
				return 1;
			});
			expect(walker.nextNode()).toBe(first);
			expect(walker.nextNode()).toBe(second);
			expect(invocations).toBe(2);
		},
	);
	context.test(
		'applies whatToShow before invoking the filter and converts its result to unsigned short',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const root = document.createElement('div'),
				element = document.createElement('i');
			root.append('text', document.createComment('comment'), element);
			const visited: Node[] = [];
			let conversions = 0;
			const walker = document.createTreeWalker(root, 1, (node) => {
				visited.push(node);
				return {
					valueOf() {
						conversions++;
						return 65537;
					},
				} as unknown as number;
			});
			expect(walker.nextNode()).toBe(element);
			expect(walker.nextNode()).toBeNull();
			expect(visited).toEqual([element]);
			expect(conversions).toBe(1);
		},
	);
}
