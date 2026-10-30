import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec = 'https://w3c.github.io/selection-api/#selection-interface';
export const requires = [
	'selection.document.rangeManagement',
	'selection.range.deleteContents',
	'document.xml',
] as const;
// Adapted from WPT selection/{selectAllChildren,removeRange,deleteFromDocument}.html.
// Copyright © web-platform-tests contributors. deleteFromDocument author: Aryeh Gregor.
// BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt and docs/wpt-ranges-parsing.md.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/selection/removeRange.html';

function setup(fixture: DOMFixture): {
	document: Document;
	root: HTMLDivElement;
	selection: Selection;
} {
	const document = fixture.document as unknown as Document;
	const root = document.createElement('div');
	root.append(document.createTextNode('abc'), document.createElement('b'), 'def');
	root.children[0]!.textContent = 'middle';
	fixture.connect(root as unknown as DOMElementContract);
	const selection = document.getSelection()!;
	selection.removeAllRanges();
	fixture.cleanup(() => selection.removeAllRanges());
	return { document, root, selection };
}

/** Registers selection mutation, range identity, and failure cases. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'selectAllChildren replaces the range and selects child offsets forwards',
		(fixture) => {
			const { document, root, selection } = setup(fixture);
			const previous = document.createRange();
			previous.setStart(root.firstChild!, 1);
			previous.setEnd(root.firstChild!, 2);
			selection.addRange(previous);
			selection.selectAllChildren(root);
			expect(selection.getRangeAt(0)).not.toBe(previous);
			expect([
				selection.anchorNode,
				selection.anchorOffset,
				selection.focusNode,
				selection.focusOffset,
			]).toEqual([root, 0, root, 3]);
			expect(selection.toString()).toBe('abcmiddledef');
			expect([previous.startOffset, previous.endOffset]).toEqual([1, 2]);
		},
	);
	context.test(
		'selectAllChildren ignores detached and other-document nodes without replacing the range',
		(fixture) => {
			const { document, root, selection } = setup(fixture);
			selection.selectAllChildren(root);
			const range = selection.getRangeAt(0);
			selection.selectAllChildren(document.createElement('div'));
			expect(selection.getRangeAt(0)).toBe(range);
			selection.selectAllChildren(document.implementation.createHTMLDocument('').body);
			expect(selection.getRangeAt(0)).toBe(range);
		},
	);
	context.test(
		'selectAllChildren rejects doctypes before altering the selected range',
		(fixture) => {
			const { document, root, selection } = setup(fixture);
			selection.selectAllChildren(root);
			const range = selection.getRangeAt(0);
			const doctype = document.implementation.createDocumentType('html', '', '');
			expect(() => selection.selectAllChildren(doctype)).toThrow(
				expect.objectContaining({ name: 'InvalidNodeTypeError' }),
			);
			expect(selection.getRangeAt(0)).toBe(range);
		},
	);
	context.test(
		'selectAllChildren uses child counts even for text nodes and empty elements',
		(fixture) => {
			const { root, selection } = setup(fixture);
			for (const node of [
				root.firstChild!,
				root.appendChild(root.ownerDocument.createElement('i')),
			]) {
				selection.selectAllChildren(node);
				expect([
					selection.anchorNode,
					selection.anchorOffset,
					selection.focusNode,
					selection.focusOffset,
				]).toEqual([node, 0, node, 0]);
				expect(selection.isCollapsed).toBe(true);
			}
		},
	);
	context.test(
		'removeRange uses identity and preserves the selection after a mismatch',
		(fixture) => {
			const { root, selection } = setup(fixture);
			selection.selectAllChildren(root);
			const range = selection.getRangeAt(0);
			expect(() => selection.removeRange(range.cloneRange())).toThrow(
				expect.objectContaining({ name: 'NotFoundError' }),
			);
			expect(selection.getRangeAt(0)).toBe(range);
			selection.removeRange(range);
			expect([selection.rangeCount, selection.anchorNode, selection.focusNode]).toEqual([
				0,
				null,
				null,
			]);
			expect(() => selection.removeRange(range)).toThrow(
				expect.objectContaining({ name: 'NotFoundError' }),
			);
		},
	);
	context.test('removeRange rejects values that are not Range objects', (fixture) => {
		const { root, selection } = setup(fixture);
		selection.selectAllChildren(root);
		const range = selection.getRangeAt(0);
		for (const invalid of [null, selection, {}, undefined]) {
			expect(() => selection.removeRange(invalid as unknown as Range)).toThrow(
				expect.objectContaining({ name: 'TypeError' }),
			);
			expect(selection.getRangeAt(0)).toBe(range);
		}
	});
	context.test('deleteFromDocument is a no-op for empty and collapsed selections', (fixture) => {
		const { root, selection } = setup(fixture);
		selection.deleteFromDocument();
		expect(selection.rangeCount).toBe(0);
		selection.collapse(root.firstChild!, 1);
		const range = selection.getRangeAt(0);
		selection.deleteFromDocument();
		expect(root.textContent).toBe('abcmiddledef');
		expect(selection.getRangeAt(0)).toBe(range);
		expect(selection.anchorOffset).toBe(1);
	});
	context.test(
		'deleteFromDocument removes partial text and whole nodes through the retained range',
		(fixture) => {
			const { document, root, selection } = setup(fixture);
			const first = root.firstChild!,
				last = root.lastChild!,
				middle = root.children[0]!;
			const range = document.createRange();
			range.setStart(first, 1);
			range.setEnd(last, 2);
			selection.addRange(range);
			selection.deleteFromDocument();
			expect(root.textContent).toBe('af');
			expect(Array.from(root.childNodes)).toEqual([first, last]);
			expect(middle.parentNode).toBeNull();
			expect(middle.textContent).toBe('middle');
			expect(selection.getRangeAt(0)).toBe(range);
			expect([
				range.startContainer,
				range.startOffset,
				range.endContainer,
				range.endOffset,
			]).toEqual([root, 1, root, 1]);
		},
	);
}
