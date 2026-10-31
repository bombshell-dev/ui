import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('exposes required and custom validity independently', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
		element.required = true;
		expect(element.willValidate).toBe(true);
		expect(element.validity.valueMissing).toBe(true);
		expect(element.checkValidity()).toBe(false);
		element.value = 'present';
		expect(element.validity.valueMissing).toBe(false);
		element.setCustomValidity('Try again');
		expect(element.validity.customError).toBe(true);
		expect(element.validationMessage).toBe('Try again');
		element.setCustomValidity('');
		expect(element.validity.valid).toBe(true);
		element.disabled = true;
		expect(element.willValidate).toBe(false);
	});

	context.test('required textarea validity tracks its current value', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea');
		e.required = true;
		expect(e.validity.valueMissing).toBe(true);
		e.value = 'x';
		expect(e.checkValidity()).toBe(true);
		e.value = '';
		e.readOnly = true;
		expect(e.willValidate).toBe(false);
		expect(e.checkValidity()).toBe(true);
	});

	context.test('reports and clears custom validity messages', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea');
		e.setCustomValidity('invalid');
		expect(e.validity.customError).toBe(true);
		expect(e.validationMessage).toBe('invalid');
		e.setCustomValidity('');
		expect(e.validity.valid).toBe(true);
	});
}
