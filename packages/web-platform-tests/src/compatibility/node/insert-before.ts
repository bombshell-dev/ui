import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-node-insertbefore';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'supports null anchors and reorders in both directions atomically',
		({ document }) => {
			const parent = document.createElement('div');
			const a = document.createElement('a');
			const b = document.createElement('b');
			const c = document.createElement('i');
			parent.appendChild(a);
			parent.appendChild(b);
			parent.appendChild(c);
			parent.insertBefore(c, a);
			expect(parent.firstChild).toBe(c);
			expect(c.nextSibling).toBe(a);
			parent.insertBefore(c, null);
			expect(parent.lastChild).toBe(c);
			parent.insertBefore(a, a);
			expect(parent.firstChild).toBe(a);
			const outside = document.createElement('span');
			expect(() => outside.insertBefore(a, b)).toThrow(
				expect.objectContaining({ name: 'NotFoundError' }),
			);
			expect(a.parentNode).toBe(parent);
			expect(outside.childNodes.length).toBe(0);
		},
	);

	context.test('treats self insertion as a no-op and null as append', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b');
		p.appendChild(a);
		expect(p.insertBefore(a, a)).toBe(a);
		expect(Array.from(p.childNodes)).toEqual([a]);
		p.insertBefore(b, null);
		expect(Array.from(p.childNodes)).toEqual([a, b]);
	});

	context.test('rejects a foreign anchor without detaching the candidate', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			other = document.createElement('div'),
			a = document.createElement('i'),
			foreign = document.createElement('b');
		other.appendChild(a);
		expect(() => p.insertBefore(a, foreign)).toThrow(
			expect.objectContaining({ name: 'NotFoundError' }),
		);
		expect(a.parentNode).toBe(other);
		expect(p.childNodes.length).toBe(0);
	});
}
