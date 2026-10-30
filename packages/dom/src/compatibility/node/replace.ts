import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-node-replace';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'returns the removed node and preserves invariants on invalid replacements',
		({ document }) => {
			const parent = document.createElement('div');
			const a = document.createElement('span');
			const b = document.createElement('b');
			parent.appendChild(a);
			parent.appendChild(b);
			expect(parent.replaceChild(b, a)).toBe(a);
			expect(parent.childNodes.length).toBe(1);
			expect(parent.firstChild).toBe(b);
			expect(a.parentNode).toBeNull();
			expect(parent.replaceChild(b, b)).toBe(b);
			expect(() => parent.replaceChild(parent, b)).toThrow(
				expect.objectContaining({ name: 'HierarchyRequestError' }),
			);
			expect(parent.firstChild).toBe(b);
		},
	);

	context.test('replacing a child with itself preserves identity and order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i');
		p.appendChild(a);
		expect(p.replaceChild(a, a)).toBe(a);
		expect(p.firstChild).toBe(a);
		expect(a.parentNode).toBe(p);
	});

	context.test('replaces using an existing sibling without duplicate references', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			b = document.createElement('b'),
			c = document.createElement('u');
		p.append(a, b, c);
		expect(p.replaceChild(c, a)).toBe(a);
		expect(Array.from(p.childNodes)).toEqual([c, b]);
		expect(a.parentNode).toBeNull();
	});

	context.test('rejects missing children and cycles before changing either tree', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('i'),
			other = document.createElement('b');
		p.appendChild(a);
		expect(() => p.replaceChild(other, other)).toThrow(
			expect.objectContaining({ name: 'NotFoundError' }),
		);
		expect(() => p.replaceChild(p, a)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' }),
		);
		expect(p.firstChild).toBe(a);
	});
}
