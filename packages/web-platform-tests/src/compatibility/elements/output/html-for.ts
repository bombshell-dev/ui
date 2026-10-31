import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#dom-output-htmlfor';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('keeps the token list and for attribute synchronized', (fixture) => {
		const document = fixture.document;
		const output = document.createElement('output');
		const tokens = output.htmlFor;
		output.setAttribute('for', 'first second');
		expect(tokens.contains('first')).toBe(true);
		expect(tokens.contains('second')).toBe(true);
		tokens.add('third');
		expect(output.getAttribute('for')).toBe('first second third');
		tokens.remove('second');
		expect(output.getAttribute('for')).toBe('first third');
		expect(output.htmlFor).toBe(tokens);
	});

	context.test('htmlFor token list synchronizes for attribute and stays stable', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('output'),
			list = e.htmlFor;
		e.setAttribute('for', 'a b a');
		expect(Array.from(list)).toEqual(['a', 'b']);
		list.add('c');
		expect(e.getAttribute('for')).toBe('a b c');
		e.removeAttribute('for');
		expect(list.length).toBe(0);
		expect(e.htmlFor).toBe(list);
	});
}
