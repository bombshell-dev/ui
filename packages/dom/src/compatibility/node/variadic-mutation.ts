import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-parentnode';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'converts strings and preserves argument order when reusing siblings',
		({ document }) => {
			const parent = document.createElement('div');
			const a = document.createElement('span');
			const b = document.createElement('b');
			const c = document.createElement('i');
			parent.append(a, b, c);
			parent.prepend(a, c);
			expect(parent.childNodes[0]).toBe(a);
			expect(parent.childNodes[1]).toBe(c);
			expect(parent.childNodes[2]).toBe(b);
			c.before('before');
			c.after('after');
			expect(c.previousSibling?.nodeValue).toBe('before');
			expect(c.nextSibling?.nodeValue).toBe('after');
			c.replaceWith(c, 'tail');
			expect(c.parentNode).toBe(parent);
			expect(c.nextSibling?.nodeValue).toBe('tail');
			parent.replaceChildren('one', a, 'two');
			expect(parent.textContent).toBe('onetwo');
			expect(parent.childNodes[1]).toBe(a);
		},
	);

	context.test('supports no-argument operations and string conversion', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.append();
		expect(p.childNodes.length).toBe(0);
		p.append('a', 'b');
		expect(p.childNodes.length).toBe(2);
		p.prepend('first');
		expect(p.textContent).toBe('firstab');
		p.replaceChildren();
		expect(p.childNodes.length).toBe(0);
	});

	context.test('handles self references in before and after operations', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b');
		p.append(a, b);
		a.after(a, 'x');
		expect(Array.from(p.childNodes).map((n) => n.nodeName)).toEqual(['I', '#text', 'B']);
		b.before(b);
		expect(p.lastChild).toBe(b);
	});
}
