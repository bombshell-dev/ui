import { describe, expect, test } from 'vitest';
import { Node } from './node.ts';

describe('Node', () => {
	describe('createChild', () => {
		test('wires the child into its parent', () => {
			const parent = Node.createRoot();
			const child = parent.createChild();

			expect(child.parent).toBe(parent);
			expect(parent.children.has(child)).toBe(true);
		});

		test('gives every node a distinct id', () => {
			const parent = Node.createRoot();
			const child = parent.createChild();

			expect(typeof parent.id).toBe('string');
			expect(parent.id.length).toBeGreaterThan(0);
			expect(child.id).not.toBe(parent.id);
		});
	});

	describe('destroy', () => {
		test('detaches a node from its parent', () => {
			const parent = Node.createRoot();
			const child = parent.createChild();

			child.destroy();

			expect(parent.children.has(child)).toBe(false);
		});

		test('cascades to descendants', () => {
			const root = Node.createRoot();
			const parent = root.createChild();
			const child = parent.createChild();

			root.destroy();

			expect(root.children.has(parent)).toBe(false);
			expect(parent.children.has(child)).toBe(false);
		});

		test('runs ondestroy on a node before its children', () => {
			const order: Node[] = [];
			const root = Node.createRoot();
			const parent = root.createChild();
			const child = parent.createChild();
			for (const node of [root, parent, child]) {
				node.ondestroy = (destroyed) => order.push(destroyed);
			}

			root.destroy();

			expect(order).toEqual([root, parent, child]);
		});
	});
});
