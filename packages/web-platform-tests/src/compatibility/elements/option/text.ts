import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#dom-option-text';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('collapses ASCII whitespace and excludes script descendants', (fixture) => {
		const document = fixture.document;
		const option = document.createElement('option');
		option.append('  one\n\t');
		const span = document.createElement('span');
		span.textContent = ' two\u00a0three  ';
		const script = document.createElement('script');
		script.textContent = 'ignored';
		option.append(span, script);
		expect(option.text).toBe('one two\u00a0three');
		option.text = 'replacement';
		expect(option.textContent).toBe('replacement');
		expect(option.childNodes.length).toBe(1);
	});

	context.test('collapses ASCII whitespace and uses text as the value fallback', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('option');
		e.textContent = '  a\n b  ';
		expect(e.text).toBe('a b');
		expect(e.value).toBe('a b');
		e.value = 'explicit';
		expect(e.text).toBe('a b');
		expect(e.value).toBe('explicit');
		e.removeAttribute('value');
		expect(e.value).toBe('a b');
	});
}
