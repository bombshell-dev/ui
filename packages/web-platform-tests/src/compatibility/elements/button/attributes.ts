import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects value, name, and disabled attributes', (fixture) => {
		const document = fixture.document;
		const button = document.createElement('button');
		expect(button.type).toBe('submit');
		button.type = 'reset';
		button.name = 'action';
		button.value = 'save';
		button.disabled = true;
		expect(button.getAttribute('type')).toBe('reset');
		expect(button.getAttribute('name')).toBe('action');
		expect(button.getAttribute('value')).toBe('save');
		expect(button.hasAttribute('disabled')).toBe(true);
		button.removeAttribute('disabled');
		expect(button.disabled).toBe(false);
	});

	context.test('normalizes invalid type and reflects disabled presence', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('button');
		expect(e.type).toBe('submit');
		e.setAttribute('type', 'invalid');
		expect(e.type).toBe('submit');
		e.type = 'reset';
		expect(e.getAttribute('type')).toBe('reset');
		e.setAttribute('disabled', 'false');
		expect(e.disabled).toBe(true);
		e.disabled = false;
		expect(e.hasAttribute('disabled')).toBe(false);
	});
}
