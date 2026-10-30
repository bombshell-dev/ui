import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#interface-domimplementation';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('creates XML documents with namespaced roots and doctypes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const impl = document.implementation;
		const dt = impl.createDocumentType('p:root', 'public', 'system');
		const xml = impl.createDocument('urn:test', 'p:root', dt);
		expect(xml.contentType).toBe('application/xml');
		expect(xml.documentElement.namespaceURI).toBe('urn:test');
		expect(xml.documentElement.prefix).toBe('p');
		expect(xml.doctype).toBe(dt);
		expect(dt.ownerDocument).toBe(xml);
		expect(dt.publicId).toBe('public');
		expect(xml.createElement('MiXeD').tagName).toBe('MiXeD');
	});
	context.test('validates qualified names and namespace constraints', (fixture) => {
		const document = fixture.document as unknown as Document;
		for (const operation of [
			() => document.createElement('a b'),
			() => document.createAttribute('a b'),
		])
			expect(operation).toThrow(expect.objectContaining({ name: 'InvalidCharacterError' }));
		expect(() => document.createElementNS(null, 'p:x')).toThrow(
			expect.objectContaining({ name: 'NamespaceError' }),
		);
		expect(() => document.createElementNS('urn:x', 'xml:x')).toThrow(
			expect.objectContaining({ name: 'NamespaceError' }),
		);
	});
	context.test('creates independent HTML skeletons with title text', (fixture) => {
		const document = fixture.document as unknown as Document;
		const other = document.implementation.createHTMLDocument('<title>');
		expect(other).not.toBe(document);
		expect(other.doctype!.name).toBe('html');
		expect(other.head).not.toBeNull();
		expect(other.body).not.toBeNull();
		expect(other.title).toBe('<title>');
		expect(other.head.querySelector('title')!.textContent).toBe('<title>');
	});
}
