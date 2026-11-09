import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const type of [
		'text/xml',
		'application/xml',
		'application/xhtml+xml',
		'image/svg+xml',
	] as const) {
		context.test('Should parse correctly in type ' + type, ({ document, DOMParser, Document }) => {
			function checkMetadata(doc: Document, contentType: string) {
				expect(doc instanceof Document, 'Should be Document').toBe(true);
				expect(doc.URL, 'URL').toBe(document.URL);
				expect(doc.documentURI, 'documentURI').toBe(document.URL);
				expect(doc.baseURI, 'baseURI').toBe(document.URL);
				expect(doc.characterSet, 'characterSet').toBe('UTF-8');
				expect(doc.charset, 'charset').toBe('UTF-8');
				expect(doc.inputEncoding, 'inputEncoding').toBe('UTF-8');
				expect(doc.contentType, 'contentType').toBe(contentType);
				expect(doc.location, 'location').toBe(null);
			}

			let p = new DOMParser();
			let doc = p.parseFromString('<foo/>', type);
			expect(doc instanceof Document, 'Should be Document').toBe(true);
			checkMetadata(doc, type);
			expect(doc.documentElement.namespaceURI).toBe(null);
			expect(doc.documentElement.localName).toBe('foo');
			expect(doc.documentElement.tagName).toBe('foo');
		});
		context.test(
			'XMLDocument interface for correctly parsed document with type ' + type,
			({ document, DOMParser, Document, XMLDocument }) => {
				function checkMetadata(doc: Document, contentType: string) {
					expect(doc instanceof Document, 'Should be Document').toBe(true);
					expect(doc.URL, 'URL').toBe(document.URL);
					expect(doc.documentURI, 'documentURI').toBe(document.URL);
					expect(doc.baseURI, 'baseURI').toBe(document.URL);
					expect(doc.characterSet, 'characterSet').toBe('UTF-8');
					expect(doc.charset, 'charset').toBe('UTF-8');
					expect(doc.inputEncoding, 'inputEncoding').toBe('UTF-8');
					expect(doc.contentType, 'contentType').toBe(contentType);
					expect(doc.location, 'location').toBe(null);
				}

				let p = new DOMParser();
				let doc = p.parseFromString('<foo/>', type);
				expect(doc instanceof XMLDocument, 'Should not be XMLDocument').toBe(false);
			},
		);
		context.test(
			'Should return an error document for XML wellformedness errors in type ' + type,
			({ document, DOMParser, Document }) => {
				function checkMetadata(doc: Document, contentType: string) {
					expect(doc instanceof Document, 'Should be Document').toBe(true);
					expect(doc.URL, 'URL').toBe(document.URL);
					expect(doc.documentURI, 'documentURI').toBe(document.URL);
					expect(doc.baseURI, 'baseURI').toBe(document.URL);
					expect(doc.characterSet, 'characterSet').toBe('UTF-8');
					expect(doc.charset, 'charset').toBe('UTF-8');
					expect(doc.inputEncoding, 'inputEncoding').toBe('UTF-8');
					expect(doc.contentType, 'contentType').toBe(contentType);
					expect(doc.location, 'location').toBe(null);
				}

				let p = new DOMParser();
				let doc = p.parseFromString('<foo>', type);
				checkMetadata(doc, type);
				expect(doc.documentElement.namespaceURI).toBe(
					'http://www.mozilla.org/newlayout/xml/parsererror.xml',
				);
				expect(doc.documentElement.localName).toBe('parsererror');
				expect(doc.documentElement.tagName).toBe('parsererror');
			},
		);
		context.test(
			'XMLDocument interface for incorrectly parsed document with type ' + type,
			({ document, DOMParser, Document, XMLDocument }) => {
				function checkMetadata(doc: Document, contentType: string) {
					expect(doc instanceof Document, 'Should be Document').toBe(true);
					expect(doc.URL, 'URL').toBe(document.URL);
					expect(doc.documentURI, 'documentURI').toBe(document.URL);
					expect(doc.baseURI, 'baseURI').toBe(document.URL);
					expect(doc.characterSet, 'characterSet').toBe('UTF-8');
					expect(doc.charset, 'charset').toBe('UTF-8');
					expect(doc.inputEncoding, 'inputEncoding').toBe('UTF-8');
					expect(doc.contentType, 'contentType').toBe(contentType);
					expect(doc.location, 'location').toBe(null);
				}

				let p = new DOMParser();
				let doc = p.parseFromString('<foo>', type);
				expect(doc instanceof XMLDocument, 'Should not be XMLDocument').toBe(false);
			},
		);
		context.test(
			'scripting must be disabled with type ' + type,
			({ document, DOMParser, Document }) => {
				function checkMetadata(doc: Document, contentType: string) {
					expect(doc instanceof Document, 'Should be Document').toBe(true);
					expect(doc.URL, 'URL').toBe(document.URL);
					expect(doc.documentURI, 'documentURI').toBe(document.URL);
					expect(doc.baseURI, 'baseURI').toBe(document.URL);
					expect(doc.characterSet, 'characterSet').toBe('UTF-8');
					expect(doc.charset, 'charset').toBe('UTF-8');
					expect(doc.inputEncoding, 'inputEncoding').toBe('UTF-8');
					expect(doc.contentType, 'contentType').toBe(contentType);
					expect(doc.location, 'location').toBe(null);
				}

				let p = new DOMParser();
				let doc = p.parseFromString(
					`
      <html>
        <head></head>
        <body>
          <script>document.x = 5;<\/script>
          <noscript><p>test1</p><p>test2</p></noscript>
        </body>
      </html>`,
					type,
				);

				expect(
					(doc as Document & { x?: number }).x,
					'script must not be executed on the inner document',
				).toBe(undefined);
				expect(
					(document as Document & { x?: number }).x,
					'script must not be executed on the outer document',
				).toBe(undefined);

				const body = doc.documentElement.children[1]!;
				expect(body.localName).toBe('body');
				expect(body.children[1]!.localName).toBe('noscript');
				expect(body.children[1]!.children.length).toBe(2);
				expect(body.children[1]!.children[0]!.localName).toBe('p');
				expect(body.children[1]!.children[1]!.localName).toBe('p');
			},
		);
	}
}
