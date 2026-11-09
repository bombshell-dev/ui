import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('doctypes should be compared on reference', ({ document }) => {
		let doctype1 = document.implementation.createDocumentType(
			'qualifiedName',
			'publicId',
			'systemId',
		);
		let doctype2 = document.implementation.createDocumentType(
			'qualifiedName',
			'publicId',
			'systemId',
		);

		expect(doctype1.isSameNode(doctype1), 'self-comparison').toBe(true);
		expect(doctype1.isSameNode(doctype2), 'same properties').toBe(false);
		expect(doctype1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test('elements should be compared on reference (namespaced element)', ({ document }) => {
		let element1 = document.createElementNS('namespace', 'prefix:localName');
		let element2 = document.createElementNS('namespace', 'prefix:localName');

		expect(element1.isSameNode(element1), 'self-comparison').toBe(true);
		expect(element1.isSameNode(element2), 'same properties').toBe(false);
		expect(element1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test(
		'elements should be compared on reference (namespaced attribute)',
		({ document }) => {
			let element1 = document.createElement('element');
			element1.setAttributeNS('namespace', 'prefix:localName', 'value');

			let element2 = document.createElement('element');
			element2.setAttributeNS('namespace', 'prefix:localName', 'value');

			expect(element1.isSameNode(element1), 'self-comparison').toBe(true);
			expect(element1.isSameNode(element2), 'same properties').toBe(false);
			expect(element1.isSameNode(null), 'with null other node').toBe(false);
		},
	);
	context.test('processing instructions should be compared on reference', ({ document }) => {
		let pi1 = document.createProcessingInstruction('target', 'data');
		let pi2 = document.createProcessingInstruction('target', 'data');

		expect(pi1.isSameNode(pi1), 'self-comparison').toBe(true);
		expect(pi1.isSameNode(pi2), 'different target').toBe(false);
		expect(pi1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test('text nodes should be compared on reference', ({ document }) => {
		let text1 = document.createTextNode('data');
		let text2 = document.createTextNode('data');

		expect(text1.isSameNode(text1), 'self-comparison').toBe(true);
		expect(text1.isSameNode(text2), 'same properties').toBe(false);
		expect(text1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test('comments should be compared on reference', ({ document }) => {
		let comment1 = document.createComment('data');
		let comment2 = document.createComment('data');

		expect(comment1.isSameNode(comment1), 'self-comparison').toBe(true);
		expect(comment1.isSameNode(comment2), 'same properties').toBe(false);
		expect(comment1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test('document fragments should be compared on reference', ({ document }) => {
		let documentFragment1 = document.createDocumentFragment();
		let documentFragment2 = document.createDocumentFragment();

		expect(documentFragment1.isSameNode(documentFragment1), 'self-comparison').toBe(true);
		expect(documentFragment1.isSameNode(documentFragment2), 'same properties').toBe(false);
		expect(documentFragment1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test('documents should be compared on reference', ({ document }) => {
		let document1 = document.implementation.createDocument('', '');
		let document2 = document.implementation.createDocument('', '');

		expect(document1.isSameNode(document1), 'self-comparison').toBe(true);
		expect(document1.isSameNode(document2), 'another empty XML document').toBe(false);
		expect(document1.isSameNode(null), 'with null other node').toBe(false);
	});
	context.test('attributes should be compared on reference', ({ document }) => {
		let attr1 = document.createAttribute('href');
		let attr2 = document.createAttribute('href');

		expect(attr1.isSameNode(attr1), 'self-comparison').toBe(true);
		expect(attr1.isSameNode(attr2), 'same name').toBe(false);
		expect(attr1.isSameNode(null), 'with null other node').toBe(false);
	});
}
