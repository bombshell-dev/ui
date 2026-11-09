import type { CompatibilityContext, DOMFixture } from '../context.ts';

export const spec = 'https://w3c.github.io/DOM-Parsing/#dfn-xml-serialization';
export const requires = ['document.xml', 'document.parsing'] as const;
const requiredGlobals = ['DOMParser', 'XMLSerializer'] as const;
export { requiredGlobals as globals };
// Adapted from WPT domparsing/XMLSerializer-serializeToString.html.
// Copyright © web-platform-tests contributors. BSD-3-Clause.
// See ../../../test/wpt/LICENSE and docs/wpt-ranges-parsing.md.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/domparsing/XMLSerializer-serializeToString.html';

const xmlns = 'http://www.w3.org/2000/xmlns/';
function setup(fixture: DOMFixture): {
	parse(source: string): Element;
	serialize(node: Node): string;
} {
	const DOMParser = fixture.globals('DOMParser') as typeof globalThis.DOMParser;
	const XMLSerializer = fixture.globals('XMLSerializer') as typeof globalThis.XMLSerializer;
	const parser = new DOMParser(),
		serializer = new XMLSerializer();
	return {
		parse: (source: string) => parser.parseFromString(source, 'application/xml').documentElement,
		serialize: (node: Node) => serializer.serializeToString(node),
	};
}

/** Registers XML namespace fixup, escaping, and serialization identity cases. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'resets the default namespace when a no-namespace child is moved below it',
		(fixture) => {
			const { parse, serialize } = setup(fixture);
			const root = parse('<root><child>value</child></root>');
			const child = root.firstChild!;
			const parent = root.ownerDocument.createElementNS('urn:outer', 'parent');
			root.replaceChild(parent, child);
			parent.appendChild(child);
			expect(serialize(root)).toBe(
				'<root><parent xmlns="urn:outer"><child xmlns="">value</child></parent></root>',
			);
			expect((child as Element).hasAttribute('xmlns')).toBe(false);
			expect(child.parentNode).toBe(parent);
		},
	);
	for (const { name, source, expected } of [
		{
			name: 'omits a redundant empty default namespace declaration',
			source: '<root><child xmlns=""/></root>',
			expected: '<root><child/></root>',
		},
		{
			name: 'omits a redundant nonempty default namespace declaration',
			source: '<root xmlns="u1"><child xmlns="u1"/></root>',
			expected: '<root xmlns="u1"><child/></root>',
		},
		{
			name: 'preserves a necessary default namespace reset without repeating it on descendants',
			source: '<root xmlns="u1"><child xmlns=""><inner/></child></root>',
			expected: '<root xmlns="u1"><child xmlns=""><inner/></child></root>',
		},
	]) {
		context.test(name, (fixture) => {
			const { parse, serialize } = setup(fixture);
			expect(serialize(parse(source))).toBe(expected);
		});
	}
	context.test(
		'uses the nearest declaration for an attribute with a namespace but no prefix',
		(fixture) => {
			const { parse, serialize } = setup(fixture);
			const root = parse('<root xmlns:outer="urn:a"><child xmlns:inner="urn:a"/></root>');
			const child = root.firstElementChild!;
			child.setAttributeNS('urn:a', 'name', 'value');
			expect(serialize(root)).toBe(
				'<root xmlns:outer="urn:a"><child xmlns:inner="urn:a" inner:name="value"/></root>',
			);
			expect(child.getAttributeNodeNS('urn:a', 'name')!.prefix).toBeNull();
		},
	);
	context.test('reuses an existing attribute prefix for the same namespace', (fixture) => {
		const { parse, serialize } = setup(fixture);
		const root = parse('<root xmlns:existing="urn:a"><child/></root>');
		root.firstElementChild!.setAttributeNS('urn:a', 'different:name', 'value');
		expect(serialize(root)).toBe(
			'<root xmlns:existing="urn:a"><child existing:name="value"/></root>',
		);
		expect(root.firstElementChild!.getAttributeNodeNS('urn:a', 'name')!.prefix).toBe('different');
	});
	context.test(
		'generates a prefix when an attribute prefix conflicts with an inherited declaration',
		(fixture) => {
			const { parse, serialize } = setup(fixture);
			const root = parse('<root xmlns:p="urn:first"><child/></root>');
			root.firstElementChild!.setAttributeNS('urn:second', 'p:name', 'value');
			expect(serialize(root)).toBe(
				'<root xmlns:p="urn:first"><child xmlns:ns1="urn:second" ns1:name="value"/></root>',
			);
			const reparsed = parse(serialize(root));
			expect(reparsed.firstElementChild!.getAttributeNS('urn:second', 'name')).toBe('value');
		},
	);
	context.test(
		'accounts for conflicting xmlns attributes on the element being serialized',
		(fixture) => {
			const { parse, serialize } = setup(fixture);
			const root = parse('<root/>');
			root.setAttributeNS('urn:first', 'p:name', 'value');
			root.setAttributeNS(xmlns, 'xmlns:p', 'urn:second');
			expect(serialize(root)).toBe(
				'<root xmlns:ns1="urn:first" ns1:name="value" xmlns:p="urn:second"/>',
			);
			expect(root.getAttributeNodeNS('urn:first', 'name')!.prefix).toBe('p');
		},
	);
	context.test('fixes element prefixes consistently in opening and closing tags', (fixture) => {
		const { parse, serialize } = setup(fixture);
		const root = parse('<root xmlns:p1="urn:a"><child xmlns:p2="urn:a"/></root>');
		const node = root.ownerDocument.createElementNS('urn:a', 'nested');
		node.appendChild(root.ownerDocument.createElementNS('urn:a', 'inner'));
		root.firstElementChild!.appendChild(node);
		expect(serialize(root)).toBe(
			'<root xmlns:p1="urn:a"><child xmlns:p2="urn:a"><p2:nested><p2:inner/></p2:nested></child></root>',
		);
	});
	context.test(
		'serializes document fragments and preserves children of HTML void elements in XML',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const { serialize } = setup(fixture);
			const fragment = document.createDocumentFragment();
			const image = document.createElement('img');
			image.append(document.createElement('style'));
			fragment.append(image, document.createElement('span'));
			expect(serialize(fragment)).toBe(
				'<img xmlns="http://www.w3.org/1999/xhtml"><style></style></img><span xmlns="http://www.w3.org/1999/xhtml"></span>',
			);
			expect(fragment.firstChild).toBe(image);
			expect(fragment.childNodes.length).toBe(2);
		},
	);
	context.test(
		'escapes XML attribute characters and round trips their original values',
		(fixture) => {
			const { parse, serialize } = setup(fixture);
			const root = parse('<root/>');
			root.setAttribute('value', '<>&"\'');
			expect(serialize(root)).toBe('<root value="&lt;&gt;&amp;&quot;\'"/>');
			expect(parse(serialize(root)).getAttribute('value')).toBe('<>&"\'');
		},
	);
	context.test(
		'emits attribute nodes as empty strings even when their values are nonempty',
		(fixture) => {
			const { parse, serialize } = setup(fixture);
			const root = parse('<root/>');
			root.setAttribute('value', '<>&"\'');
			expect(serialize(root.getAttributeNode('value')!)).toBe('');
		},
	);
}
