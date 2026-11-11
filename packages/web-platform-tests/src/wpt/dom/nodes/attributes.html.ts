import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		function getEnumerableOwnProps1(obj: object) {
			let arr = [];
			for (let prop in obj) {
				if (obj.hasOwnProperty(prop)) {
					arr.push(prop);
				}
			}
			return arr;
		}

		function getEnumerableOwnProps2(obj: object) {
			return Object.getOwnPropertyNames(obj).filter(function (name) {
				return Object.getOwnPropertyDescriptor(obj, name)!.enumerable;
			});
		}

		context.test('Attribute loses its owner when removed', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			let attr = el.attributes[0]!;
			expect(attr.ownerElement).toBe(el);
			el.removeAttribute('foo');
			expect(attr.ownerElement).toBe(null);
		});
		context.test('Basic functionality of getAttributeNode/getAttributeNodeNS', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			let attr = el.attributes[0]!;
			let attrNode = el.getAttributeNode('foo')!;
			let attrNodeNS = el.getAttributeNodeNS('', 'foo')!;
			expect(attr).toBe(attrNode);
			expect(attr).toBe(attrNodeNS);
			el.setAttributeNS('x', 'foo2', 'bar2');
			let attr2 = el.attributes[1]!;
			let attrNodeNS2 = el.getAttributeNodeNS('x', 'foo2')!;
			expect(attr2).toBe(attrNodeNS2);
		});
		context.test('Basic functionality of setAttributeNode', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			let attrNode = el.getAttributeNode('foo')!;
			let attrNodeNS = el.getAttributeNodeNS('', 'foo')!;
			expect(attrNode).toBe(attrNodeNS);
			el.removeAttribute('foo');
			let el2 = document.createElement('div');
			el2.setAttributeNode(attrNode);
			expect(attrNode).toBe(el2.getAttributeNode('foo')!);
			expect(attrNode).toBe(el2.attributes[0]!);
			expect(attrNode.ownerElement).toBe(el2);
			expect(attrNode.value).toBe('bar');

			let el3 = document.createElement('div');
			el2.removeAttribute('foo');
			el3.setAttribute('foo', 'baz');
			el3.setAttributeNode(attrNode);
			expect(el3.getAttribute('foo')).toBe('bar');
		});
		context.test(
			'setAttributeNode should distinguish attributes with same local name and different namespaces',
			({ document }) => {
				let el = document.createElement('div');
				let attr1 = document.createAttributeNS('ns1', 'p1:name');
				attr1.value = 'value1';
				let attr2 = document.createAttributeNS('ns2', 'p2:name');
				attr2.value = 'value2';
				el.setAttributeNode(attr1);
				el.setAttributeNode(attr2);
				expect(el.getAttributeNodeNS('ns1', 'name')!.value).toBe('value1');
				expect(el.getAttributeNodeNS('ns2', 'name')!.value).toBe('value2');
			},
		);
		context.test(
			"setAttributeNode doesn't have case-insensitivity even with an HTMLElement 1",
			({ document }) => {
				let el = document.createElement('div');
				let attr1 = document.createAttributeNS('ns1', 'p1:name');
				attr1.value = 'value1';
				let attr2 = document.createAttributeNS('ns1', 'p1:NAME');
				attr2.value = 'VALUE2';
				el.setAttributeNode(attr1);
				el.setAttributeNode(attr2);
				expect(el.getAttributeNodeNS('ns1', 'name')!.value).toBe('value1');
				expect(el.getAttributeNodeNS('ns1', 'NAME')!.value).toBe('VALUE2');
			},
		);
		context.test(
			"setAttributeNode doesn't have case-insensitivity even with an HTMLElement 2",
			({ document }) => {
				let el = document.createElement('div');
				let attr1 = document.createAttributeNS('ns1', 'FOOBAR');
				let attr2 = document.createAttributeNS('ns1', 'FOOBAR');
				expect(el.setAttributeNode(attr1)).toBe(null);
				expect(attr1.ownerElement).toBe(el);
				expect(attr2.ownerElement).toBe(null);
				let oldAttr = el.setAttributeNode(attr2);
				expect(oldAttr).toBe(attr1);
				expect(attr1.ownerElement).toBe(null);
				expect(attr2.ownerElement).toBe(el);
			},
		);
		context.test(
			"setAttributeNode doesn't have case-insensitivity even with an HTMLElement 3",
			({ document }) => {
				let el = document.createElement('div');
				let attr1 = document.createAttributeNS('ns1', 'foobar');
				let attr2 = document.createAttributeNS('ns1', 'FOOBAR');
				expect(el.setAttributeNode(attr1)).toBe(null);
				expect(attr1.ownerElement).toBe(el);
				expect(attr2.ownerElement).toBe(null);
				expect(el.setAttributeNode(attr2)).toBe(null);
				expect(attr1.ownerElement).toBe(el);
				expect(attr2.ownerElement).toBe(el);
			},
		);
		context.test('Basic functionality of setAttributeNodeNS', ({ document }) => {
			let el = document.createElement('div');
			el.setAttributeNS('x', 'foo', 'bar');
			let attrNode = el.getAttributeNodeNS('x', 'foo')!;
			el.removeAttribute('foo');
			let el2 = document.createElement('div');
			el2.setAttributeNS('x', 'foo', 'baz');
			el2.setAttributeNodeNS(attrNode);
			expect(el2.getAttributeNS('x', 'foo')).toBe('bar');
		});
		context.test(
			'If attr’s element is neither null nor element, throw an InUseAttributeError.',
			({ document, DOMException }) => {
				let el = document.createElement('div');
				let other = document.createElement('div');
				let attr = document.createAttribute('foo');
				expect(el.setAttributeNode(attr)).toBe(null);
				expect(attr.ownerElement).toBe(el);
				expect(function () {
					other.setAttributeNode(attr);
				}, 'Attribute already associated with el').toThrow(
					expect.objectContaining({
						name: 'InUseAttributeError',
						code: 10,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test('Replacing an attr by itself', ({ document }) => {
			let el = document.createElement('div');
			let attr = document.createAttribute('foo');
			expect(el.setAttributeNode(attr)).toBe(null);
			el.setAttribute('bar', 'qux');
			expect(el.setAttributeNode(attr)).toBe(attr);
			expect(el.attributes[0]!).toBe(attr);
		});
		context.test('Basic functionality of removeAttributeNode', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			let attrNode = el.getAttributeNode('foo')!;
			el.removeAttributeNode(attrNode);
			let el2 = document.createElement('div');
			el2.setAttributeNode(attrNode);
			expect(el2.attributes[0]!).toBe(attrNode);
			expect(el.attributes.length).toBe(0);
		});
		context.test(
			'setAttributeNode on bound attribute should throw InUseAttributeError',
			({ document, DOMException }) => {
				let el = document.createElement('div');
				el.setAttribute('foo', 'bar');
				let attrNode = el.getAttributeNode('foo')!;
				let el2 = document.createElement('div');
				expect(function () {
					el2.setAttributeNode(attrNode);
				}).toThrow(
					expect.objectContaining({
						name: 'InUseAttributeError',
						code: 10,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'setAttributeNode called with an Attr that has the same name as an existing one should not change attribute order',
			({ document }) => {
				let el = document.createElement('div');
				el.setAttribute('a', 'b');
				el.setAttribute('c', 'd');

				expect(
					Array.prototype.map.call(el.attributes, function (a: Attr) {
						return a.name;
					}),
				).toHaveLength(2);
				expect(
					Array.prototype.map.call(el.attributes, function (a: Attr) {
						return a.name;
					})[0],
				).toBe('a');
				expect(
					Array.prototype.map.call(el.attributes, function (a: Attr) {
						return a.name;
					})[1],
				).toBe('c');
				expect(
					Array.prototype.map.call(el.attributes, function (a: Attr) {
						return a.value;
					}),
				).toHaveLength(2);
				expect(
					Array.prototype.map.call(el.attributes, function (a: Attr) {
						return a.value;
					})[0],
				).toBe('b');
				expect(
					Array.prototype.map.call(el.attributes, function (a: Attr) {
						return a.value;
					})[1],
				).toBe('d');

				let attrNode = document.createAttribute('a');
				attrNode.value = 'e';
				el.setAttributeNode(attrNode);

				expect(
					Array.prototype.map.call(el.attributes, function (a) {
						return a.name;
					}),
				).toHaveLength(2);
				expect(
					Array.prototype.map.call(el.attributes, function (a) {
						return a.name;
					})[0],
				).toBe('a');
				expect(
					Array.prototype.map.call(el.attributes, function (a) {
						return a.name;
					})[1],
				).toBe('c');
				expect(
					Array.prototype.map.call(el.attributes, function (a) {
						return a.value;
					}),
				).toHaveLength(2);
				expect(
					Array.prototype.map.call(el.attributes, function (a) {
						return a.value;
					})[0],
				).toBe('e');
				expect(
					Array.prototype.map.call(el.attributes, function (a) {
						return a.value;
					})[1],
				).toBe('d');
			},
		);
		context.test('Own property correctness with basic attributes', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('a', '');
			el.setAttribute('b', '');
			expect(getEnumerableOwnProps1(el.attributes)).toHaveLength(2);
			expect(getEnumerableOwnProps1(el.attributes)[0]).toBe('0');
			expect(getEnumerableOwnProps1(el.attributes)[1]).toBe('1');
			expect(getEnumerableOwnProps2(el.attributes)).toHaveLength(2);
			expect(getEnumerableOwnProps2(el.attributes)[0]).toBe('0');
			expect(getEnumerableOwnProps2(el.attributes)[1]).toBe('1');
			expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(4);
			expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
			expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
			expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('a');
			expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('b');
		});
		context.test(
			'Own property correctness with non-namespaced attribute before same-name namespaced one',
			({ document, Attr }) => {
				let el = document.createElement('div');
				el.setAttributeNS('', 'a', '');
				el.setAttribute('b', '');
				el.setAttributeNS('foo', 'a', '');
				expect(getEnumerableOwnProps1(el.attributes)).toHaveLength(3);
				expect(getEnumerableOwnProps1(el.attributes)[0]).toBe('0');
				expect(getEnumerableOwnProps1(el.attributes)[1]).toBe('1');
				expect(getEnumerableOwnProps1(el.attributes)[2]).toBe('2');
				expect(getEnumerableOwnProps2(el.attributes)).toHaveLength(3);
				expect(getEnumerableOwnProps2(el.attributes)[0]).toBe('0');
				expect(getEnumerableOwnProps2(el.attributes)[1]).toBe('1');
				expect(getEnumerableOwnProps2(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(5);
				expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
				expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
				expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('a');
				expect(Object.getOwnPropertyNames(el.attributes)[4]).toBe('b');
				for (let propName of Object.getOwnPropertyNames(el.attributes)) {
					expect(
						(el.attributes as unknown as Record<string, Attr>)[propName] instanceof Attr,
						'el.attributes has an Attr for property name ' + propName,
					).toBe(true);
				}
			},
		);
		context.test(
			'Own property correctness with namespaced attribute before same-name non-namespaced one',
			({ document, Attr }) => {
				let el = document.createElement('div');
				el.setAttributeNS('foo', 'a', '');
				el.setAttribute('b', '');
				el.setAttributeNS('', 'a', '');
				expect(getEnumerableOwnProps1(el.attributes)).toHaveLength(3);
				expect(getEnumerableOwnProps1(el.attributes)[0]).toBe('0');
				expect(getEnumerableOwnProps1(el.attributes)[1]).toBe('1');
				expect(getEnumerableOwnProps1(el.attributes)[2]).toBe('2');
				expect(getEnumerableOwnProps2(el.attributes)).toHaveLength(3);
				expect(getEnumerableOwnProps2(el.attributes)[0]).toBe('0');
				expect(getEnumerableOwnProps2(el.attributes)[1]).toBe('1');
				expect(getEnumerableOwnProps2(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(5);
				expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
				expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
				expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('a');
				expect(Object.getOwnPropertyNames(el.attributes)[4]).toBe('b');
				for (let propName of Object.getOwnPropertyNames(el.attributes)) {
					expect(
						(el.attributes as unknown as Record<string, Attr>)[propName] instanceof Attr,
						'el.attributes has an Attr for property name ' + propName,
					).toBe(true);
				}
			},
		);
		context.test(
			'Own property correctness with two namespaced attributes with the same name-with-prefix',
			({ document, Attr }) => {
				let el = document.createElement('div');
				el.setAttributeNS('foo', 'a:b', '');
				el.setAttributeNS('foo', 'c:d', '');
				el.setAttributeNS('bar', 'a:b', '');
				expect(getEnumerableOwnProps1(el.attributes)).toHaveLength(3);
				expect(getEnumerableOwnProps1(el.attributes)[0]).toBe('0');
				expect(getEnumerableOwnProps1(el.attributes)[1]).toBe('1');
				expect(getEnumerableOwnProps1(el.attributes)[2]).toBe('2');
				expect(getEnumerableOwnProps2(el.attributes)).toHaveLength(3);
				expect(getEnumerableOwnProps2(el.attributes)[0]).toBe('0');
				expect(getEnumerableOwnProps2(el.attributes)[1]).toBe('1');
				expect(getEnumerableOwnProps2(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(5);
				expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
				expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
				expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('a:b');
				expect(Object.getOwnPropertyNames(el.attributes)[4]).toBe('c:d');
				for (let propName of Object.getOwnPropertyNames(el.attributes)) {
					expect(
						(el.attributes as unknown as Record<string, Attr>)[propName] instanceof Attr,
						'el.attributes has an Attr for property name ' + propName,
					).toBe(true);
				}
			},
		);
		context.test(
			'Own property names should only include all-lowercase qualified names for an HTML element in an HTML document',
			({ document, Attr }) => {
				let el = document.createElement('div');
				el.setAttributeNS('foo', 'A:B', '');
				el.setAttributeNS('bar', 'c:D', '');
				el.setAttributeNS('baz', 'e:F', '');
				el.setAttributeNS('qux', 'g:h', '');
				el.setAttributeNS('', 'I', '');
				el.setAttributeNS('', 'j', '');
				expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(8);
				expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
				expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
				expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('3');
				expect(Object.getOwnPropertyNames(el.attributes)[4]).toBe('4');
				expect(Object.getOwnPropertyNames(el.attributes)[5]).toBe('5');
				expect(Object.getOwnPropertyNames(el.attributes)[6]).toBe('g:h');
				expect(Object.getOwnPropertyNames(el.attributes)[7]).toBe('j');
				for (let propName of Object.getOwnPropertyNames(el.attributes)) {
					expect(
						(el.attributes as unknown as Record<string, Attr>)[propName] instanceof Attr,
						'el.attributes has an Attr for property name ' + propName,
					).toBe(true);
				}
			},
		);
		context.test(
			'Own property names should include all qualified names for a non-HTML element in an HTML document',
			({ document, Attr }) => {
				let el = document.createElementNS('', 'div');
				el.setAttributeNS('foo', 'A:B', '');
				el.setAttributeNS('bar', 'c:D', '');
				el.setAttributeNS('baz', 'e:F', '');
				el.setAttributeNS('qux', 'g:h', '');
				el.setAttributeNS('', 'I', '');
				el.setAttributeNS('', 'j', '');
				expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(12);
				expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
				expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
				expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('3');
				expect(Object.getOwnPropertyNames(el.attributes)[4]).toBe('4');
				expect(Object.getOwnPropertyNames(el.attributes)[5]).toBe('5');
				expect(Object.getOwnPropertyNames(el.attributes)[6]).toBe('A:B');
				expect(Object.getOwnPropertyNames(el.attributes)[7]).toBe('c:D');
				expect(Object.getOwnPropertyNames(el.attributes)[8]).toBe('e:F');
				expect(Object.getOwnPropertyNames(el.attributes)[9]).toBe('g:h');
				expect(Object.getOwnPropertyNames(el.attributes)[10]).toBe('I');
				expect(Object.getOwnPropertyNames(el.attributes)[11]).toBe('j');
				for (let propName of Object.getOwnPropertyNames(el.attributes)) {
					expect(
						(el.attributes as unknown as Record<string, Attr>)[propName] instanceof Attr,
						'el.attributes has an Attr for property name ' + propName,
					).toBe(true);
				}
			},
		);
		context.test(
			'Own property names should include all qualified names for an HTML element in a non-HTML document',
			({ document, Attr }) => {
				let doc = document.implementation.createDocument(null, '');
				expect(doc.contentType).toBe('application/xml');
				let el = doc.createElementNS('http://www.w3.org/1999/xhtml', 'div');
				el.setAttributeNS('foo', 'A:B', '');
				el.setAttributeNS('bar', 'c:D', '');
				el.setAttributeNS('baz', 'e:F', '');
				el.setAttributeNS('qux', 'g:h', '');
				el.setAttributeNS('', 'I', '');
				el.setAttributeNS('', 'j', '');
				expect(Object.getOwnPropertyNames(el.attributes)).toHaveLength(12);
				expect(Object.getOwnPropertyNames(el.attributes)[0]).toBe('0');
				expect(Object.getOwnPropertyNames(el.attributes)[1]).toBe('1');
				expect(Object.getOwnPropertyNames(el.attributes)[2]).toBe('2');
				expect(Object.getOwnPropertyNames(el.attributes)[3]).toBe('3');
				expect(Object.getOwnPropertyNames(el.attributes)[4]).toBe('4');
				expect(Object.getOwnPropertyNames(el.attributes)[5]).toBe('5');
				expect(Object.getOwnPropertyNames(el.attributes)[6]).toBe('A:B');
				expect(Object.getOwnPropertyNames(el.attributes)[7]).toBe('c:D');
				expect(Object.getOwnPropertyNames(el.attributes)[8]).toBe('e:F');
				expect(Object.getOwnPropertyNames(el.attributes)[9]).toBe('g:h');
				expect(Object.getOwnPropertyNames(el.attributes)[10]).toBe('I');
				expect(Object.getOwnPropertyNames(el.attributes)[11]).toBe('j');
				for (let propName of Object.getOwnPropertyNames(el.attributes)) {
					expect(
						(el.attributes as unknown as Record<string, Attr>)[propName] instanceof Attr,
						'el.attributes has an Attr for property name ' + propName,
					).toBe(true);
				}
			},
		);
	}

	{
		const { expect } = context.runner;
		function attr_is(
			attr: Attr,
			v: string,
			ln: string,
			ns: string | null,
			p: string | null,
			n: string,
			description?: string,
		) {
			description = description ? description + ': ' : '';
			expect(attr.value, description + 'value').toBe(v);
			expect(attr.nodeValue, description + 'nodeValue').toBe(v);
			expect(attr.textContent, description + 'textContent').toBe(v);
			expect(attr.localName, description + 'localName').toBe(ln);
			expect(attr.namespaceURI, description + 'namespaceURI').toBe(ns);
			expect(attr.prefix, description + 'prefix').toBe(p);
			expect(attr.name, description + 'name').toBe(n);
			expect(attr.nodeName, description + 'nodeName').toBe(n);
			expect(attr.specified, description + 'specified').toBe(true);
		}

		function attributes_are(el: Element, l: [string, string, string?][]) {
			for (let i = 0, il = l.length; i < il; i++) {
				attr_is(
					el.attributes[i]!,
					l[i]![1],
					l[i]![0],
					l[i]!.length < 3 ? null : l[i]![2]!,
					null,
					l[i]![0],
					'attributes[' + i + ']',
				);
				expect(el.attributes[i]!.ownerElement).toBe(el);
			}
		}

		const invalid_names = ['']; // XXX
		const valid_names = [
			'x',
			'X',
			':',
			'a:0',
			'invalid^Name',
			'\\',
			"'",
			'"',
			'0',
			'0:a',
			':a',
			'x:y:x',
			'~',
		];
		const invalid_qnames = ['b:']; // XXX

		const XML = 'http://www.w3.org/XML/1998/namespace',
			XMLNS = 'http://www.w3.org/2000/xmlns/';

		context.test(
			'When qualifiedName does not match the Name production, an ' +
				'INVALID_CHARACTER_ERR exception is to be thrown. (toggleAttribute)',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				for (let i = 0; i < invalid_names.length; i++) {
					expect(function () {
						el.toggleAttribute(invalid_names[i]!, true);
					}, `toggleAttribute("${invalid_names[i]!}", true)`).toThrow(
						expect.objectContaining({
							name: 'InvalidCharacterError',
							code: 5,
							constructor: DOMException,
						}),
					);
				}
				for (let i = 0; i < invalid_names.length; i++) {
					expect(function () {
						el.toggleAttribute(invalid_names[i]!);
					}, `toggleAttribute("${invalid_names[i]!}")`).toThrow(
						expect.objectContaining({
							name: 'InvalidCharacterError',
							code: 5,
							constructor: DOMException,
						}),
					);
				}
				for (let i = 0; i < invalid_names.length; i++) {
					expect(function () {
						el.toggleAttribute(invalid_names[i]!, false);
					}, `toggleAttribute("${invalid_names[i]!}", false)`).toThrow(
						expect.objectContaining({
							name: 'InvalidCharacterError',
							code: 5,
							constructor: DOMException,
						}),
					);
				}
			},
		);
		context.test(
			'toggleAttribute should lowercase its name argument (upper case attribute)',
			({ document }) => {
				let el = document.createElement('div');
				expect(el.toggleAttribute('ALIGN')).toBe(true);
				expect(!el.hasAttributeNS('', 'ALIGN')).toBe(true);
				expect(el.hasAttributeNS('', 'align')).toBe(true);
				expect(el.hasAttribute('align')).toBe(true);
				expect(!el.toggleAttribute('ALIGN')).toBe(true);
				expect(!el.hasAttributeNS('', 'ALIGN')).toBe(true);
				expect(!el.hasAttributeNS('', 'align')).toBe(true);
				expect(!el.hasAttribute('align')).toBe(true);
			},
		);
		context.test(
			'toggleAttribute should lowercase its name argument (mixed case attribute)',
			({ document }) => {
				let el = document.createElement('div');
				expect(el.toggleAttribute('CHEEseCaKe')).toBe(true);
				expect(!el.hasAttributeNS('', 'CHEEseCaKe')).toBe(true);
				expect(el.hasAttributeNS('', 'cheesecake')).toBe(true);
				expect(el.hasAttribute('cheesecake')).toBe(true);
			},
		);
		context.test(
			"toggleAttribute should not throw even when qualifiedName starts with 'xmlns'",
			({ document }) => {
				let el = document.createElement('foo');
				let tests = ['xmlns', 'xmlns:a', 'xmlnsx', 'xmlns0'];
				for (let i = 0; i < tests.length; i++) {
					expect(el.toggleAttribute(tests[i]!)).toBe(true);
					expect(el.hasAttribute(tests[i]!)).toBe(true);
				}
			},
		);
		context.test('Basic functionality should be intact. (toggleAttribute)', ({ document }) => {
			let el = document.createElement('foo');
			for (let i = 0; i < valid_names.length; i++) {
				expect(el.toggleAttribute(valid_names[i]!)).toBe(true);
				expect(el.hasAttribute(valid_names[i]!)).toBe(true);
				expect(!el.toggleAttribute(valid_names[i]!)).toBe(true);
				expect(!el.hasAttribute(valid_names[i]!)).toBe(true);
				// Check using force attr
				expect(el.toggleAttribute(valid_names[i]!, true)).toBe(true);
				expect(el.hasAttribute(valid_names[i]!)).toBe(true);
				expect(el.toggleAttribute(valid_names[i]!, true)).toBe(true);
				expect(el.hasAttribute(valid_names[i]!)).toBe(true);
				expect(!el.toggleAttribute(valid_names[i]!, false)).toBe(true);
				expect(!el.hasAttribute(valid_names[i]!)).toBe(true);
			}
		});
		context.test(
			'toggleAttribute should not change the order of previously set attributes.',
			({ document }) => {
				let el = document.createElement('foo');
				el.toggleAttribute('a');
				el.toggleAttribute('b');
				el.setAttribute('a', 'thing');
				el.toggleAttribute('c');
				attributes_are(el, [
					['a', 'thing'],
					['b', ''],
					['c', ''],
				]);
			},
		);
		context.test(
			'toggleAttribute should set the first attribute with the given name',
			({ document }) => {
				let el = document.createElement('baz');
				el.setAttributeNS('ab', 'attr', 'fail');
				el.setAttributeNS('kl', 'attr', 'pass');
				el.toggleAttribute('attr');
				attributes_are(el, [['attr', 'pass', 'kl']]);
			},
		);
		context.test(
			'toggleAttribute should set the attribute with the given qualified name',
			({ document }) => {
				// Based on a test by David Flanagan.
				let el = document.createElement('baz');
				el.setAttributeNS('foo', 'foo:bar', '1');
				el.setAttributeNS('foo', 'foo:bat', '2');
				expect(el.getAttribute('foo:bar')).toBe('1');
				expect(el.getAttribute('foo:bat')).toBe('2');
				attr_is(el.attributes[0]!, '1', 'bar', 'foo', 'foo', 'foo:bar');
				attr_is(el.attributes[1]!, '2', 'bat', 'foo', 'foo', 'foo:bat');
				el.toggleAttribute('foo:bar');
				expect(!el.hasAttribute('foo:bar')).toBe(true);
				attr_is(el.attributes[0]!, '2', 'bat', 'foo', 'foo', 'foo:bat');
			},
		);
		context.test(
			'Toggling element with inline style should make inline style disappear',
			({ document }) => {
				let el = document.createElement('foo');
				(el as unknown as { style: string }).style = 'color: red; background-color: green';
				expect(el.toggleAttribute('style')).toBe(false);
			},
		);
		context.test(
			'When qualifiedName does not match the Name production, an ' +
				'INVALID_CHARACTER_ERR exception is to be thrown. (setAttribute)',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				for (let i = 0; i < invalid_names.length; i++) {
					expect(function () {
						el.setAttribute(invalid_names[i]!, 'test');
					}).toThrow(
						expect.objectContaining({
							name: 'InvalidCharacterError',
							code: 5,
							constructor: DOMException,
						}),
					);
				}
			},
		);
		context.test(
			'setAttribute should lowercase its name argument (upper case attribute)',
			({ document }) => {
				let el = document.createElement('div');
				el.setAttribute('ALIGN', 'left');
				expect(el.getAttributeNS('', 'ALIGN')).toBe(null);
				expect(el.getAttributeNS('', 'align')).toBe('left');
				expect(el.getAttribute('align')).toBe('left');
			},
		);
		context.test(
			'setAttribute should lowercase its name argument (mixed case attribute)',
			({ document }) => {
				let el = document.createElement('div');
				el.setAttribute('CHEEseCaKe', 'tasty');
				expect(el.getAttributeNS('', 'CHEEseCaKe')).toBe(null);
				expect(el.getAttributeNS('', 'cheesecake')).toBe('tasty');
				expect(el.getAttribute('cheesecake')).toBe('tasty');
			},
		);
		context.test(
			"setAttribute should not throw even when qualifiedName starts with 'xmlns'",
			({ document }) => {
				let el = document.createElement('foo');
				let tests = ['xmlns', 'xmlns:a', 'xmlnsx', 'xmlns0'];
				for (let i = 0; i < tests.length; i++) {
					el.setAttribute(tests[i]!, 'success');
				}
			},
		);
		context.test('Basic functionality should be intact.', ({ document }) => {
			let el = document.createElement('foo');
			for (let i = 0; i < valid_names.length; i++) {
				el.setAttribute(valid_names[i]!, 'test');
				expect(el.getAttribute(valid_names[i]!)).toBe('test');
			}
		});
		context.test(
			'setAttribute should not change the order of previously set attributes.',
			({ document }) => {
				let el = document.createElement('foo');
				el.setAttribute('a', '1');
				el.setAttribute('b', '2');
				el.setAttribute('a', '3');
				el.setAttribute('c', '4');
				attributes_are(el, [
					['a', '3'],
					['b', '2'],
					['c', '4'],
				]);
			},
		);
		context.test(
			'setAttribute should set the first attribute with the given name',
			({ document }) => {
				let el = document.createElement('baz');
				el.setAttributeNS('ab', 'attr', 'fail');
				el.setAttributeNS('kl', 'attr', 'pass');
				el.setAttribute('attr', 'pass');
				attributes_are(el, [
					['attr', 'pass', 'ab'],
					['attr', 'pass', 'kl'],
				]);
			},
		);
		context.test(
			'setAttribute should set the attribute with the given qualified name',
			({ document }) => {
				// Based on a test by David Flanagan.
				let el = document.createElement('baz');
				el.setAttributeNS('foo', 'foo:bar', '1');
				expect(el.getAttribute('foo:bar')).toBe('1');
				attr_is(el.attributes[0]!, '1', 'bar', 'foo', 'foo', 'foo:bar');
				el.setAttribute('foo:bar', '2');
				expect(el.getAttribute('foo:bar')).toBe('2');
				attr_is(el.attributes[0]!, '2', 'bar', 'foo', 'foo', 'foo:bar');
			},
		);
		context.test(
			'When qualifiedName does not match the Name production, an ' +
				'INVALID_CHARACTER_ERR exception is to be thrown. (setAttributeNS)',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				for (let i = 0, il = invalid_names.length; i < il; ++i) {
					expect(function () {
						el.setAttributeNS('a', invalid_names[i]!, 'fail');
					}).toThrow(
						expect.objectContaining({
							name: 'InvalidCharacterError',
							code: 5,
							constructor: DOMException,
						}),
					);
				}
			},
		);
		context.test(
			'When qualifiedName does not match the QName production, an ' +
				'INVALID_CHARACTER_ERR exception is to be thrown.',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				for (let i = 0, il = invalid_qnames.length; i < il; ++i) {
					expect(
						function () {
							el.setAttributeNS('a', invalid_qnames[i]!, 'fail');
						},
						'Expected exception for ' + invalid_qnames[i]! + '.',
					).toThrow(
						expect.objectContaining({
							name: 'InvalidCharacterError',
							code: 5,
							constructor: DOMException,
						}),
					);
				}
			},
		);
		context.test('null and the empty string should result in a null namespace.', ({ document }) => {
			let el = document.createElement('foo');
			el.setAttributeNS(null, 'aa', 'bb');
			el.setAttributeNS('', 'xx', 'bb');
			attributes_are(el, [
				['aa', 'bb'],
				['xx', 'bb'],
			]);
		});
		context.test('A namespace is required to use a prefix.', ({ document, DOMException }) => {
			let el = document.createElement('foo');
			expect(function () {
				el.setAttributeNS('', 'aa:bb', 'fail');
			}).toThrow(
				expect.objectContaining({
					name: 'NamespaceError',
					code: 14,
					constructor: DOMException,
				}),
			);
			expect(function () {
				el.setAttributeNS(null, 'aa:bb', 'fail');
			}).toThrow(
				expect.objectContaining({
					name: 'NamespaceError',
					code: 14,
					constructor: DOMException,
				}),
			);
		});
		context.test(
			'The xml prefix should not be allowed for arbitrary namespaces',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				expect(function () {
					el.setAttributeNS('a', 'xml:bb', 'fail');
				}).toThrow(
					expect.objectContaining({
						name: 'NamespaceError',
						code: 14,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test("XML-namespaced attributes don't need an xml prefix", ({ document }) => {
			let el = document.createElement('foo');
			el.setAttributeNS(XML, 'a:bb', 'pass');
			expect(el.attributes.length).toBe(1);
			attr_is(el.attributes[0]!, 'pass', 'bb', XML, 'a', 'a:bb');
		});
		context.test(
			'The xmlns prefix should not be allowed for arbitrary namespaces',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				expect(function () {
					el.setAttributeNS('a', 'xmlns:bb', 'fail');
				}).toThrow(
					expect.objectContaining({
						name: 'NamespaceError',
						code: 14,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			'The xmlns qualified name should not be allowed for arbitrary namespaces',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				expect(function () {
					el.setAttributeNS('a', 'xmlns', 'fail');
				}).toThrow(
					expect.objectContaining({
						name: 'NamespaceError',
						code: 14,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test('xmlns should be allowed as local name', ({ document }) => {
			let el = document.createElement('foo');
			el.setAttributeNS('ns', 'a:xmlns', 'pass');
			expect(el.attributes.length).toBe(1);
			attr_is(el.attributes[0]!, 'pass', 'xmlns', 'ns', 'a', 'a:xmlns');
		});
		context.test(
			'The XMLNS namespace should require xmlns as prefix or qualified name',
			({ document, DOMException }) => {
				let el = document.createElement('foo');
				expect(function () {
					el.setAttributeNS(XMLNS, 'a:xmlns', 'fail');
				}).toThrow(
					expect.objectContaining({
						name: 'NamespaceError',
						code: 14,
						constructor: DOMException,
					}),
				);
				expect(function () {
					el.setAttributeNS(XMLNS, 'b:foo', 'fail');
				}).toThrow(
					expect.objectContaining({
						name: 'NamespaceError',
						code: 14,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test('xmlns should be allowed as prefix in the XMLNS namespace', ({ document }) => {
			let el = document.createElement('foo');
			el.setAttributeNS(XMLNS, 'xmlns:a', 'pass');
			expect(el.attributes.length).toBe(1);
			attr_is(el.attributes[0]!, 'pass', 'a', XMLNS, 'xmlns', 'xmlns:a');
		});
		context.test(
			'xmlns should be allowed as qualified name in the XMLNS namespace',
			({ document }) => {
				let el = document.createElement('foo');
				el.setAttributeNS(XMLNS, 'xmlns', 'pass');
				expect(el.attributes.length).toBe(1);
				attr_is(el.attributes[0]!, 'pass', 'xmlns', XMLNS, null, 'xmlns');
			},
		);
		context.test(
			'Setting the same attribute with another prefix should not change the prefix',
			({ document }) => {
				let el = document.createElement('foo');
				el.setAttributeNS('a', 'foo:bar', 'X');
				expect(el.attributes.length).toBe(1);
				attr_is(el.attributes[0]!, 'X', 'bar', 'a', 'foo', 'foo:bar');

				el.setAttributeNS('a', 'quux:bar', 'Y');
				expect(el.attributes.length).toBe(1);
				attr_is(el.attributes[0]!, 'Y', 'bar', 'a', 'foo', 'foo:bar');
				el.removeAttributeNS('a', 'bar');
			},
		);
		context.test('setAttribute should not throw even if a load is not allowed', ({ document }) => {
			let el = document.createElement('iframe');
			el.setAttribute('src', 'file:///home');
			expect(el.getAttribute('src')).toBe('file:///home');
		});
		context.test('Attributes should work in document fragments.', ({ document }) => {
			let docFragment = document.createDocumentFragment();
			let newOne = document.createElement('newElement');
			newOne.setAttribute('newdomestic', 'Yes');
			docFragment.appendChild(newOne);
			let domesticNode = docFragment.firstChild as Element;
			let attr = domesticNode.attributes.item(0)!;
			attr_is(attr, 'Yes', 'newdomestic', null, null, 'newdomestic');
		});
		context.test('Attribute values should not be parsed.', ({ document }) => {
			let el = document.createElement('foo');
			el.setAttribute('x', 'y');
			let attr = el.attributes[0]!;
			attr.value = 'Y&lt;';
			attr_is(attr, 'Y&lt;', 'x', null, null, 'x');
			expect(el.getAttribute('x')).toBe('Y&lt;');
		});
		context.test(
			'Specified attributes should be accessible.',
			({ document }) => {
				let el = document.getElementsByTagName('span')[0]!;
				attr_is(el.attributes[0]!, 'test1', 'id', null, null, 'id');
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html><div id="log"></div><span id="test1"></span><span class="&amp;&lt;&gt;foo"></span>',
				},
			},
		);
		context.test(
			'Entities in attributes should have been expanded while parsing.',
			({ document }) => {
				let el = document.getElementsByTagName('span')[1]!;
				attr_is(el.attributes[0]!, '&<>foo', 'class', null, null, 'class');
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html><div id="log"></div><span id="test1"></span><span class="&amp;&lt;&gt;foo"></span>',
				},
			},
		);
		context.test('Unset attributes return null', ({ document }) => {
			let el = document.createElement('div');
			expect(el.hasAttribute('bar')).toBe(false);
			expect(el.hasAttributeNS(null, 'bar')).toBe(false);
			expect(el.hasAttributeNS('', 'bar')).toBe(false);
			expect(el.getAttribute('bar')).toBe(null);
			expect(el.getAttributeNS(null, 'bar')).toBe(null);
			expect(el.getAttributeNS('', 'bar')).toBe(null);
		});
		context.test('First set attribute is returned by getAttribute', ({ document }) => {
			let el = document.createElement('div');
			el.setAttributeNS('ab', 'attr', 't1');
			el.setAttributeNS('kl', 'attr', 't2');
			expect(el.hasAttribute('attr')).toBe(true);
			expect(el.hasAttributeNS('ab', 'attr')).toBe(true);
			expect(el.hasAttributeNS('kl', 'attr')).toBe(true);
			expect(el.getAttribute('attr')).toBe('t1');
			expect(el.getAttributeNS('ab', 'attr')).toBe('t1');
			expect(el.getAttributeNS('kl', 'attr')).toBe('t2');
			expect(el.getAttributeNS(null, 'attr')).toBe(null);
			expect(el.getAttributeNS('', 'attr')).toBe(null);
		});
		context.test('Style attributes are not normalized', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('style', 'color:#fff;');
			expect(el.hasAttribute('style')).toBe(true);
			expect(el.hasAttributeNS(null, 'style')).toBe(true);
			expect(el.hasAttributeNS('', 'style')).toBe(true);
			expect(el.getAttribute('style')).toBe('color:#fff;');
			expect(el.getAttributeNS(null, 'style')).toBe('color:#fff;');
			expect(el.getAttributeNS('', 'style')).toBe('color:#fff;');
		});
		context.test(
			'Only lowercase attributes are returned on HTML elements (upper case attribute)',
			({ document }) => {
				let el = document.createElement('div');
				el.setAttributeNS('', 'ALIGN', 'left');
				expect(el.hasAttribute('ALIGN')).toBe(false);
				expect(el.hasAttribute('align')).toBe(false);
				expect(el.hasAttributeNS(null, 'ALIGN')).toBe(true);
				expect(el.hasAttributeNS(null, 'align')).toBe(false);
				expect(el.hasAttributeNS('', 'ALIGN')).toBe(true);
				expect(el.hasAttributeNS('', 'align')).toBe(false);
				expect(el.getAttribute('ALIGN')).toBe(null);
				expect(el.getAttribute('align')).toBe(null);
				expect(el.getAttributeNS(null, 'ALIGN')).toBe('left');
				expect(el.getAttributeNS('', 'ALIGN')).toBe('left');
				expect(el.getAttributeNS(null, 'align')).toBe(null);
				expect(el.getAttributeNS('', 'align')).toBe(null);
				el.removeAttributeNS('', 'ALIGN');
			},
		);
		context.test(
			'Only lowercase attributes are returned on HTML elements (mixed case attribute)',
			({ document }) => {
				let el = document.createElement('div');
				el.setAttributeNS('', 'CHEEseCaKe', 'tasty');
				expect(el.hasAttribute('CHEESECAKE')).toBe(false);
				expect(el.hasAttribute('CHEEseCaKe')).toBe(false);
				expect(el.hasAttribute('cheesecake')).toBe(false);
				expect(el.hasAttributeNS('', 'CHEESECAKE')).toBe(false);
				expect(el.hasAttributeNS('', 'CHEEseCaKe')).toBe(true);
				expect(el.hasAttributeNS('', 'cheesecake')).toBe(false);
				expect(el.hasAttributeNS(null, 'CHEESECAKE')).toBe(false);
				expect(el.hasAttributeNS(null, 'CHEEseCaKe')).toBe(true);
				expect(el.hasAttributeNS(null, 'cheesecake')).toBe(false);
				expect(el.getAttribute('CHEESECAKE')).toBe(null);
				expect(el.getAttribute('CHEEseCaKe')).toBe(null);
				expect(el.getAttribute('cheesecake')).toBe(null);
				expect(el.getAttributeNS(null, 'CHEESECAKE')).toBe(null);
				expect(el.getAttributeNS('', 'CHEESECAKE')).toBe(null);
				expect(el.getAttributeNS(null, 'CHEEseCaKe')).toBe('tasty');
				expect(el.getAttributeNS('', 'CHEEseCaKe')).toBe('tasty');
				expect(el.getAttributeNS(null, 'cheesecake')).toBe(null);
				expect(el.getAttributeNS('', 'cheesecake')).toBe(null);
				el.removeAttributeNS('', 'CHEEseCaKe');
			},
		);
		context.test(
			'First set attribute is returned with mapped attribute set first',
			({ document }) => {
				let el = document.createElement('div');
				document.body.appendChild(el);
				el.setAttributeNS('', 'align', 'left');
				el.setAttributeNS('xx', 'align', 'right');
				el.setAttributeNS('', 'foo', 'left');
				el.setAttributeNS('xx', 'foo', 'right');
				expect(el.hasAttribute('align')).toBe(true);
				expect(el.hasAttribute('foo')).toBe(true);
				expect(el.hasAttributeNS('xx', 'align')).toBe(true);
				expect(el.hasAttributeNS(null, 'foo')).toBe(true);
				expect(el.getAttribute('align')).toBe('left');
				expect(el.getAttribute('foo')).toBe('left');
				expect(el.getAttributeNS('xx', 'align')).toBe('right');
				expect(el.getAttributeNS(null, 'foo')).toBe('left');
				expect(el.getAttributeNS('', 'foo')).toBe('left');
				el.removeAttributeNS('', 'align');
				el.removeAttributeNS('xx', 'align');
				el.removeAttributeNS('', 'foo');
				el.removeAttributeNS('xx', 'foo');
				document.body.removeChild(el);
			},
		);
		context.test(
			'First set attribute is returned with mapped attribute set later',
			({ document }) => {
				let el = document.createElement('div');
				el.setAttributeNS('xx', 'align', 'right');
				el.setAttributeNS('', 'align', 'left');
				el.setAttributeNS('xx', 'foo', 'right');
				el.setAttributeNS('', 'foo', 'left');
				expect(el.hasAttribute('align')).toBe(true);
				expect(el.hasAttribute('foo')).toBe(true);
				expect(el.hasAttributeNS('xx', 'align')).toBe(true);
				expect(el.hasAttributeNS(null, 'foo')).toBe(true);
				expect(el.getAttribute('align')).toBe('right');
				expect(el.getAttribute('foo')).toBe('right');
				expect(el.getAttributeNS('xx', 'align')).toBe('right');
				expect(el.getAttributeNS(null, 'foo')).toBe('left');
				expect(el.getAttributeNS('', 'foo')).toBe('left');
				el.removeAttributeNS('', 'align');
				el.removeAttributeNS('xx', 'align');
				el.removeAttributeNS('', 'foo');
				el.removeAttributeNS('xx', 'foo');
			},
		);
		context.test('Non-HTML element with upper-case attribute', ({ document }) => {
			let el = document.createElementNS('http://www.example.com', 'foo');
			el.setAttribute('A', 'test');
			expect(el.hasAttribute('A'), 'hasAttribute()').toBe(true);
			expect(el.hasAttributeNS('', 'A'), 'el.hasAttributeNS("")').toBe(true);
			expect(el.hasAttributeNS(null, 'A'), 'el.hasAttributeNS(null)').toBe(true);
			expect(
				el.hasAttributeNS(undefined as unknown as string, 'A'),
				'el.hasAttributeNS(undefined)',
			).toBe(true);
			expect(el.hasAttributeNS('foo', 'A'), 'el.hasAttributeNS("foo")').toBe(false);

			expect(el.getAttribute('A'), 'getAttribute()').toBe('test');
			expect(el.getAttributeNS('', 'A'), 'el.getAttributeNS("")').toBe('test');
			expect(el.getAttributeNS(null, 'A'), 'el.getAttributeNS(null)').toBe('test');
			expect(
				el.getAttributeNS(undefined as unknown as string, 'A'),
				'el.getAttributeNS(undefined)',
			).toBe('test');
			expect(el.getAttributeNS('foo', 'A'), 'el.getAttributeNS("foo")').toBe(null);
		});
		context.test('Attribute with prefix in local name', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('pre:fix', 'value 1');
			el.setAttribute('fix', 'value 2');

			let prefixed = el.attributes[0]!;
			expect(prefixed.localName, 'prefixed local name').toBe('pre:fix');
			expect(prefixed.namespaceURI, 'prefixed namespace').toBe(null);

			let unprefixed = el.attributes[1]!;
			expect(unprefixed.localName, 'unprefixed local name').toBe('fix');
			expect(unprefixed.namespaceURI, 'unprefixed namespace').toBe(null);

			el.removeAttributeNS(null, 'pre:fix');
			expect(el.attributes[0]!).toBe(unprefixed);
		});
		context.test('getAttributeNames tests', ({ document }) => {
			let el = document.createElement('div');
			el.setAttribute('foo', 'bar');
			expect(el.getAttributeNames().length).toBe(1);
			expect(el.getAttributeNames()[0]).toBe(el.attributes[0]!.name);
			expect(el.getAttributeNames()[0]).toBe('foo');

			el.removeAttribute('foo');
			expect(el.getAttributeNames().length).toBe(0);

			el.setAttribute('foo', 'bar');
			el.setAttributeNS('', 'FOO', 'bar');
			el.setAttributeNS('dummy1', 'foo', 'bar');
			el.setAttributeNS('dummy2', 'dummy:foo', 'bar');
			expect(el.getAttributeNames().length).toBe(4);
			expect(el.getAttributeNames()[0]).toBe('foo');
			expect(el.getAttributeNames()[1]).toBe('FOO');
			expect(el.getAttributeNames()[2]).toBe('foo');
			expect(el.getAttributeNames()[3]).toBe('dummy:foo');
			expect(el.getAttributeNames()[0]).toBe(el.attributes[0]!.name);
			expect(el.getAttributeNames()[1]).toBe(el.attributes[1]!.name);
			expect(el.getAttributeNames()[2]).toBe(el.attributes[2]!.name);
			expect(el.getAttributeNames()[3]).toBe(el.attributes[3]!.name);

			el.removeAttributeNS('', 'FOO');
			expect(el.getAttributeNames().length).toBe(3);
			expect(el.getAttributeNames()[0]).toBe('foo');
			expect(el.getAttributeNames()[1]).toBe('foo');
			expect(el.getAttributeNames()[2]).toBe('dummy:foo');
			expect(el.getAttributeNames()[0]).toBe(el.attributes[0]!.name);
			expect(el.getAttributeNames()[1]).toBe(el.attributes[1]!.name);
			expect(el.getAttributeNames()[2]).toBe(el.attributes[2]!.name);
		});
	}
}
