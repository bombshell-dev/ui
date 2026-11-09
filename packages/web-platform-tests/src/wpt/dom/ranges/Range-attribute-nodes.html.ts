import type { CompatibilityContext } from '../../../shared/context.ts';

function attributeNode(document: Document) {
	const element = document.createElement('div');
	element.setAttribute('x', 'abc');
	return element.getAttributeNode('x')!;
}

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;

		context.test('setStart() to an Attr node at offset 0 is allowed', ({ document, Range }) => {
			const attr = attributeNode(document);
			expect(attr.value, 'sanity check: the attribute value is non-empty').toBe('abc');
			// No length attribute is exposed on Attr, but its DOM "length" concept is 0.
			const range = new Range();
			range.setStart(attr, 0);
			expect(range.startContainer).toBe(attr);
			expect(range.startOffset).toBe(0);
		});
		context.test('setEnd() to an Attr node at offset 0 is allowed', ({ document, Range }) => {
			const attr = attributeNode(document);
			const range = new Range();
			range.setEnd(attr, 0);
			expect(range.endContainer).toBe(attr);
			expect(range.endOffset).toBe(0);
		});
		context.test(
			'setStart() to an Attr node past its length (0) throws IndexSizeError',
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				expect(() => range.setStart(attr, 1)).toThrow(
					expect.objectContaining({
						name: 'IndexSizeError',
						code: 1,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'setEnd() to an Attr node past its length (0) throws IndexSizeError',
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				expect(() => range.setEnd(attr, 1)).toThrow(
					expect.objectContaining({
						name: 'IndexSizeError',
						code: 1,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'selectNodeContents() on an Attr node selects an empty range rooted at the Attr',
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				expect(range.startContainer, 'startContainer').toBe(attr);
				expect(range.startOffset, 'startOffset').toBe(0);
				expect(range.endContainer, 'endContainer').toBe(attr);
				expect(range.endOffset, 'endOffset').toBe(0);
				expect(range.collapsed, 'collapsed').toBe(true);
				expect(range.commonAncestorContainer, 'commonAncestorContainer').toBe(attr);
			},
		);
		context.test('cloneRange() preserves an Attr-rooted range', ({ document, Range }) => {
			const attr = attributeNode(document);
			const range = new Range();
			range.selectNodeContents(attr);
			const clone = range.cloneRange();
			expect(clone.startContainer, 'startContainer').toBe(attr);
			expect(clone.startOffset, 'startOffset').toBe(0);
			expect(clone.endContainer, 'endContainer').toBe(attr);
			expect(clone.endOffset, 'endOffset').toBe(0);
		});
		for (const method of [
			'setStartBefore',
			'setStartAfter',
			'setEndBefore',
			'setEndAfter',
			'selectNode',
		] as const) {
			context.test(
				`${method}() with an Attr node throws InvalidNodeTypeError (null parent)`,
				({ document, Range, DOMException }) => {
					const attr = attributeNode(document);
					const range = new Range();
					expect(() => range[method](attr)).toThrow(
						expect.objectContaining({
							name: 'InvalidNodeTypeError',
							code: 24,
							constructor: DOMException,
						}),
					);
				},
			);
		}
	}

	{
		const { expect } = context.runner;

		context.test(
			'cloneContents() on an Attr-rooted range returns an empty fragment',
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				const fragment = range.cloneContents();
				expect(fragment.childNodes.length, 'cloned fragment is empty').toBe(0);
			},
		);
	}

	{
		const { expect } = context.runner;

		context.test(
			"comparePoint() with an Attr node not sharing the range's root throws WrongDocumentError",
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				expect(() => range.comparePoint(attr, 0)).toThrow(
					expect.objectContaining({
						name: 'WrongDocumentError',
						code: 4,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			"isPointInRange() with an Attr node not sharing the range's root returns false",
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				expect(range.isPointInRange(attr, 0)).toBe(false);
			},
		);
		context.test(
			"intersectsNode() with an Attr node not sharing the range's root returns false",
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				expect(range.intersectsNode(attr)).toBe(false);
			},
		);
		context.test(
			"comparePoint() with an Attr node sharing the range's root",
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				expect(range.comparePoint(attr, 0), 'comparePoint at offset 0').toBe(0);
				expect(
					() => range.comparePoint(attr, 1),
					"comparePoint past the Attr node's length (0)",
				).toThrow(
					expect.objectContaining({
						name: 'IndexSizeError',
						code: 1,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			"isPointInRange() with an Attr node sharing the range's root",
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				expect(range.isPointInRange(attr, 0), 'isPointInRange at offset 0').toBe(true);
				expect(
					() => range.isPointInRange(attr, 1),
					"isPointInRange past the Attr node's length (0)",
				).toThrow(
					expect.objectContaining({
						name: 'IndexSizeError',
						code: 1,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			"intersectsNode() with an Attr node sharing the range's root returns true",
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				// An Attr node has a null parent, so a range sharing its root intersects it.
				expect(range.intersectsNode(attr)).toBe(true);
			},
		);
		context.test(
			'compareBoundaryPoints() across an Attr-rooted range and a document-rooted range throws WrongDocumentError',
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const attrRange = new Range();
				attrRange.selectNodeContents(attr);
				const documentRange = new Range();
				expect(() => attrRange.compareBoundaryPoints(Range.START_TO_START, documentRange)).toThrow(
					expect.objectContaining({
						name: 'WrongDocumentError',
						code: 4,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'compareBoundaryPoints() between two ranges rooted at the same Attr node returns 0',
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range1 = new Range();
				range1.selectNodeContents(attr);
				const range2 = new Range();
				range2.selectNodeContents(attr);
				for (const how of [
					Range.START_TO_START,
					Range.START_TO_END,
					Range.END_TO_END,
					Range.END_TO_START,
				]) {
					expect(range1.compareBoundaryPoints(how, range2), `how=${how}`).toBe(0);
				}
			},
		);
	}

	{
		const { expect } = context.runner;

		context.test('deleteContents() on an Attr-rooted range is a no-op', ({ document, Range }) => {
			const attr = attributeNode(document);
			const range = new Range();
			range.selectNodeContents(attr);
			range.deleteContents();
			expect(range.startContainer, 'startContainer').toBe(attr);
			expect(range.startOffset, 'startOffset').toBe(0);
			expect(range.collapsed, 'collapsed').toBe(true);
		});
	}

	{
		const { expect } = context.runner;

		context.test(
			'extractContents() on an Attr-rooted range returns an empty fragment',
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				const fragment = range.extractContents();
				expect(fragment.childNodes.length, 'extracted fragment is empty').toBe(0);
				expect(range.startContainer, 'startContainer is unchanged').toBe(attr);
			},
		);
	}

	{
		const { expect } = context.runner;

		context.test(
			'insertNode() into an Attr-rooted range throws HierarchyRequestError',
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				expect(() => range.insertNode(document.createElement('span'))).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'surroundContents() on an Attr-rooted range throws HierarchyRequestError',
			({ document, Range, DOMException }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				expect(() => range.surroundContents(document.createElement('span'))).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'insertNode() with an Attr node argument throws HierarchyRequestError',
			({ document, Range, DOMException }) => {
				const container = document.createElement('div');
				const range = new Range();
				range.setStart(container, 0);
				range.setEnd(container, 0);
				expect(() => range.insertNode(attributeNode(document))).toThrow(
					expect.objectContaining({
						name: 'HierarchyRequestError',
						code: 3,
						constructor: DOMException,
					}),
				);
			},
		);
	}

	{
		const { expect } = context.runner;

		context.test(
			'stringifying an Attr-rooted range returns the empty string',
			({ document, Range }) => {
				const attr = attributeNode(document);
				const range = new Range();
				range.selectNodeContents(attr);
				expect(range.toString(), 'toString()').toBe('');
				expect(String(range), 'String()').toBe('');
			},
		);
	}
}
