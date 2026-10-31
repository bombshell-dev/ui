import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element';
export const requires = ['elements.form.reset', 'elements.output.value'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('form reset restores the default and default-value mode', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const output = document.createElement('output');
		form.appendChild(output);
		output.defaultValue = 'zero';
		output.value = 'one';
		form.reset();
		expect(output.value).toBe('zero');
		output.defaultValue = 'two';
		expect(output.value).toBe('two');
	});

	context.test('reset applies latest default after dirty output changes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('output');
		form.append(e);
		e.defaultValue = 'a';
		e.value = 'dirty';
		e.defaultValue = 'b';
		form.reset();
		expect(e.value).toBe('b');
		expect(e.textContent).toBe('b');
	});
}
