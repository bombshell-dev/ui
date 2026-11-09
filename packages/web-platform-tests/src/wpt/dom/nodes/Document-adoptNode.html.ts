import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		"Adopting an Element called 'x<' should work.",
		({ document }) => {
			let y = document.getElementsByTagName('x<')[0]!;
			let child = y.firstChild!;
			expect(y.parentNode).toBe(document.body);
			expect(y.ownerDocument).toBe(document);
			expect(document.adoptNode(y)).toBe(y);
			expect(y.parentNode).toBe(null);
			expect(y.firstChild).toBe(child);
			expect(y.ownerDocument).toBe(document);
			expect(child.ownerDocument).toBe(document);
			let doc = document.implementation.createDocument(null, null as unknown as string, null);
			expect(doc.adoptNode(y)).toBe(y);
			expect(y.parentNode).toBe(null);
			expect(y.firstChild).toBe(child);
			expect(y.ownerDocument).toBe(doc);
			expect(child.ownerDocument).toBe(doc);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id="log"></div><!--creates an element with local name "x<": --><x<>x</x<>',
			},
		},
	);
	context.test("Adopting an Element called ':good:times:' should work.", ({ document }) => {
		let x = document.createElement(':good:times:');
		expect(document.adoptNode(x)).toBe(x);
		let doc = document.implementation.createDocument(null, null as unknown as string, null);
		expect(doc.adoptNode(x)).toBe(x);
		expect(x.parentNode).toBe(null);
		expect(x.ownerDocument).toBe(doc);
	});
	context.test('Explicitly adopting a DocumentType should work.', ({ document }) => {
		let doctype = document.doctype!;
		expect(doctype.parentNode).toBe(document);
		expect(doctype.ownerDocument).toBe(document);
		expect(document.adoptNode(doctype)).toBe(doctype);
		expect(doctype.parentNode).toBe(null);
		expect(doctype.ownerDocument).toBe(document);
	});
	context.test('Adopting a Document should throw.', ({ document, DOMException }) => {
		let doc = document.implementation.createDocument(null, null as unknown as string, null);
		expect(function () {
			document.adoptNode(doc);
		}).toThrow(
			expect.objectContaining({
				name: 'NotSupportedError',
				code: 9,
				constructor: DOMException,
			}),
		);
	});
	context.test('Adopting an Element should adopt its Attr nodes.', ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		let div = doc.createElement('div');
		div.setAttribute('data-a', '1');
		let attr = div.getAttributeNode('data-a')!;
		expect(attr.ownerDocument).toBe(doc);
		expect(document.adoptNode(div)).toBe(div);
		expect(div.ownerDocument).toBe(document);
		expect(attr.ownerDocument, 'existing Attr node must be adopted with its element').toBe(
			document,
		);
		expect(div.getAttributeNode('data-a')!, 'Attr node identity must be preserved').toBe(attr);
		expect(div.getAttributeNode('data-a')!.ownerDocument).toBe(document);
	});
	context.test(
		'Inserting an Element into another document should adopt its Attr nodes.',
		({ document }) => {
			let doc = document.implementation.createHTMLDocument('Title');
			let div = doc.createElement('div');
			let attr = doc.createAttribute('data-b');
			div.setAttributeNode(attr);
			document.body.appendChild(div);
			expect(div.ownerDocument).toBe(document);
			expect(
				attr.ownerDocument,
				'Attr node must be adopted when its element is inserted into another document',
			).toBe(document);
			div.remove();
		},
	);
	context.test('Adopting an Element should adopt its namespaced attributes.', ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		let el = doc.createElement('a');
		el.setAttributeNS('x', 'y', '1');
		document.adoptNode(el);
		expect(el.ownerDocument).toBe(document);
		expect(
			el.getAttributeNode('y')!.ownerDocument,
			'Attr node created after adoption must belong to the new document',
		).toBe(document);
		expect(el.getAttributeNodeNS('x', 'y')!.ownerDocument).toBe(document);
		expect(el.attributes[0]!.ownerDocument).toBe(document);
	});
}
