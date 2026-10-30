import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://w3c.github.io/selection-api/#responding-to-dom-mutations';
export const requires = [
	'selection.document.rangeManagement',
	'selection.range.liveBoundaries',
] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'reflects character-data mutations through its retained live range',
		({ document, connect, cleanup }) => {
			const root = document.createElement('div');
			const text = document.createTextNode('abcdef');
			root.append(text);
			connect(root);
			const selection = document.getSelection();
			if (!selection) return expect.fail('Document selection expected');
			selection.removeAllRanges();
			cleanup(() => selection.removeAllRanges());
			const range = document.createRange();
			range.setStart(text, 2);
			range.setEnd(text, 5);
			selection.addRange(range);
			text.deleteData(0, 1);
			expect(selection.getRangeAt(0)).toBe(range);
			expect(selection.anchorOffset).toBe(1);
			expect(selection.focusOffset).toBe(4);
			expect(selection.toString()).toBe('cde');
		},
	);

	context.test('updates selection offsets when selected text is edited', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			t = document.createTextNode('abcd');
		p.append(t);
		fixture.connect(p as unknown as DOMElementContract);
		const s = document.getSelection()!;
		s.setBaseAndExtent(t, 1, t, 3);
		t.insertData(0, 'XX');
		expect(s.anchorOffset).toBe(3);
		expect(s.focusOffset).toBe(5);
		expect(s.toString()).toBe('bc');
	});
}
