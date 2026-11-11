import type { CompatibilityContext } from '../../../shared/context.ts';

// Each compatibility case recreates the upstream setup in its own document.
export function testRemove(
	context: CompatibilityContext,
	setup: (document: Document) => { node: Element | CharacterData; parent: Element },
	type: string,
): void {
	const { expect } = context.runner;

	context.test(type + ' should support remove()', ({ document }) => {
		const { node } = setup(document);
		expect('remove' in node).toBe(true);
		expect(typeof node.remove).toBe('function');
		expect(node.remove.length).toBe(0);
	});
	context.test('remove() should work if ' + type + " doesn't have a parent", ({ document }) => {
		const { node } = setup(document);
		expect(node.parentNode, 'Node should not have a parent').toBe(null);
		expect(node.remove()).toBe(undefined);
		expect(node.parentNode, 'Removed new node should not have a parent').toBe(null);
	});
	context.test('remove() should work if ' + type + ' does have a parent', ({ document }) => {
		const { node, parent } = setup(document);
		expect(node.parentNode, 'Node should not have a parent').toBe(null);
		parent.appendChild(node);
		expect(node.parentNode, 'Appended node should have a parent').toBe(parent);
		expect(node.remove()).toBe(undefined);
		expect(node.parentNode, 'Removed node should not have a parent').toBe(null);
		expect(parent.childNodes, 'Parent should not have children').toHaveLength(0);
	});
	context.test(
		'remove() should work if ' + type + ' does have a parent and siblings',
		({ document }) => {
			const { node, parent } = setup(document);
			expect(node.parentNode, 'Node should not have a parent').toBe(null);
			const before = parent.appendChild(document.createComment('before'));
			parent.appendChild(node);
			const after = parent.appendChild(document.createComment('after'));
			expect(node.parentNode, 'Appended node should have a parent').toBe(parent);
			expect(node.remove()).toBe(undefined);
			expect(node.parentNode, 'Removed node should not have a parent').toBe(null);
			expect(parent.childNodes, 'Parent should have two children left').toHaveLength(2);
			expect(parent.childNodes[0], 'Parent should have two children left').toBe(before);
			expect(parent.childNodes[1], 'Parent should have two children left').toBe(after);
		},
	);
}
