import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#interface-range';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'initializes at the document and counts UTF-16 and child-node offsets',
		({ document }) => {
			const range = document.createRange();
			expect([
				range.startContainer,
				range.startOffset,
				range.endContainer,
				range.endOffset,
			]).toEqual([document, 0, document, 0]);
			const root = document.createElement('div');
			const text = document.createTextNode('A😀B');
			root.append(text, document.createComment('comment'));
			range.selectNodeContents(root);
			expect(range.endOffset).toBe(2);
			range.setStart(text, 1);
			range.setEnd(text, 3);
			expect(range.startOffset).toBe(1);
			expect(range.endOffset).toBe(3);
			expect(range.collapsed).toBe(false);
			expect(range.commonAncestorContainer).toBe(text);
			expect(() => range.setEnd(text, 5)).toThrow(
				expect.objectContaining({ name: 'IndexSizeError' }),
			);
			expect(range.endOffset).toBe(3);
			range.setEnd(text, 0);
			expect(range.collapsed).toBe(true);
			expect(range.startOffset).toBe(0);
		},
	);

	context.test('rejects out of range offsets and invalid node kinds', (fixture) => {
		const document = fixture.document as unknown as Document;
		const r = document.createRange(),
			t = document.createTextNode('abc');
		expect(() => r.setStart(t, 4)).toThrow(expect.objectContaining({ name: 'IndexSizeError' }));
		const dt = document.implementation.createDocumentType('html', '', '');
		expect(() => r.setEnd(dt, 0)).toThrow(
			expect.objectContaining({ name: 'InvalidNodeTypeError' }),
		);
	});

	context.test('collapses to a new root when boundaries cross trees', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createTextNode('abc'),
			b = document.createTextNode('def'),
			r = document.createRange();
		r.setStart(a, 1);
		r.setEnd(a, 2);
		r.setEnd(b, 1);
		expect(r.collapsed).toBe(true);
		expect(r.startContainer).toBe(b);
		expect(r.startOffset).toBe(1);
	});
}
