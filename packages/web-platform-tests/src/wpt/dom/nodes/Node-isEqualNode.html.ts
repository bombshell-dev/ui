import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('doctypes should be compared on name, public ID, and system ID', ({ document }) => {
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
		let doctype3 = document.implementation.createDocumentType(
			'qualifiedName2',
			'publicId',
			'systemId',
		);
		let doctype4 = document.implementation.createDocumentType(
			'qualifiedName',
			'publicId2',
			'systemId',
		);
		let doctype5 = document.implementation.createDocumentType(
			'qualifiedName',
			'publicId',
			'systemId3',
		);

		expect(doctype1.isEqualNode(doctype1), 'self-comparison').toBe(true);
		expect(doctype1.isEqualNode(doctype2), 'same properties').toBe(true);
		expect(doctype1.isEqualNode(doctype3), 'different name').toBe(false);
		expect(doctype1.isEqualNode(doctype4), 'different public ID').toBe(false);
		expect(doctype1.isEqualNode(doctype5), 'different system ID').toBe(false);
	});
	context.test(
		'elements should be compared on namespace, namespace prefix, local name, and number of attributes',
		({ document }) => {
			let element1 = document.createElementNS('namespace', 'prefix:localName');
			let element2 = document.createElementNS('namespace', 'prefix:localName');
			let element3 = document.createElementNS('namespace2', 'prefix:localName');
			let element4 = document.createElementNS('namespace', 'prefix2:localName');
			let element5 = document.createElementNS('namespace', 'prefix:localName2');

			let element6 = document.createElementNS('namespace', 'prefix:localName');
			element6.setAttribute('foo', 'bar');

			expect(element1.isEqualNode(element1), 'self-comparison').toBe(true);
			expect(element1.isEqualNode(element2), 'same properties').toBe(true);
			expect(element1.isEqualNode(element3), 'different namespace').toBe(false);
			expect(element1.isEqualNode(element4), 'different prefix').toBe(false);
			expect(element1.isEqualNode(element5), 'different local name').toBe(false);
			expect(element1.isEqualNode(element6), 'different number of attributes').toBe(false);
		},
	);
	context.test(
		'elements should be compared on attribute namespace, local name, and value',
		({ document }) => {
			let element1 = document.createElement('element');
			element1.setAttributeNS('namespace', 'prefix:localName', 'value');

			let element2 = document.createElement('element');
			element2.setAttributeNS('namespace', 'prefix:localName', 'value');

			let element3 = document.createElement('element');
			element3.setAttributeNS('namespace2', 'prefix:localName', 'value');

			let element4 = document.createElement('element');
			element4.setAttributeNS('namespace', 'prefix2:localName', 'value');

			let element5 = document.createElement('element');
			element5.setAttributeNS('namespace', 'prefix:localName2', 'value');

			let element6 = document.createElement('element');
			element6.setAttributeNS('namespace', 'prefix:localName', 'value2');

			expect(element1.isEqualNode(element1), 'self-comparison').toBe(true);
			expect(element1.isEqualNode(element2), 'attribute with same properties').toBe(true);
			expect(element1.isEqualNode(element3), 'attribute with different namespace').toBe(false);
			expect(element1.isEqualNode(element4), 'attribute with different prefix').toBe(true);
			expect(element1.isEqualNode(element5), 'attribute with different local name').toBe(false);
			expect(element1.isEqualNode(element6), 'attribute with different value').toBe(false);
		},
	);
	context.test('processing instructions should be compared on target and data', ({ document }) => {
		let pi1 = document.createProcessingInstruction('target', 'data');
		let pi2 = document.createProcessingInstruction('target', 'data');
		let pi3 = document.createProcessingInstruction('target2', 'data');
		let pi4 = document.createProcessingInstruction('target', 'data2');

		expect(pi1.isEqualNode(pi1), 'self-comparison').toBe(true);
		expect(pi1.isEqualNode(pi2), 'same properties').toBe(true);
		expect(pi1.isEqualNode(pi3), 'different target').toBe(false);
		expect(pi1.isEqualNode(pi4), 'different data').toBe(false);
	});
	context.test('text nodes should be compared on data', ({ document }) => {
		let text1 = document.createTextNode('data');
		let text2 = document.createTextNode('data');
		let text3 = document.createTextNode('data2');

		expect(text1.isEqualNode(text1), 'self-comparison').toBe(true);
		expect(text1.isEqualNode(text2), 'same properties').toBe(true);
		expect(text1.isEqualNode(text3), 'different data').toBe(false);
	});
	context.test('comments should be compared on data', ({ document }) => {
		let comment1 = document.createComment('data');
		let comment2 = document.createComment('data');
		let comment3 = document.createComment('data2');

		expect(comment1.isEqualNode(comment1), 'self-comparison').toBe(true);
		expect(comment1.isEqualNode(comment2), 'same properties').toBe(true);
		expect(comment1.isEqualNode(comment3), 'different data').toBe(false);
	});
	context.test('document fragments should not be compared based on properties', ({ document }) => {
		let documentFragment1 = document.createDocumentFragment();
		let documentFragment2 = document.createDocumentFragment();

		expect(documentFragment1.isEqualNode(documentFragment1), 'self-comparison').toBe(true);
		expect(documentFragment1.isEqualNode(documentFragment2), 'same properties').toBe(true);
	});
	context.test('documents should not be compared based on properties', ({ document }) => {
		let document1 = document.implementation.createDocument('', '');
		let document2 = document.implementation.createDocument('', '');

		expect(document1.isEqualNode(document1), 'self-comparison').toBe(true);
		expect(document1.isEqualNode(document2), 'another empty XML document').toBe(true);

		let htmlDoctype = document.implementation.createDocumentType('html', '', '');
		let document3 = document.implementation.createDocument(
			'http://www.w3.org/1999/xhtml',
			'html',
			htmlDoctype,
		);
		document3.documentElement.appendChild(document3.createElement('head'));
		document3.documentElement.appendChild(document3.createElement('body'));
		let document4 = document.implementation.createHTMLDocument();
		expect(document3.isEqualNode(document4), 'default HTML documents, created different ways').toBe(
			true,
		);
	});
	context.test('node equality testing should test descendant equality too', ({ document }) => {
		testDeepEquality(function () {
			return document.createElement('foo');
		});
		testDeepEquality(function () {
			return document.createDocumentFragment();
		});
		testDeepEquality(function () {
			return document.implementation.createDocument('', '');
		});
		testDeepEquality(function () {
			return document.implementation.createHTMLDocument();
		});

		function testDeepEquality(parentFactory: () => Node) {
			// Some ad-hoc tests of deep equality

			let parentA = parentFactory();
			let parentB = parentFactory();

			parentA.appendChild(document.createComment('data'));
			expect(parentA.isEqualNode(parentB)).toBe(false);
			parentB.appendChild(document.createComment('data'));
			expect(parentA.isEqualNode(parentB)).toBe(true);
		}
	});
}
