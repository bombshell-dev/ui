import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps default and dirty values separate', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
		element.defaultValue = 'original';
		expect(element.value).toBe('original');
		element.value = 'edited';
		element.defaultValue = 'replacement';
		expect(element.value).toBe('edited');
		expect(element.defaultValue).toBe('replacement');
	});
	context.test('normalizes line breaks in the API value', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('textarea');
		element.value = 'a\r\nb\rc';
		expect(element.value).toBe('a\nb\nc');
	});

	context.test('normalizes newlines and separates dirty value from text defaults', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea');
		e.textContent = 'initial';
		expect(e.defaultValue).toBe('initial');
		expect(e.value).toBe('initial');
		e.value = 'a\r\nb\rc';
		expect(e.value).toBe('a\nb\nc');
		e.textContent = 'new default';
		expect(e.value).toBe('a\nb\nc');
		expect(e.defaultValue).toBe('new default');
	});
}
