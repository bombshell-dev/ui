import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-range-createcontextualfragment';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('uses table context for contextual fragments', (fixture) => {
		const document = fixture.document as unknown as Document;
		const table = document.createElement('table');
		const range = document.createRange();
		range.selectNodeContents(table);
		const fragment = range.createContextualFragment('<tr><td>x</td></tr>');
		expect((fragment.firstChild as Element).localName).toBe('tbody');
		expect(fragment.querySelector('td')!.textContent).toBe('x');
		expect(table.childNodes.length).toBe(0);
	});
	context.test('parses raw text and entities according to context', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('textarea');
		e.innerHTML = '&lt;b&gt;&amp;';
		expect(e.textContent).toBe('<b>&');
		const script = document.createElement('script');
		script.innerHTML = 'if (a < b) x="&amp;";';
		expect(script.textContent).toBe('if (a < b) x="&amp;";');
	});
	context.test('keeps scripts inert during markup replacement', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		fixture.connect(e as unknown as DOMElementContract);
		e.innerHTML = '<script>throw new Error("must stay inert")</script><i>ok</i>';
		expect(e.lastChild!.textContent).toBe('ok');
	});
}
