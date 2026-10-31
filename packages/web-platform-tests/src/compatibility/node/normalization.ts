import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-node-normalize';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('merges adjacent text and removes empties without crossing comments', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createTextNode('a'),
			empty = document.createTextNode(''),
			b = document.createTextNode('b'),
			c = document.createComment('c');
		p.append(empty, a, b, c, 'd', 'e');
		p.normalize();
		expect(Array.from(p.childNodes).map((n) => n.nodeValue)).toEqual(['ab', 'c', 'de']);
		expect(p.firstChild).toBe(a);
		expect(empty.parentNode).toBeNull();
		expect(b.parentNode).toBeNull();
		p.normalize();
		expect(p.childNodes.length).toBe(3);
	});
	context.test('normalizes descendants while retaining element boundaries', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			child = document.createElement('i');
		child.append('a', '', 'b');
		p.append('x', child, 'y');
		p.normalize();
		expect(child.childNodes.length).toBe(1);
		expect(child.textContent).toBe('ab');
		expect(p.childNodes.length).toBe(3);
	});
}
