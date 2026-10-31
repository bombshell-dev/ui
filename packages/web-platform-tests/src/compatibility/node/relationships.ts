import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#interface-node';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('maintains parent child and sibling identity', ({ document }) => {
		const parent = document.createElement('div');
		const a = document.createElement('span');
		const b = document.createTextNode('b');
		parent.appendChild(a);
		parent.appendChild(b);
		expect(a.parentNode).toBe(parent);
		expect(b.parentElement).toBe(parent);
		expect(parent.firstChild).toBe(a);
		expect(parent.lastChild).toBe(b);
		expect(a.nextSibling).toBe(b);
		expect(b.previousSibling).toBe(a);
		expect(a.previousSibling).toBeNull();
		expect(b.nextSibling).toBeNull();
		expect(parent.contains(b)).toBe(true);
		expect(a.contains(b)).toBe(false);
		expect(parent.contains(parent)).toBe(true);
		expect(parent.hasChildNodes()).toBe(true);
	});

	context.test('tracks first, last and sibling links after reordering', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createTextNode('b'),
			c = document.createElement('u');
		p.append(a, b, c);
		expect(p.firstChild).toBe(a);
		expect(p.lastChild).toBe(c);
		expect(b.previousSibling).toBe(a);
		expect(b.nextSibling).toBe(c);
		p.insertBefore(c, a);
		expect(c.previousSibling).toBeNull();
		expect(a.previousSibling).toBe(c);
		expect(b.nextSibling).toBeNull();
	});
}
