import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#textFieldSelection';
export const requires = ['elements.textarea.selection'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('replaces explicit offsets and selects the replacement', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
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
		const element = document.createElement('textarea');
		element.value = 'abcdef';
		element.setSelectionRange(2, 4);
		element.setRangeText('X');
		expect(element.value).toBe('abXef');
		expect(element.selectionStart).toBe(2);
		expect(element.selectionEnd).toBe(3);
	});

	context.test('supports selection replacement modes and rejects reversed offsets', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea');
		e.value = 'abcdef';
		e.setSelectionRange(1, 3);
		e.setRangeText('XY', 1, 3, 'select');
		expect(e.value).toBe('aXYdef');
		expect(e.selectionStart).toBe(1);
		expect(e.selectionEnd).toBe(3);
		e.setRangeText('Q', 1, 3, 'end');
		expect(e.selectionStart).toBe(2);
		expect(e.selectionEnd).toBe(2);
		expect(() => e.setRangeText('x', 3, 1)).toThrow(
			expect.objectContaining({ name: 'IndexSizeError' }),
		);
	});
}
