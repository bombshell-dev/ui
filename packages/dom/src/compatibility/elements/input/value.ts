import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#the-input-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps default and dirty values separate', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
		element.defaultValue = 'original';
		expect(element.value).toBe('original');
		element.value = 'edited';
		element.defaultValue = 'replacement';
		expect(element.value).toBe('edited');
		expect(element.defaultValue).toBe('replacement');
	});
	context.test('normalizes line breaks in the API value', (fixture) => {
		const document = fixture.document;
		const element = document.createElement('input');
		element.value = 'a\r\nb\rc';
		expect(element.value).toBe('abc');
	});

	context.test('keeps dirty value independent from defaults until reset', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('input');
		form.append(e);
		expect(e.value).toBe('');
		e.defaultValue = 'a';
		expect(e.value).toBe('a');
		e.value = 'dirty';
		e.setAttribute('value', 'b');
		expect(e.value).toBe('dirty');
		expect(e.defaultValue).toBe('b');
		form.reset();
		expect(e.value).toBe('b');
		e.defaultValue = 'c';
		expect(e.value).toBe('c');
	});

	context.test('does not fire input or change for programmatic writes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		const seen: string[] = [];
		e.addEventListener('input', () => seen.push('input'));
		e.addEventListener('change', () => seen.push('change'));
		e.value = 'x';
		expect(seen).toEqual([]);
	});
}
