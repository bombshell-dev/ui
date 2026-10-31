import type { CompatibilityContext } from '../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/parsing.html#html-fragment-parsing-algorithm';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('parses markup and references into real fragment children', ({ document }) => {
		const container = document.createElement('div');
		container.innerHTML = '<span title="a&amp;b">one&amp;two</span><!--note-->';
		expect(container.childNodes.length).toBe(2);
		expect(container.firstElementChild?.localName).toBe('span');
		expect(container.firstElementChild?.getAttribute('title')).toBe('a&b');
		expect(container.firstElementChild?.textContent).toBe('one&two');
		expect(container.lastChild?.nodeType).toBe(8);
	});

	context.test('repairs table structure and decodes numeric character references', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('table');
		e.innerHTML = '<tr><td>&#65;&#x1f600;</td></tr>';
		expect(e.firstElementChild!.localName).toBe('tbody');
		expect(e.querySelector('td')!.textContent).toBe('A😀');
	});

	context.test('innerHTML replacement detaches previous descendants', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.innerHTML = '<i>a</i>';
		const old = e.firstChild!;
		e.innerHTML = '<b>b</b>';
		expect(old.parentNode).toBeNull();
		expect(e.firstElementChild!.localName).toBe('b');
		e.innerHTML = '';
		expect(e.childNodes.length).toBe(0);
	});
}
