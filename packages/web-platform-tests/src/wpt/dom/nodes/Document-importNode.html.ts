import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test("No 'deep' argument.", ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		let div = doc.body.appendChild(doc.createElement('div'));
		div.appendChild(doc.createElement('span'));
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		let newDiv = document.importNode(div);
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		expect(newDiv.ownerDocument).toBe(document);
		expect(newDiv.firstChild).toBe(null);
	});
	context.test("Undefined 'deep' argument.", ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		let div = doc.body.appendChild(doc.createElement('div'));
		div.appendChild(doc.createElement('span'));
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		let newDiv = document.importNode(div, undefined);
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		expect(newDiv.ownerDocument).toBe(document);
		expect(newDiv.firstChild).toBe(null);
	});
	context.test("True 'deep' argument.", ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		let div = doc.body.appendChild(doc.createElement('div'));
		div.appendChild(doc.createElement('span'));
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		let newDiv = document.importNode(div, true);
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		expect(newDiv.ownerDocument).toBe(document);
		expect(newDiv.firstChild!.ownerDocument).toBe(document);
	});
	context.test("False 'deep' argument.", ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		let div = doc.body.appendChild(doc.createElement('div'));
		div.appendChild(doc.createElement('span'));
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		let newDiv = document.importNode(div, false);
		expect(div.ownerDocument).toBe(doc);
		expect(div.firstChild!.ownerDocument).toBe(doc);
		expect(newDiv.ownerDocument).toBe(document);
		expect(newDiv.firstChild).toBe(null);
	});
	context.test('Import an Attr node with namespace/prefix correctly.', ({ document }) => {
		let doc = document.implementation.createHTMLDocument('Title');
		doc.body.setAttributeNS('http://example.com/', 'p:name', 'value');
		let originalAttr = doc.body.getAttributeNodeNS('http://example.com/', 'name')!;
		let imported = document.importNode(originalAttr, true);
		expect(imported.prefix).toBe(originalAttr.prefix);
		expect(imported.namespaceURI).toBe(originalAttr.namespaceURI);
		expect(imported.localName).toBe(originalAttr.localName);
	});
}
