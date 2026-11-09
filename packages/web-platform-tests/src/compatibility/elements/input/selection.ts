import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#textFieldSelection';
export const requires = ['elements.input.value'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('uses UTF-16 offsets and clamps selection boundaries', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
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
		const element = document.createElement('input');
		element.value = 'hello';
		element.setSelectionRange(1, 3);
		element.value = 'hello';
		expect(element.selectionStart).toBe(1);
		expect(element.selectionEnd).toBe(3);
		element.value = 'new';
		expect(element.selectionStart).toBe(3);
		expect(element.selectionEnd).toBe(3);
	});

	context.test('clamps endpoints and collapses reversed selection', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.value = 'abc';
		e.setSelectionRange(1, 99, 'backward');
		expect(e.selectionStart).toBe(1);
		expect(e.selectionEnd).toBe(3);
		expect(e.selectionDirection).toBe('backward');
		e.setSelectionRange(3, 1);
		expect(e.selectionStart).toBe(1);
		expect(e.selectionEnd).toBe(1);
	});

	context.test('rejects selection methods on unsupported input types', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'number';
		expect(e.selectionStart).toBeNull();
		expect(e.selectionEnd).toBeNull();
		expect(() => e.setSelectionRange(0, 1)).toThrow(
			expect.objectContaining({ name: 'InvalidStateError' }),
		);
	});
}
