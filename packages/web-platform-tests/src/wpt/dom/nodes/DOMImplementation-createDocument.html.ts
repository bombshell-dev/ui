import type { CompatibilityContext } from '../../../shared/context.ts';
import { createElementNSTests } from './Document-createElementNS.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	const htmlNamespace = 'http://www.w3.org/1999/xhtml',
		svgNamespace = 'http://www.w3.org/2000/svg',
		mathMLNamespace = 'http://www.w3.org/1998/Math/MathML';
	function createDocumentRows(document: Document, TypeError: typeof globalThis.TypeError) {
		const tests = createElementNSTests.map(function (t) {
				return [t[0], t[1], null, t[2]] as const;
			}),
			extra = [
				/* Arrays with four elements:
				 *   the namespace argument
				 *   the qualifiedName argument
				 *   the doctype argument
				 *   the expected exception, or null if none
				 */
				[null, null, false, TypeError],
				[null, '', null, null],
				[undefined, null, undefined, null],
				[undefined, undefined, undefined, null],
				[undefined, '', undefined, null],
				['http://example.com/', null, null, null],
				['http://example.com/', '', null, null],
				['/', null, null, null],
				['/', '', null, null],
				['http://www.w3.org/XML/1998/namespace', null, null, null],
				['http://www.w3.org/XML/1998/namespace', '', null, null],
				['http://www.w3.org/2000/xmlns/', null, null, null],
				['http://www.w3.org/2000/xmlns/', '', null, null],
				['foo:', null, null, null],
				['foo:', '', null, null],
				[null, null, document.implementation.createDocumentType('foo', '', ''), null],
				[null, null, document.doctype, null], // This causes a horrible WebKit bug (now fixed in trunk).
				[
					null,
					null,
					(function () {
						var foo = document.implementation.createDocumentType('bar', '', '');
						document.implementation.createDocument(null, null as unknown as string, foo);
						return foo;
					})(),
					null,
				], // DOCTYPE already associated with a document.
				[
					null,
					null,
					(function () {
						var bar = document.implementation.createDocument(null, null as unknown as string, null);
						return bar.implementation.createDocumentType('baz', '', '');
					})(),
					null,
				], // DOCTYPE created by a different implementation.
				[
					null,
					null,
					(function () {
						var bar = document.implementation.createDocument(null, null as unknown as string, null);
						var magic = bar.implementation.createDocumentType('quz', '', '');
						bar.implementation.createDocument(null, null as unknown as string, magic);
						return magic;
					})(),
					null,
				], // DOCTYPE created by a different implementation and already associated with a document.
				[null, 'foo', document.implementation.createDocumentType('foo', '', ''), null],
				['foo', null, document.implementation.createDocumentType('foo', '', ''), null],
				['foo', 'bar', document.implementation.createDocumentType('foo', '', ''), null],
				[htmlNamespace, '', null, null],
				[svgNamespace, '', null, null],
				[mathMLNamespace, '', null, null],
				[null, 'html', null, null],
				[null, 'svg', null, null],
				[null, 'math', null, null],
				[
					null,
					'',
					document.implementation.createDocumentType(
						'html',
						'-//W3C//DTD XHTML 1.0 Transitional//EN',
						'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd',
					),
				],
				[
					null,
					'',
					document.implementation.createDocumentType(
						'svg',
						'-//W3C//DTD SVG 1.1//EN',
						'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd',
					),
				],
				[
					null,
					'',
					document.implementation.createDocumentType(
						'math',
						'-//W3C//DTD MathML 2.0//EN',
						'http://www.w3.org/Math/DTD/mathml2/mathml2.dtd',
					),
				],
			] as const;
		return [...tests, ...extra];
	}

	for (let row = 0; row < createElementNSTests.length + 32; row++) {
		context.test(
			'createDocument row ' + row + '',
			({ document, TypeError, Node, XMLDocument, DOMException }) => {
				const [namespace, qualifiedName, doctype, expected] = createDocumentRows(
					document,
					TypeError,
				)[row]!;

				if (expected != null) {
					if (typeof expected == 'string') {
						if (expected === 'NAMESPACE_ERR') {
							expect(function () {
								document.implementation.createDocument(
									namespace as string | null,
									qualifiedName as string,
									doctype as DocumentType | null,
								);
							}).toThrow(
								expect.objectContaining({
									name: 'NamespaceError',
									code: 14,
									constructor: DOMException,
								}),
							);
						} else {
							expect(function () {
								document.implementation.createDocument(
									namespace as string | null,
									qualifiedName as string,
									doctype as DocumentType | null,
								);
							}).toThrow(
								expect.objectContaining({
									name: 'InvalidCharacterError',
									code: 5,
									constructor: DOMException,
								}),
							);
						}
					} else {
						expect(function () {
							document.implementation.createDocument(
								namespace as string | null,
								qualifiedName as string,
								doctype as DocumentType | null,
							);
						}).toThrow(expect.objectContaining({ constructor: expected }));
					}
				} else {
					let doc = document.implementation.createDocument(
						namespace as string | null,
						qualifiedName as string,
						doctype as DocumentType | null,
					);
					expect(doc.nodeType).toBe(Node.DOCUMENT_NODE);
					expect(doc.nodeType).toBe(doc.DOCUMENT_NODE);
					expect(doc.nodeName).toBe('#document');
					expect(doc.nodeValue).toBe(null);
					expect(Object.getPrototypeOf(doc)).toBe(XMLDocument.prototype);
					let omitRootElement = qualifiedName === null || String(qualifiedName) === '';
					if (omitRootElement) {
						expect(doc.documentElement).toBe(null);
					} else {
						let element = doc.documentElement;
						expect(element).not.toBe(null);
						expect(element.nodeType).toBe(Node.ELEMENT_NODE);
						expect(element.ownerDocument).toBe(doc);
						let qualified = String(qualifiedName);
						let names = [];
						let firstColonIndex = qualified.indexOf(':');
						if (firstColonIndex >= 0) {
							names = [
								qualified.substring(0, firstColonIndex),
								qualified.substring(firstColonIndex + 1),
							];
						} else {
							names = [null, qualified];
						}
						expect(element.prefix, 'element.prefix').toBe(names[0]);
						expect(element.localName, 'element.localName').toBe(names[1]);
						expect(element.namespaceURI, 'element.namespaceURI').toBe(
							namespace === undefined || namespace === '' ? null : namespace,
						);
					}
					if (!doctype) {
						expect(doc.doctype).toBe(null);
					} else {
						expect(doc.doctype).toBe(doctype);
						expect(doc.doctype!.ownerDocument).toBe(doc);
					}
					expect(doc.childNodes.length).toBe(Number(!omitRootElement) + Number(!!doctype));
				}
			},
		);
	}
	context.test('createDocument with missing arguments', ({ document, TypeError }) => {
		expect(function () {
			(document.implementation.createDocument as (...args: unknown[]) => XMLDocument)();
		}, 'createDocument() should throw').toThrow(
			expect.objectContaining({ constructor: TypeError }),
		);

		expect(function () {
			(document.implementation.createDocument as (...args: unknown[]) => XMLDocument)('');
		}, "createDocument('') should throw").toThrow(
			expect.objectContaining({ constructor: TypeError }),
		);
	});
}
