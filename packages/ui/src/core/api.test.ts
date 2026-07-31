import { describe, expect, expectTypeOf, test } from 'vitest';
import { Api } from './api.ts';
import { Node } from './node.ts';

class TestApi extends Api {
	name: string;

	constructor(node: Node, name: string) {
		super(node);
		this.name = name;
	}

	trace(events: string[]): string[] {
		events.push(`implementation:${this.name}`);
		return events;
	}

	value(value: number): number {
		return value;
	}

	observeNode(nodes: Node[]): Node {
		nodes.push(this.node);
		return this.node;
	}
}

function childOf(parent: Node): Node {
	const child = new Node(parent);
	parent.children.add(child);
	return child;
}

describe('Api', () => {
	test('at throws when there is no implementation in the node lineage', () => {
		expect(() => TestApi.at(new Node())).toThrow();
	});

	test('at returns a stable class-shaped handle backed by the initialized instance', () => {
		const node = new Node();
		TestApi.init(node, 'root');

		const api = TestApi.at(node);

		expectTypeOf(api).toEqualTypeOf<TestApi>();
		expect(api).toBeInstanceOf(TestApi);
		expect(api).toBe(TestApi.at(node));
		expect(api.name).toBe('root');
	});

	test('allows decoration before an implementation is initialized', () => {
		const node = new Node();

		expect(() =>
			TestApi.decorate(node, () => ({
				trace(events: string[]): string[] {
					events.push('decorator:before');
					const result = super.trace(events);
					events.push('decorator:after');
					return result;
				},
			})),
		).not.toThrow();
		expect(() => TestApi.at(node)).toThrow();

		TestApi.init(node, 'root');

		expect(TestApi.at(node).trace([])).toEqual([
			'decorator:before',
			'implementation:root',
			'decorator:after',
		]);
	});

	test('uses the nearest initialized implementation', () => {
		const root = new Node();
		const left = childOf(root);
		const right = childOf(root);
		const grandchild = childOf(right);

		TestApi.init(root, 'root');
		TestApi.init(right, 'right');

		expect(TestApi.at(root).name).toBe('root');
		expect(TestApi.at(left).name).toBe('root');
		expect(TestApi.at(right).name).toBe('right');
		expect(TestApi.at(grandchild).name).toBe('right');
	});

	test('exposes the call node to an inherited implementation', () => {
		const root = new Node();
		const child = childOf(root);
		const rootApi = TestApi.init(root, 'root');
		const childApi = TestApi.at(child);
		const nodes: Node[] = [];

		expect(rootApi.node).toBe(root);
		expect(childApi.node).toBe(child);
		expect(childApi.observeNode(nodes)).toBe(child);
		expect(nodes).toEqual([child]);
	});

	test('exposes the call node to decorators and super', () => {
		const root = new Node();
		const child = childOf(root);
		TestApi.init(root, 'root');
		TestApi.decorate(root, () => ({
			observeNode(nodes: Node[]): Node {
				nodes.push(this.node);
				return super.observeNode(nodes);
			},
		}));

		const nodes: Node[] = [];
		expect(TestApi.at(child).observeNode(nodes)).toBe(child);
		expect(nodes).toEqual([child, child]);
	});

	test('uses native super for arguments and return values without affecting other methods', () => {
		const node = new Node();
		TestApi.init(node, 'root');
		TestApi.decorate(node, () => ({
			value(value: number): number {
				return super.value(value + 1) * 2;
			},
		}));

		const api = TestApi.at(node);

		expect(api.value(3)).toBe(8);
		expect(api.trace([])).toEqual(['implementation:root']);
	});

	test('routes decorator field access to the initialized implementation', () => {
		const node = new Node();
		const api = TestApi.init(node, 'root');

		TestApi.decorate(node, () => ({
			trace(events: string[]): string[] {
				events.push(`decorator:${this.name}`);
				this.name = 'updated';
				return super.trace(events);
			},
		}));

		expect(api.trace([])).toEqual(['decorator:root', 'implementation:updated']);
		expect(api.name).toBe('updated');
	});

	test('composes ancestors outermost and same-node decorators in installation order', () => {
		const root = new Node();
		const parent = childOf(root);
		const child = childOf(parent);
		TestApi.init(root, 'root');

		// Install these out of tree order to ensure hierarchy, rather than
		// installation chronology, determines which node is outermost.
		TestApi.decorate(child, () => ({
			trace(events: string[]): string[] {
				events.push('child:before');
				const result = super.trace(events);
				events.push('child:after');
				return result;
			},
		}));
		TestApi.decorate(root, () => ({
			trace(events: string[]): string[] {
				events.push('root-one:before');
				const result = super.trace(events);
				events.push('root-one:after');
				return result;
			},
		}));
		TestApi.decorate(parent, () => ({
			trace(events: string[]): string[] {
				events.push('parent:before');
				const result = super.trace(events);
				events.push('parent:after');
				return result;
			},
		}));
		TestApi.decorate(root, () => ({
			trace(events: string[]): string[] {
				events.push('root-two:before');
				const result = super.trace(events);
				events.push('root-two:after');
				return result;
			},
		}));

		expect(TestApi.at(child).trace([])).toEqual([
			'root-one:before',
			'root-two:before',
			'parent:before',
			'child:before',
			'implementation:root',
			'child:after',
			'parent:after',
			'root-two:after',
			'root-one:after',
		]);
	});

	test('a descendant can suppress only the layers inside it', () => {
		const root = new Node();
		const child = childOf(root);
		TestApi.init(root, 'root');
		TestApi.decorate(root, () => ({
			trace(events: string[]): string[] {
				events.push('root:before');
				const result = super.trace(events);
				events.push('root:after');
				return result;
			},
		}));
		TestApi.decorate(child, () => ({
			trace(events: string[]): string[] {
				events.push('child');
				return events;
			},
		}));

		expect(TestApi.at(child).trace([])).toEqual(['root:before', 'child', 'root:after']);
	});

	test('instantiates a shared ancestor decoration into each sibling dispatch chain', () => {
		const root = new Node();
		const left = childOf(root);
		const right = childOf(root);
		TestApi.init(left, 'left');
		TestApi.init(right, 'right');

		let nextRootLayer = 0;
		TestApi.decorate(root, (): Partial<TestApi> => {
			const layer = `root-${nextRootLayer++}`;
			return {
				trace(events: string[]): string[] {
					events.push(`${layer}:before`);
					const result = super.trace(events);
					events.push(`${layer}:after`);
					return result;
				},
			};
		});
		TestApi.decorate(left, () => ({
			trace(events: string[]): string[] {
				events.push('left:before');
				const result = super.trace(events);
				events.push('left:after');
				return result;
			},
		}));
		TestApi.decorate(right, () => ({
			trace(events: string[]): string[] {
				events.push('right:before');
				const result = super.trace(events);
				events.push('right:after');
				return result;
			},
		}));

		const leftApi = TestApi.at(left);
		const rightApi = TestApi.at(right);
		const leftFirst = leftApi.trace([]);
		const rightFirst = rightApi.trace([]);
		const leftAgain = leftApi.trace([]);

		expect(leftFirst.slice(1, -1)).toEqual(['left:before', 'implementation:left', 'left:after']);
		expect(leftFirst.at(-1)).toBe(leftFirst[0]?.replace(':before', ':after'));

		expect(rightFirst.slice(1, -1)).toEqual([
			'right:before',
			'implementation:right',
			'right:after',
		]);
		expect(rightFirst.at(-1)).toBe(rightFirst[0]?.replace(':before', ':after'));

		expect(leftFirst[0]).not.toBe(rightFirst[0]);
		expect(leftAgain[0]).toBe(leftFirst[0]);
		expect(leftAgain.slice(1, -1)).toEqual(['left:before', 'implementation:left', 'left:after']);
		expect(leftAgain.at(-1)).toBe(leftFirst.at(-1));
	});

	test('updates an existing handle after ancestor decoration and a nearer init', () => {
		const root = new Node();
		const child = childOf(root);
		TestApi.init(root, 'root');
		TestApi.decorate(child, () => ({
			trace(events: string[]): string[] {
				events.push('child:before');
				const result = super.trace(events);
				events.push('child:after');
				return result;
			},
		}));

		const api = TestApi.at(child);
		expect(api.trace([])).toEqual(['child:before', 'implementation:root', 'child:after']);

		TestApi.decorate(root, () => ({
			trace(events: string[]): string[] {
				events.push('root:before');
				const result = super.trace(events);
				events.push('root:after');
				return result;
			},
		}));
		TestApi.init(child, 'child');

		expect(TestApi.at(child)).toBe(api);
		expect(api.trace([])).toEqual([
			'root:before',
			'child:before',
			'implementation:child',
			'child:after',
			'root:after',
		]);
	});
});
