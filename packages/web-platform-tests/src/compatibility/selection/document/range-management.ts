import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://w3c.github.io/selection-api/#dom-selection-addrange';
export const requires = ['selection.range.boundaries'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'stores one range by reference and clears it explicitly',
		({ document, connect, cleanup }) => {
			const root = document.createElement('div');
			root.textContent = 'selection';
			connect(root);
			const selection = document.getSelection();
			if (!selection) return expect.fail('Document selection expected');
			selection.removeAllRanges();
			cleanup(() => selection.removeAllRanges());
			const range = document.createRange();
			range.selectNodeContents(root);
			selection.addRange(range);
			expect(selection.getRangeAt(0)).toBe(range);
			expect(selection.rangeCount).toBe(1);
			expect(selection.toString()).toBe('selection');
			selection.removeAllRanges();
			expect(selection.rangeCount).toBe(0);
			expect(selection.anchorNode).toBeNull();
			expect(() => selection.getRangeAt(0)).toThrow(
				expect.objectContaining({ name: 'IndexSizeError' }),
			);
		},
	);

	context.test('retains range identity and clears anchor and focus on removal', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.textContent = 'abc';
		fixture.connect(e as unknown as DOMElementContract);
		const s = document.getSelection()!,
			r = document.createRange();
		r.selectNodeContents(e);
		s.removeAllRanges();
		s.addRange(r);
		expect(s.getRangeAt(0)).toBe(r);
		expect(s.rangeCount).toBe(1);
		s.removeAllRanges();
		expect(s.rangeCount).toBe(0);
		expect(s.anchorNode).toBeNull();
		expect(s.focusNode).toBeNull();
		expect(() => s.getRangeAt(0)).toThrow(expect.objectContaining({ name: 'IndexSizeError' }));
	});
}
