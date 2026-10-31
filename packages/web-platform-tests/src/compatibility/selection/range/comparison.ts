import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-range-compareboundarypoints';
export const requires = ['selection.range.boundaries'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('compares boundaries and distinguishes points outside a range', ({ document }) => {
		const root = document.createElement('div');
		const left = document.createElement('span');
		const right = document.createElement('span');
		root.append(left, right);
		const range = document.createRange();
		range.selectNode(left);
		const clone = range.cloneRange();
		expect(clone.compareBoundaryPoints(range.START_TO_START, range)).toBe(0);
		expect(clone.compareBoundaryPoints(range.START_TO_END, range)).toBe(1);
		expect(clone.compareBoundaryPoints(range.END_TO_START, range)).toBe(-1);
		expect(range.isPointInRange(root, 0)).toBe(true);
		expect(range.comparePoint(root, 2)).toBe(1);
		expect(range.intersectsNode(right)).toBe(false);
		expect(() => range.comparePoint(document.createTextNode('other'), 0)).toThrow(
			expect.objectContaining({ name: 'WrongDocumentError' }),
		);
	});

	context.test(
		'compares points before inside and after a range and rejects another tree',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const t = document.createTextNode('abcd'),
				r = document.createRange();
			r.setStart(t, 1);
			r.setEnd(t, 3);
			expect(r.comparePoint(t, 0)).toBe(-1);
			expect(r.comparePoint(t, 1)).toBe(0);
			expect(r.comparePoint(t, 3)).toBe(0);
			expect(r.comparePoint(t, 4)).toBe(1);
			expect(r.isPointInRange(t, 2)).toBe(true);
			expect(r.isPointInRange(document.createTextNode('x'), 0)).toBe(false);
			expect(() => r.comparePoint(document.createTextNode('x'), 0)).toThrow(
				expect.objectContaining({ name: 'WrongDocumentError' }),
			);
		},
	);
}
