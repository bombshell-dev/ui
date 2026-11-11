import type { CompatibilityContext } from '../../../shared/context.ts';
import { createElementNSTests } from './Document-createElementNS.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const tests = [
		...createElementNSTests,
		...([
			/* Arrays with three elements:
			 *   the namespace argument
			 *   the qualifiedName argument
			 *   the expected exception, or null if none
			 */
			['', '', 'INVALID_CHARACTER_ERR'],
			[null, '', 'INVALID_CHARACTER_ERR'],
			[undefined, '', 'INVALID_CHARACTER_ERR'],
			['http://example.com/', null, null],
			['http://example.com/', '', 'INVALID_CHARACTER_ERR'],
			['/', null, null],
			['/', '', 'INVALID_CHARACTER_ERR'],
			['http://www.w3.org/XML/1998/namespace', null, null],
			['http://www.w3.org/XML/1998/namespace', '', 'INVALID_CHARACTER_ERR'],
			['http://www.w3.org/2000/xmlns/', null, 'NAMESPACE_ERR'],
			['http://www.w3.org/2000/xmlns/', '', 'INVALID_CHARACTER_ERR'],
			['foo:', null, null],
			['foo:', '', 'INVALID_CHARACTER_ERR'],
		] as const),
	];

	for (const t of tests) {
		context.test(
			'createElementNS test in HTML document: ' + t.map(String).join(', '),
			(fixture) => {
				const { document } = fixture;
				const doc = document;
				const Node = fixture.Node;
				let namespace = t[0],
					qualifiedName = t[1],
					expected = t[2];
				if (expected != null) {
					expect(() =>
						doc.createElementNS(namespace as string | null, qualifiedName as string),
					).toThrow(
						expect.objectContaining({
							name: expected === 'NAMESPACE_ERR' ? 'NamespaceError' : 'InvalidCharacterError',
							code: expected === 'NAMESPACE_ERR' ? 14 : 5,
							constructor: fixture.DOMException,
						}),
					);
				} else {
					let element = doc.createElementNS(namespace as string | null, qualifiedName as string);
					expect(element).not.toBe(null);
					expect(element.nodeType).toBe(Node.ELEMENT_NODE);
					expect(element.nodeType).toBe(element.ELEMENT_NODE);
					expect(element.nodeValue).toBe(null);
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
					expect(element.tagName, 'element.tagName').toBe(qualified);
					expect(element.nodeName, 'element.nodeName').toBe(qualified);
					expect(element.namespaceURI, 'element.namespaceURI').toBe(
						namespace === undefined || namespace === '' ? null : namespace,
					);
				}
			},
		);
	}
	context.test(
		'Lower-case HTML element without a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let HTMLNS = 'http://www.w3.org/1999/xhtml';
			let element = document.createElementNS(HTMLNS, 'span');
			expect(element.namespaceURI).toBe(HTMLNS);
			expect(element.prefix).toBe(null);
			expect(element.localName).toBe('span');
			expect(element.tagName).toBe('SPAN');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should be an HTMLElement').toBe(true);
			expect(element instanceof HTMLSpanElement, 'Should be an HTMLSpanElement').toBe(true);
		},
	);
	context.test(
		'Lower-case HTML element with a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let HTMLNS = 'http://www.w3.org/1999/xhtml';
			let element = document.createElementNS(HTMLNS, 'html:span');
			expect(element.namespaceURI).toBe(HTMLNS);
			expect(element.prefix).toBe('html');
			expect(element.localName).toBe('span');
			expect(element.tagName).toBe('HTML:SPAN');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should be an HTMLElement').toBe(true);
			expect(element instanceof HTMLSpanElement, 'Should be an HTMLSpanElement').toBe(true);
		},
	);
	context.test(
		'Lower-case non-HTML element without a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let element = document.createElementNS('test', 'span');
			expect(element.namespaceURI).toBe('test');
			expect(element.prefix).toBe(null);
			expect(element.localName).toBe('span');
			expect(element.tagName).toBe('span');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test(
		'Lower-case non-HTML element with a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let element = document.createElementNS('test', 'html:span');
			expect(element.namespaceURI).toBe('test');
			expect(element.prefix).toBe('html');
			expect(element.localName).toBe('span');
			expect(element.tagName).toBe('html:span');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test(
		'Upper-case HTML element without a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement, HTMLUnknownElement }) => {
			let HTMLNS = 'http://www.w3.org/1999/xhtml';
			let element = document.createElementNS(HTMLNS, 'SPAN');
			expect(element.namespaceURI).toBe(HTMLNS);
			expect(element.prefix).toBe(null);
			expect(element.localName).toBe('SPAN');
			expect(element.tagName).toBe('SPAN');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should be an HTMLElement').toBe(true);
			expect(element instanceof HTMLUnknownElement, 'Should be an HTMLUnknownElement').toBe(true);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test(
		'Upper-case HTML element with a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let HTMLNS = 'http://www.w3.org/1999/xhtml';
			let element = document.createElementNS(HTMLNS, 'html:SPAN');
			expect(element.namespaceURI).toBe(HTMLNS);
			expect(element.prefix).toBe('html');
			expect(element.localName).toBe('SPAN');
			expect(element.tagName).toBe('HTML:SPAN');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should be an HTMLElement').toBe(true);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test(
		'Upper-case non-HTML element without a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let element = document.createElementNS('test', 'SPAN');
			expect(element.namespaceURI).toBe('test');
			expect(element.prefix).toBe(null);
			expect(element.localName).toBe('SPAN');
			expect(element.tagName).toBe('SPAN');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test(
		'Upper-case non-HTML element with a prefix',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let element = document.createElementNS('test', 'html:SPAN');
			expect(element.namespaceURI).toBe('test');
			expect(element.prefix).toBe('html');
			expect(element.localName).toBe('SPAN');
			expect(element.tagName).toBe('html:SPAN');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test('null namespace', ({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
		let element = document.createElementNS(null, 'span');
		expect(element.namespaceURI).toBe(null);
		expect(element.prefix).toBe(null);
		expect(element.localName).toBe('span');
		expect(element.tagName).toBe('span');
		expect(element instanceof Node, 'Should be a Node').toBe(true);
		expect(element instanceof Element, 'Should be an Element').toBe(true);
		expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
		expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
	});
	context.test(
		'undefined namespace',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let element = document.createElementNS(undefined as unknown as string, 'span');
			expect(element.namespaceURI).toBe(null);
			expect(element.prefix).toBe(null);
			expect(element.localName).toBe('span');
			expect(element.tagName).toBe('span');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
	context.test(
		'empty string namespace',
		({ document, Node, Element, HTMLElement, HTMLSpanElement }) => {
			let element = document.createElementNS('', 'span');
			expect(element.namespaceURI).toBe(null);
			expect(element.prefix).toBe(null);
			expect(element.localName).toBe('span');
			expect(element.tagName).toBe('span');
			expect(element instanceof Node, 'Should be a Node').toBe(true);
			expect(element instanceof Element, 'Should be an Element').toBe(true);
			expect(element instanceof HTMLElement, 'Should not be an HTMLElement').toBe(false);
			expect(element instanceof HTMLSpanElement, 'Should not be an HTMLSpanElement').toBe(false);
		},
	);
}
