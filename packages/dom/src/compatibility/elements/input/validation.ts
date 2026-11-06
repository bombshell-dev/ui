import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('exposes required and custom validity independently', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
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

	context.test('updates required validity and disabled validation candidacy', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.required = true;
		expect(e.validity.valueMissing).toBe(true);
		expect(e.checkValidity()).toBe(false);
		e.value = 'x';
		expect(e.validity.valueMissing).toBe(false);
		expect(e.checkValidity()).toBe(true);
		e.disabled = true;
		e.value = '';
		expect(e.willValidate).toBe(false);
		expect(e.checkValidity()).toBe(true);
	});

	context.test('retains custom errors until explicitly cleared', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.setCustomValidity('problem');
		expect(e.validity.customError).toBe(true);
		expect(e.validationMessage).toBe('problem');
		e.value = 'changed';
		expect(e.checkValidity()).toBe(false);
		e.setCustomValidity('');
		expect(e.validity.customError).toBe(false);
		expect(e.checkValidity()).toBe(true);
	});
}
