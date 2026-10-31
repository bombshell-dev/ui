import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-characterdata-data';
export const requires = ['node.basicAppend'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reads and replaces text data including empty and Unicode strings', (fixture) => {
		const document = fixture.document as unknown as Document;
		const t = document.createTextNode('first');
		for (const value of ['', '😀', 'a\nb', 'last']) {
			t.data = value;
			expect(t.data).toBe(value);
		}
	});
	context.test('retains identity and independent sibling values on data writes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createTextNode('a'),
			b = document.createTextNode('b');
		const parent = document.createElement('div');
		parent.appendChild(a);
		parent.appendChild(b);
		a.data = 'next';
		expect(parent.childNodes[0]).toBe(a);
		expect(parent.childNodes[1]).toBe(b);
		expect(b.data).toBe('b');
	});
}
