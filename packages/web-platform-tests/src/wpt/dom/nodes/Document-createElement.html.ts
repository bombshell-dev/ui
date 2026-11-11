import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function toASCIIUppercase(str: string) {
		let diff = 'a'.charCodeAt(0) - 'A'.charCodeAt(0);
		let res = '';
		for (let i = 0; i < str.length; ++i) {
			if ('a' <= str[i]! && str[i]! <= 'z') {
				res += String.fromCharCode(str.charCodeAt(i) - diff);
			} else {
				res += str[i]!;
			}
		}
		return res;
	}
	function toASCIILowercase(str: string) {
		let diff = 'a'.charCodeAt(0) - 'A'.charCodeAt(0);
		let res = '';
		for (let i = 0; i < str.length; ++i) {
			if ('A' <= str[i]! && str[i]! <= 'Z') {
				res += String.fromCharCode(str.charCodeAt(i) + diff);
			} else {
				res += str[i]!;
			}
		}
		return res;
	}
	let HTMLNS = 'http://www.w3.org/1999/xhtml',
		valid = [
			undefined,
			null,
			'foo',
			'f1oo',
			'foo1',
			'f\u0BC6',
			'foo\u0BC6',
			':',
			':foo',
			'f:oo',
			'foo:',
			'f:o:o',
			'f::oo',
			'f::oo:',
			'foo:0',
			'foo:_',
			// combining char after :, invalid QName but valid Name
			'foo:\u0BC6',
			'foo:foo\u0BC6',
			'foo\u0BC6:foo',
			'xml',
			'xmlns',
			'xmlfoo',
			'xml:foo',
			'xmlns:foo',
			'xmlfoo:bar',
			'svg',
			'math',
			'FOO',
			// Test that non-ASCII chars don't get uppercased/lowercased
			'mar\u212a',
			'\u0130nput',
			'\u0131nput',
			'\u0300foo',
			'f}oo',
			'foo}',
			'\ufffffoo',
			'f\uffffoo',
			'foo\uffff',
			'f<oo',
			'\u0300',
		],
		invalid = ['', '1foo', '1:foo', 'fo o', '}foo', '<foo', 'foo>', '<foo>', '-foo', '.foo'];

	for (const t of valid) {
		context.test('createElement(' + String(t) + ') in HTML document', (fixture) => {
			const { document } = fixture;
			const desc = 'HTML document';
			const Element = fixture.Element;
			const Node = fixture.Node;
			let elt = document.createElement(t as string);
			expect(elt instanceof Element, 'instanceof Element').toBe(true);
			expect(elt instanceof Node, 'instanceof Node').toBe(true);
			expect(elt.localName, 'localName').toBe(
				desc == 'HTML document' ? toASCIILowercase(String(t)) : String(t),
			);
			expect(elt.tagName, 'tagName').toBe(
				desc == 'HTML document' ? toASCIIUppercase(String(t)) : String(t),
			);
			expect(elt.prefix, 'prefix').toBe(null);
			expect(elt.namespaceURI, 'namespaceURI').toBe(HTMLNS);
		});
	}
	for (const arg of invalid) {
		context.test('createElement(' + arg + ') in HTML document', ({ document, DOMException }) => {
			expect(() => document.createElement(arg)).toThrow(
				expect.objectContaining({
					name: 'InvalidCharacterError',
					code: 5,
					constructor: DOMException,
				}),
			);
		});
	}
}
