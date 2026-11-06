import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects explicit value, label, and disabled', (fixture) => {
		const document = fixture.document;
		const option = document.createElement('option');
		option.text = 'Visible';
		expect(option.value).toBe('Visible');
		expect(option.label).toBe('Visible');
		option.value = '';
		option.label = 'Label';
		option.disabled = true;
		expect(option.value).toBe('');
		expect(option.label).toBe('Label');
		expect(option.getAttribute('value')).toBe('');
		expect(option.hasAttribute('disabled')).toBe(true);
	});

	context.test('reflects defaultSelected independently of dirty selectedness', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('option');
		expect(e.disabled).toBe(false);
		expect(e.defaultSelected).toBe(false);
		expect(e.label).toBe('');
		e.disabled = true;
		expect(e.hasAttribute('disabled')).toBe(true);
		e.label = 'label';
		expect(e.getAttribute('label')).toBe('label');
		e.defaultSelected = true;
		expect(e.getAttribute('selected')).toBe('');
	});
}
