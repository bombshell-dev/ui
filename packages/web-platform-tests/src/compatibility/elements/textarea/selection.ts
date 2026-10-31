import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#textFieldSelection';
export const requires = ['elements.textarea.value'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('uses UTF-16 offsets and clamps selection boundaries', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
		element.value = 'a😀b';
		element.setSelectionRange(1, 3, 'backward');
		expect(element.selectionStart).toBe(1);
		expect(element.selectionEnd).toBe(3);
		expect(element.selectionDirection).toBe('backward');
		element.setSelectionRange(99, 99);
		expect(element.selectionStart).toBe(4);
		expect(element.selectionEnd).toBe(4);
		element.setSelectionRange(3, 1);
		expect(element.selectionStart).toBe(1);
		expect(element.selectionEnd).toBe(1);
		element.select();
		expect(element.selectionStart).toBe(0);
		expect(element.selectionEnd).toBe(4);
	});
	context.test('preserves the selection when assigning the same value', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
		element.value = 'hello';
		element.setSelectionRange(1, 3);
		element.value = 'hello';
		expect(element.selectionStart).toBe(1);
		expect(element.selectionEnd).toBe(3);
		element.value = 'new';
		expect(element.selectionStart).toBe(3);
		expect(element.selectionEnd).toBe(3);
	});
}
