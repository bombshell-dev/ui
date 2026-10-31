import type { CompatibilityContext } from '../context.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-parsing-and-serialization';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'parses independent HTML documents with inert script and decoded entities',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
			const parsed = new DOMParser().parseFromString(
				'<title>A &amp; B</title><p>x</p><script>throw Error()</script>',
				'text/html',
			);
			expect(parsed).not.toBe(document);
			expect(parsed.title).toBe('A & B');
			expect(parsed.body.querySelector('p')!.textContent).toBe('x');
			expect(parsed.contentType).toBe('text/html');
		},
	);
	context.test('parses XML with namespaces and preserves element name case', (fixture) => {
		const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
		const parsed = new DOMParser().parseFromString(
			'<p:Root xmlns:p="urn:p"><p:Child/></p:Root>',
			'application/xml',
		);
		expect(parsed.documentElement.localName).toBe('Root');
		expect(parsed.documentElement.namespaceURI).toBe('urn:p');
		expect(parsed.documentElement.firstElementChild!.localName).toBe('Child');
		expect(parsed.querySelector('parsererror')).toBeNull();
	});
	context.test('returns an XML error document for malformed input', (fixture) => {
		const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
		const parsed = new DOMParser().parseFromString('<root><x></root>', 'application/xml');
		expect(parsed.getElementsByTagName('parsererror').length).toBeGreaterThan(0);
	});
	context.test('serializes XML namespaces and reparses equivalent trees', (fixture) => {
		const document = fixture.document as unknown as Document;
		const XMLSerializer = fixture.globals('XMLSerializer') as typeof globalThis.XMLSerializer,
			DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
		const xml = document.implementation.createDocument('urn:p', 'p:Root');
		xml.documentElement.setAttribute('title', 'a&<');
		const text = new XMLSerializer().serializeToString(xml);
		expect(text).toContain('xmlns:p="urn:p"');
		expect(text).toContain('title="a&amp;&lt;"');
		const parsed = new DOMParser().parseFromString(text, 'application/xml');
		expect(parsed.documentElement.namespaceURI).toBe('urn:p');
		expect(parsed.documentElement.getAttribute('title')).toBe('a&<');
	});
}
