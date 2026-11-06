import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#placeholder-label-option';
export const requires = ['elements.select.selection'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('treats the first empty option as a required placeholder', (fixture) => {
		const document = fixture.document;
		const select = document.createElement('select');
		select.required = true;
		const placeholder = document.createElement('option');
		placeholder.value = '';
		const choice = document.createElement('option');
		choice.value = 'chosen';
		select.append(placeholder, choice);
		expect(select.validity.valueMissing).toBe(true);
		select.value = 'chosen';
		expect(select.validity.valueMissing).toBe(false);
		select.setCustomValidity('Choose again');
		expect(select.checkValidity()).toBe(false);
		expect(select.validationMessage).toBe('Choose again');
		select.disabled = true;
		expect(select.willValidate).toBe(false);
	});

	context.test('required single select rejects the placeholder option', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('select');
		e.required = true;
		e.innerHTML = '<option value="">Choose</option><option value=x>X</option>';
		expect(e.validity.valueMissing).toBe(true);
		e.value = 'x';
		expect(e.checkValidity()).toBe(true);
		e.disabled = true;
		e.value = '';
		expect(e.willValidate).toBe(false);
	});
}
