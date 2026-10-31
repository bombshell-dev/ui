import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps a default value separately after entering value mode', (fixture) => {
		const document = fixture.document;
		const output = document.createElement('output');
		output.defaultValue = 'original';
		expect(output.value).toBe('original');
		expect(output.textContent).toBe('original');
		output.value = 'calculated';
		expect(output.textContent).toBe('calculated');
		expect(output.defaultValue).toBe('original');
		output.defaultValue = 'replacement';
		expect(output.value).toBe('calculated');
		expect(output.type).toBe('output');
		expect(output.willValidate).toBe(false);
	});

	context.test('value writes replace text while defaultValue remains independent', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('output');
		e.defaultValue = 'default';
		expect(e.value).toBe('default');
		e.value = 'current';
		expect(e.textContent).toBe('current');
		expect(e.defaultValue).toBe('default');
		e.defaultValue = 'next';
		expect(e.value).toBe('current');
	});
}
