import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-legend-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('gets its form through its parent fieldset', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const fieldset = document.createElement('fieldset');
		const legend = document.createElement('legend');
		form.appendChild(fieldset);
		fieldset.appendChild(legend);
		expect(legend.form).toBe(form);
		form.appendChild(legend);
		expect(legend.form).toBeNull();
	});

	context.test('form ownership comes from its parent fieldset', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			fieldset = document.createElement('fieldset'),
			legend = document.createElement('legend');
		expect(legend.form).toBeNull();
		fieldset.append(legend);
		form.append(fieldset);
		expect(legend.form).toBe(form);
		form.append(legend);
		expect(legend.form).toBeNull();
	});
}
