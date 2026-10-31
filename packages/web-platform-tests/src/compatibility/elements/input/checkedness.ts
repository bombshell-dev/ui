import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#dom-input-checked';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps checkedness separate from the default after a property write', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		input.type = 'checkbox';
		expect(input.checked).toBe(false);
		input.defaultChecked = true;
		expect(input.checked).toBe(true);
		input.checked = false;
		input.defaultChecked = false;
		input.defaultChecked = true;
		expect(input.hasAttribute('checked')).toBe(true);
		expect(input.checked).toBe(false);
		input.indeterminate = true;
		expect(input.checked).toBe(false);
	});

	context.test('resets dirty checkedness from the checked attribute', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('input');
		e.type = 'checkbox';
		form.append(e);
		e.defaultChecked = true;
		expect(e.checked).toBe(true);
		e.checked = false;
		e.defaultChecked = false;
		e.defaultChecked = true;
		expect(e.checked).toBe(false);
		form.reset();
		expect(e.checked).toBe(true);
		expect(e.defaultChecked).toBe(true);
	});
}
