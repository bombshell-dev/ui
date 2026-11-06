import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#namespaces';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('preserves namespace local names prefixes and attribute lookup', ({ document }) => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg:linearGradient');
		expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg');
		expect(svg.prefix).toBe('svg');
		expect(svg.localName).toBe('linearGradient');
		svg.setAttributeNS('urn:test', 'p:name', 'value');
		expect(svg.getAttributeNS('urn:test', 'name')).toBe('value');
		const attr = svg.getAttributeNodeNS('urn:test', 'name');
		expect(attr?.prefix).toBe('p');
		expect(attr?.localName).toBe('name');
		expect(() => document.createElementNS(null, 'p:name')).toThrow(
			expect.objectContaining({ name: 'NamespaceError' }),
		);
	});

	context.test('distinguishes equal local attribute names in different namespaces', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElementNS('urn:root', 'p:root');
		e.setAttributeNS('urn:a', 'a:id', 'first');
		e.setAttributeNS('urn:b', 'b:id', 'second');
		expect(e.getAttributeNS('urn:a', 'id')).toBe('first');
		expect(e.getAttributeNS('urn:b', 'id')).toBe('second');
		e.removeAttributeNS('urn:a', 'id');
		expect(e.hasAttributeNS('urn:a', 'id')).toBe(false);
		expect(e.getAttributeNS('urn:b', 'id')).toBe('second');
	});

	context.test('resolves inherited namespace declarations', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElementNS('urn:root', 'p:root'),
			child = document.createElementNS('urn:child', 'c:child');
		e.appendChild(child);
		expect(child.lookupNamespaceURI('p')).toBe('urn:root');
		expect(e.lookupPrefix('urn:root')).toBe('p');
		expect(e.isDefaultNamespace('urn:root')).toBe(false);
	});
}
