import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#textFieldSelection';
export const requires = ['elements.input.selection'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('replaces explicit offsets and selects the replacement', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
		element.value = 'abcdef';
		element.setRangeText('XYZ', 2, 4, 'select');
		expect(element.value).toBe('abXYZef');
		expect(element.selectionStart).toBe(2);
		expect(element.selectionEnd).toBe(5);
		expect(() => element.setRangeText('invalid', 5, 1)).toThrow(
			expect.objectContaining({ name: 'IndexSizeError' }),
		);
		expect(element.value).toBe('abXYZef');
	});
	context.test('uses the current selection when offsets are omitted', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
		element.value = 'abcdef';
		element.setSelectionRange(2, 4);
		element.setRangeText('X');
		expect(element.value).toBe('abXef');
		expect(element.selectionStart).toBe(2);
		expect(element.selectionEnd).toBe(3);
	});
}
