import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-node-comparedocumentposition';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('compares identity, ancestors, and ordered siblings', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('a'),
			b = document.createElement('b');
		p.append(a, b);
		expect(a.compareDocumentPosition(a)).toBe(0);
		expect(a.compareDocumentPosition(b)).toBe(4);
		expect(b.compareDocumentPosition(a)).toBe(2);
		expect(p.compareDocumentPosition(a)).toBe(20);
		expect(a.compareDocumentPosition(p)).toBe(10);
		expect(p.contains(a)).toBe(true);
		expect(a.contains(null)).toBe(false);
	});
	context.test('distinguishes structural equality from identity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createElement('div');
		a.setAttribute('title', 'x');
		a.append('text');
		const b = a.cloneNode(true);
		expect(a.isEqualNode(b)).toBe(true);
		expect(a.isSameNode(b)).toBe(false);
		(b as Element).setAttribute('title', 'y');
		expect(a.isEqualNode(b)).toBe(false);
	});
	context.test(
		'reports disconnected nodes symmetrically with implementation-specific order',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const a = document.createElement('i'),
				b = document.createElement('i');
			const ab = a.compareDocumentPosition(b),
				ba = b.compareDocumentPosition(a);
			expect(ab & 1).toBe(1);
			expect(ab & 32).toBe(32);
			expect(Boolean(ab & 2)).toBe(Boolean(ba & 4));
		},
	);
}
