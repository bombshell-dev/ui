import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://w3c.github.io/selection-api/#dom-selection-addrange';
const requiredGlobals = ['Document'] as const;
export { requiredGlobals as globals };
export const requires = ['selection.document.rangeManagement'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'ignores ranges rooted outside the selection document',
		({ document, cleanup, globals }) => {
			const selection = document.getSelection();
			if (!selection) return expect.fail('Document selection expected');
			selection.removeAllRanges();
			cleanup(() => selection.removeAllRanges());
			const detached = document.createTextNode('detached');
			const range = document.createRange();
			range.selectNodeContents(detached);
			selection.addRange(range);
			expect(selection.rangeCount).toBe(0);
			const Document = globals('Document');
			const other = new Document();
			selection.addRange(other.createRange());
			expect(selection.rangeCount).toBe(0);
		},
	);

	context.test('ignores adding a range rooted in a detached tree', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.getSelection()!,
			t = document.createTextNode('abc'),
			r = document.createRange();
		s.removeAllRanges();
		r.setStart(t, 0);
		r.setEnd(t, 2);
		s.addRange(r);
		expect(s.rangeCount).toBe(0);
	});
}
