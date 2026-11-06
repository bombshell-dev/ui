import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-parentnode-children';
export const requires = ['node.basicAppend'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('filters text nodes from children in tree order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('span'),
			b = document.createElement('b');
		expect(p.children.length).toBe(0);
		p.appendChild(document.createTextNode('before'));
		p.appendChild(a);
		p.appendChild(document.createTextNode('between'));
		p.appendChild(b);
		expect(Array.from(p.children)).toEqual([a, b]);
	});
	context.test('includes only immediate element children', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('span'),
			b = document.createElement('b');
		a.appendChild(b);
		p.appendChild(a);
		expect(Array.from(p.children)).toEqual([a]);
	});
}
