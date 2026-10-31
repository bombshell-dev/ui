import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-node-appendchild';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('returns the appended node and preserves insertion order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createTextNode('a'),
			b = document.createElement('span');
		expect(p.appendChild(a)).toBe(a);
		expect(p.appendChild(b)).toBe(b);
		expect(Array.from(p.childNodes)).toEqual([a, b]);
	});
	context.test('keeps nested child identity and permits detached tree construction', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			child = document.createElement('span'),
			t = document.createTextNode('x');
		child.appendChild(t);
		p.appendChild(child);
		expect(p.childNodes[0]).toBe(child);
		expect(child.childNodes[0]).toBe(t);
	});
}
