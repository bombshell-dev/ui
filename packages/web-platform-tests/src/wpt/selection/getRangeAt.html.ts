import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Only supports index 0', ({ document, DOMException }) => {
		const sel = document.getSelection()!;

		var range = document.createRange();
		sel.addRange(range);
		expect(function () {
			sel.getRangeAt(-1);
		}).toThrow(
			expect.objectContaining({
				name: 'IndexSizeError',
				code: 1,
				constructor: DOMException,
			}),
		);
		expect(function () {
			sel.getRangeAt(1);
		}).toThrow(
			expect.objectContaining({
				name: 'IndexSizeError',
				code: 1,
				constructor: DOMException,
			}),
		);
	});
	context.test('Throws when with no range', ({ document, DOMException }) => {
		const sel = document.getSelection()!;
		var range = document.createRange();
		sel.addRange(range);

		sel.removeAllRanges();
		expect(() => sel.getRangeAt(0)).toThrow(
			expect.objectContaining({
				name: 'IndexSizeError',
				code: 1,
				constructor: DOMException,
			}),
		);
	});
	context.test('Returns the same range object when with no selection change', ({ document }) => {
		const sel = document.getSelection()!;
		var range = document.createRange();
		sel.addRange(range);
		sel.removeAllRanges();

		sel.addRange(document.createRange());
		expect(sel.getRangeAt(0)).toBe(sel.getRangeAt(0));
	});
	context.test('Returns a different range object when with selection change', ({ document }) => {
		const sel = document.getSelection()!;
		const initialRange = document.createRange();
		sel.addRange(initialRange);
		sel.removeAllRanges();
		sel.addRange(document.createRange());

		const range = sel.getRangeAt(0);
		sel.collapse(document.body);
		expect(range).not.toBe(sel.getRangeAt(0));
	});
}
