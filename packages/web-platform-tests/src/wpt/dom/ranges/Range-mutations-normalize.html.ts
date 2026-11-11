import type { CompatibilityContext } from '../../../shared/context.ts';
import type { DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function createTestNode(document: Document, { cleanup }: DOMFixture) {
		// Create a node with adjacent 4 text children.
		const parentNode = document.createElement('div');
		parentNode.append(
			document.createElement('span'),
			'A',
			'BB',
			'CCC',
			'DDDD',
			document.createElement('span'),
		);
		document.body.append(parentNode);
		cleanup(() => parentNode.remove());
		return parentNode;
	}

	function normalizeTestNode(testNode: Node) {
		testNode.normalize();
		expect(testNode.childNodes.length).toBe(3);
		expect((testNode.childNodes[1] as Text).data).toBe('ABBCCCDDDD');
	}

	context.test(
		'Live range updates properly when its boundaries span multiple merged text nodes',
		(fixture) => {
			const { document } = fixture;

			let testNode = createTestNode(document, fixture);
			let range = document.createRange();
			range.setStart(testNode.childNodes[1]!, 0);
			range.setEnd(testNode.childNodes[4]!, 4);
			normalizeTestNode(testNode);
			expect(range.startContainer).toBe(testNode.childNodes[1]!);
			expect(range.startOffset).toBe(0);
			expect(range.endContainer).toBe(testNode.childNodes[1]!);
			expect(range.endOffset).toBe(10);
		},
	);
	context.test(
		'Live range updates properly when collapsed into single merged text node in range of multiple',
		(fixture) => {
			const { document } = fixture;

			let testNode = createTestNode(document, fixture);
			let range = document.createRange();
			range.setStart(testNode.childNodes[3]!, 2);
			range.setEnd(testNode.childNodes[3]!, 2);

			normalizeTestNode(testNode);

			expect(range.startContainer).toBe(testNode.childNodes[1]!);
			expect(range.startOffset).toBe(5);
			expect(range.endContainer).toBe(testNode.childNodes[1]!);
			expect(range.endOffset).toBe(5);
		},
	);
	context.test(
		'Live range updates properly when its boundaries are initially indices to merged nodes',
		(fixture) => {
			const { document } = fixture;

			let testNode = createTestNode(document, fixture);
			let range = document.createRange();
			range.setStart(testNode, 3);
			range.setEnd(testNode, 4);

			normalizeTestNode(testNode);

			expect(range.startContainer).toBe(testNode.childNodes[1]!);
			expect(range.startOffset).toBe(3);
			expect(range.endContainer).toBe(testNode.childNodes[1]!);
			expect(range.endOffset).toBe(6);
		},
	);
	context.test(
		'Live range updates properly when text nodes merged before and after them',
		(fixture) => {
			const { document } = fixture;

			let testNode = createTestNode(document, fixture);
			let range1 = document.createRange();
			let range2 = document.createRange();

			range1.setStart(testNode, 0);
			range1.setEnd(testNode, 0);
			range2.setStart(testNode, 5);
			range2.setEnd(testNode, 5);

			normalizeTestNode(testNode);

			expect(range1.startContainer).toBe(testNode);
			expect(range1.startOffset).toBe(0);
			expect(range1.endContainer).toBe(testNode);
			expect(range1.endOffset).toBe(0);

			expect(range2.startContainer).toBe(testNode);
			expect(range2.startOffset).toBe(2);
			expect(range2.endContainer).toBe(testNode);
			expect(range2.endOffset).toBe(2);
		},
	);
}
