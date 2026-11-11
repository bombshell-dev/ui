import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const XMLNS_URI = 'http://www.w3.org/2000/xmlns/';

	context.test(
		'check XMLSerializer.serializeToString method could parsing xmldoc to string',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);
			const createXmlDoc = () =>
				new DOMParser().parseFromString(
					'<?xml version="1.0" encoding="UTF-8"?><root><child1>value1</child1></root>',
					'text/xml',
				);

			let root = createXmlDoc().documentElement;
			expect(serialize(root)).toBe('<root><child1>value1</child1></root>');
		},
	);
	context.test(
		'check XMLSerializer.serializeToString method could parsing document to string',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<html><head></head><body><div></div><span></span></body></html>');
			expect(serialize(root.ownerDocument)).toBe('<html><head/><body><div/><span/></body></html>');
		},
	);
	context.test(
		'Check if the default namespace is correctly reset.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);
			const createXmlDoc = () =>
				new DOMParser().parseFromString(
					'<?xml version="1.0" encoding="UTF-8"?><root><child1>value1</child1></root>',
					'text/xml',
				);

			let root = createXmlDoc().documentElement;
			let element = root.ownerDocument.createElementNS('urn:foo', 'another');
			let child1 = root.firstChild as Element;
			root.replaceChild(element, child1);
			element.appendChild(child1);
			expect(serialize(root)).toBe(
				'<root><another xmlns="urn:foo"><child1 xmlns="">value1</child1></another></root>',
			);
		},
	);
	context.test(
		'Check if there is no redundant empty namespace declaration.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse(
				'<root xmlns="urn:bar"><outer xmlns=""><inner>value1</inner></outer></root>',
			);
			expect(serialize(root)).toBe(
				'<root xmlns="urn:bar"><outer xmlns=""><inner>value1</inner></outer></root>',
			);
		},
	);
	context.test('Check if redundant xmlns="..." is dropped.', ({ DOMParser, XMLSerializer }) => {
		const parse = (xmlString: string) =>
			new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
		const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

		expect(serialize(parse('<root><child xmlns=""/></root>'))).toBe('<root><child/></root>');
		expect(serialize(parse('<root xmlns=""><child xmlns=""/></root>'))).toBe(
			'<root><child/></root>',
		);
		expect(serialize(parse('<root xmlns="u1"><child xmlns="u1"/></root>'))).toBe(
			'<root xmlns="u1"><child/></root>',
		);
	});
	context.test('Check if inconsistent xmlns="..." is dropped.', ({ DOMParser, XMLSerializer }) => {
		const parse = (xmlString: string) =>
			new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
		const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

		const root = parse('<root xmlns="uri1"/>');
		const child = root.ownerDocument.createElement('child');
		child.setAttributeNS(XMLNS_URI, 'xmlns', 'FAIL1');
		root.appendChild(child);
		const child2 = root.ownerDocument.createElementNS('uri2', 'child2');
		child2.setAttributeNS(XMLNS_URI, 'xmlns', 'FAIL2');
		root.appendChild(child2);
		const child3 = root.ownerDocument.createElementNS('uri1', 'child3');
		child3.setAttributeNS(XMLNS_URI, 'xmlns', 'FAIL3');
		root.appendChild(child3);
		const child4 = root.ownerDocument.createElementNS('uri4', 'child4');
		child4.setAttributeNS(XMLNS_URI, 'xmlns', 'uri4');
		root.appendChild(child4);
		const child5 = root.ownerDocument.createElement('child5');
		child5.setAttributeNS(XMLNS_URI, 'xmlns', '');
		root.appendChild(child5);
		expect(serialize(root)).toBe(
			'<root xmlns="uri1"><child xmlns=""/><child2 xmlns="uri2"/><child3/><child4 xmlns="uri4"/><child5 xmlns=""/></root>',
		);
	});
	context.test(
		'Drop inconsistent xmlns="..." by matching on local name',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root1 = parse('<package></package>');
			root1.setAttribute('xmlns', 'http://www.idpf.org/2007/opf');
			const manifest1 = root1.appendChild(root1.ownerDocument.createElement('manifest'));
			manifest1.setAttribute('xmlns', 'http://www.idpf.org/2007/opf');
			expect(serialize(root1)).toBe('<package><manifest/></package>');

			const root2 = parse('<package xmlns="http://www.idpf.org/2007/opf"></package>');
			const manifest2 = root2.appendChild(root2.ownerDocument.createElement('manifest'));
			manifest2.setAttribute('xmlns', 'http://www.idpf.org/2007/opf');
			expect(serialize(root2)).toBe(
				'<package xmlns="http://www.idpf.org/2007/opf"><manifest xmlns=""/></package>',
			);

			const root3 = parse('<package xmlns="http://www.idpf.org/2007/opf"></package>');
			const manifest3 = root3.appendChild(root3.ownerDocument.createElement('manifest'));
			expect(serialize(root3)).toBe(
				'<package xmlns="http://www.idpf.org/2007/opf"><manifest xmlns=""/></package>',
			);
		},
	);
	context.test(
		'Check if an attribute with namespace and no prefix is serialized with the nearest-declared prefix',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<r xmlns:xx="uri"></r>');
			root.setAttributeNS('uri', 'name', 'v');
			expect(serialize(root)).toBe('<r xmlns:xx="uri" xx:name="v"/>');

			let root2 = parse('<r xmlns:xx="uri"><b/></r>');
			let child = root2.firstChild as Element as Element;
			child.setAttributeNS('uri', 'name', 'v');
			expect(serialize(root2)).toBe('<r xmlns:xx="uri"><b xx:name="v"/></r>');

			let root3 = parse('<r xmlns:x0="uri" xmlns:x2="uri"><b xmlns:x1="uri"/></r>');
			let child3 = root3.firstChild as Element as Element;
			child3.setAttributeNS('uri', 'name', 'v');
			expect(serialize(root3), 'Should choose the nearest prefix').toBe(
				'<r xmlns:x0="uri" xmlns:x2="uri"><b xmlns:x1="uri" x1:name="v"/></r>',
			);
		},
	);
	context.test(
		'Check if an attribute with namespace and no prefix is serialized with the nearest-declared prefix even if the prefix is assigned to another namespace.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<el1 xmlns:p="u1" xmlns:q="u1"><el2 xmlns:q="u2"/></el1>');
			(root.firstChild as Element).setAttributeNS('u1', 'name', 'v');
			expect(serialize(root)).toBe(
				'<el1 xmlns:p="u1" xmlns:q="u1"><el2 xmlns:q="u2" q:name="v"/></el1>',
			);
		},
	);
	context.test(
		'Check if the prefix of an attribute is replaced with another existing prefix mapped to the same namespace URI.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<r xmlns:xx="uri"></r>');
			root.setAttributeNS('uri', 'p:name', 'v');
			expect(serialize(root)).toBe('<r xmlns:xx="uri" xx:name="v"/>');

			let root2 = parse('<r xmlns:xx="uri"><b/></r>');
			let child = root2.firstChild as Element as Element;
			child.setAttributeNS('uri', 'p:name', 'value');
			expect(serialize(root2)).toBe('<r xmlns:xx="uri"><b xx:name="value"/></r>');
		},
	);
	context.test(
		'Check if the prefix of an attribute is NOT preserved in a case where neither its prefix nor its namespace URI is not already used.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<r xmlns:xx="uri"></r>');
			root.setAttributeNS('uri2', 'p:name', 'value');
			expect(serialize(root)).toBe('<r xmlns:xx="uri" xmlns:ns1="uri2" ns1:name="value"/>');
		},
	);
	context.test(
		'Check if the prefix of an attribute is replaced with a generated one in a case where the prefix is already mapped to a different namespace URI.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<r xmlns:xx="uri"></r>');
			root.setAttributeNS('uri2', 'xx:name', 'value');
			expect(serialize(root)).toBe('<r xmlns:xx="uri" xmlns:ns1="uri2" ns1:name="value"/>');
		},
	);
	context.test('Attribute value escapes: lt', ({ DOMParser, XMLSerializer }) => {
		const parse = (xmlString: string) =>
			new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
		const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

		let root = parse('<root attr="&lt;"/>');
		expect(serialize(root)).toBe('<root attr="&lt;"/>');
	});
	context.test('Attribute value escapes: gt', ({ DOMParser, XMLSerializer }) => {
		const parse = (xmlString: string) =>
			new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
		const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

		let root = parse('<root attr=">"/>');
		expect(serialize(root)).toBe('<root attr="&gt;"/>');
	});
	context.test('Attribute value escapes: quot', ({ DOMParser, XMLSerializer }) => {
		const parse = (xmlString: string) =>
			new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
		const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

		let root = parse("<root attr='\"'/>");
		expect(serialize(root)).toBe('<root attr="&quot;"/>');
	});
	context.test('Attribute value escapes: apos', ({ DOMParser, XMLSerializer }) => {
		const parse = (xmlString: string) =>
			new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
		const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

		let root = parse('<root attr="\'"/>');
		expect(serialize(root)).toBe('<root attr="\'"/>');
	});
	context.test(
		'[TENTATIVE] check XMLSerializer.serializeToString escapes attribute values for roundtripping',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = parse('<root />');
			root.setAttribute('attr', '\t');
			expect(['<root attr="&#9;"/>', '<root attr="&#x9;"/>']).toContain(serialize(root));
			root.setAttribute('attr', '\n');
			expect(['<root attr="&#xA;"/>', '<root attr="&#10;"/>']).toContain(serialize(root));
			root.setAttribute('attr', '\r');
			expect(['<root attr="&#xD;"/>', '<root attr="&#13;"/>']).toContain(serialize(root));
		},
	);
	context.test(
		'Check if attribute serialization takes into account of following xmlns:* attributes',
		({ DOMParser, XMLSerializer, Document }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = new Document().createElement('root');
			root.setAttributeNS('uri1', 'p:foobar', 'value1');
			root.setAttributeNS(XMLNS_URI, 'xmlns:p', 'uri2');
			expect(serialize(root)).toBe('<root xmlns:ns1="uri1" ns1:foobar="value1" xmlns:p="uri2"/>');
		},
	);
	context.test(
		'Check if attribute serialization takes into account of the same prefix declared in an ancestor element',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = parse('<root xmlns:p="uri1"><child/></root>');
			(root.firstChild as Element).setAttributeNS('uri2', 'p:foobar', 'v');
			expect(serialize(root)).toBe(
				'<root xmlns:p="uri1"><child xmlns:ns1="uri2" ns1:foobar="v"/></root>',
			);
		},
	);
	context.test(
		'Check if start tag serialization drops element prefix if the namespace is same as inherited default namespace.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			expect(serialize(parse('<root><child/></root>'))).toBe('<root><child/></root>');
			expect(serialize(parse('<root xmlns="u1"><p:child xmlns:p="u1"/></root>'))).toBe(
				'<root xmlns="u1"><child xmlns:p="u1"/></root>',
			);
		},
	);
	context.test(
		'Check if start tag serialization finds an appropriate prefix.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = parse('<root xmlns:p1="u1"><child xmlns:p2="u1"/></root>');
			const child2 = root.ownerDocument.createElementNS('u1', 'child2');
			(root.firstChild as Element).appendChild(child2);
			expect(serialize(root)).toBe(
				'<root xmlns:p1="u1"><child xmlns:p2="u1"><p2:child2/></child></root>',
			);
		},
	);
	context.test(
		'Check if end tag serialization matches start tag when an appropriate prefix is found.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = parse('<root xmlns:p1="u1"><child xmlns:p2="u1"/></root>');
			const child2 = root.ownerDocument.createElementNS('u1', 'child2');
			const grandchild = root.ownerDocument.createElementNS('u1', 'grandchild');
			child2.appendChild(grandchild);
			(root.firstChild as Element).appendChild(child2);
			expect(serialize(root)).toBe(
				'<root xmlns:p1="u1"><child xmlns:p2="u1"><p2:child2><p2:grandchild/></p2:child2></child></root>',
			);
		},
	);
	context.test(
		'Check if start tag serialization takes into account of its xmlns:* attributes',
		({ DOMParser, XMLSerializer, Document }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = new Document().createElementNS('uri1', 'p:root');
			root.setAttributeNS(XMLNS_URI, 'xmlns:p', 'uri2');
			expect(serialize(root)).toBe('<ns1:root xmlns:ns1="uri1" xmlns:p="uri2"/>');
		},
	);
	context.test(
		'Check if start tag serialization applied the original prefix even if it is declared in an ancestor element.',
		({ DOMParser, XMLSerializer, Document }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = new Document().createElement('root');
			root.setAttributeNS(XMLNS_URI, 'xmlns:p', 'uri2');
			const child = root.ownerDocument.createElementNS('uri1', 'p:child');
			root.appendChild(child);
			expect(serialize(root)).toBe('<root xmlns:p="uri2"><p:child xmlns:p="uri1"/></root>');
		},
	);
	context.test(
		'Check if start tag serialization does NOT apply the default namespace if its namespace is declared in an ancestor.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			expect(serialize(parse('<root xmlns:x="uri1"><table xmlns="uri1"></table></root>'))).toBe(
				'<root xmlns:x="uri1"><x:table xmlns="uri1"/></root>',
			);
		},
	);
	context.test(
		'Check if end tag serialization matches start tag for elements in the XML namespace.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const xmlNS = 'http://www.w3.org/XML/1998/namespace';
			const root = parse('<root/>');
			const child = root.ownerDocument.createElementNS(xmlNS, 'foo');
			const grandchild = root.ownerDocument.createElementNS(xmlNS, 'bar');
			child.appendChild(grandchild);
			root.appendChild(child);
			expect(serialize(root)).toBe('<root><xml:foo><xml:bar/></xml:foo></root>');
		},
	);
	context.test(
		'Check if generated prefixes match to "ns${index}".',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = parse('<root><child1/><child2/></root>');
			(root.firstChild as Element).setAttributeNS('uri1', 'attr1', 'value1');
			(root.firstChild as Element).setAttributeNS('uri2', 'attr2', 'value2');
			(root.lastChild as Element).setAttributeNS('uri3', 'attr3', 'value3');
			expect(serialize(root)).toBe(
				'<root><child1 xmlns:ns1="uri1" ns1:attr1="value1" xmlns:ns2="uri2" ns2:attr2="value2"/><child2 xmlns:ns3="uri3" ns3:attr3="value3"/></root>',
			);
		},
	);
	context.test(
		'Check if "ns1" is generated even if the element already has xmlns:ns1.',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = parse('<root xmlns:ns2="uri2"><child xmlns:ns1="uri1"/></root>');
			(root.firstChild as Element).setAttributeNS('uri3', 'attr1', 'value1');
			expect(serialize(root)).toBe(
				'<root xmlns:ns2="uri2"><child xmlns:ns1="uri1" xmlns:ns1="uri3" ns1:attr1="value1"/></root>',
			);
		},
	);
	context.test(
		'Check if no special handling for XLink namespace unlike HTML serializer.',
		({ DOMParser, XMLSerializer, Document }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = new Document().createElement('root');
			root.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'v');
			expect(serialize(root)).toBe('<root xmlns:ns1="http://www.w3.org/1999/xlink" ns1:href="v"/>');

			const root2 = new Document().createElement('root');
			root2.setAttributeNS('http://www.w3.org/1999/xlink', 'xl:type', 'v');
			expect(serialize(root2)).toBe('<root xmlns:xl="http://www.w3.org/1999/xlink" xl:type="v"/>');
		},
	);
	context.test(
		'Check if document fragment serializes.',
		({ document, DOMParser, XMLSerializer, DocumentFragment }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			let root = new DocumentFragment();
			root.append(document.createElement('div'));
			root.append(document.createElement('span'));
			expect(serialize(root)).toBe(
				'<div xmlns="http://www.w3.org/1999/xhtml"></div><span xmlns="http://www.w3.org/1999/xhtml"></span>',
			);
		},
	);
	context.test(
		'Check children were included for void elements',
		({ document, DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = document.createElement('img');
			root.append(document.createElement('style'));
			root.append(document.createElement('style'));
			expect(serialize(root)).toBe(
				'<img xmlns=\"http://www.w3.org/1999/xhtml\"><style></style><style></style></img>',
			);
		},
	);
	context.test(
		'Check if a prefix bound to an empty namespace URI ("no namespace") serialize',
		({ DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			const root = parse('<root xmlns="" xmlns:foo="urn:bar"/>');
			root.setAttributeNS(XMLNS_URI, 'xmlns:foo', '');
			expect(serialize(root)).toBe('<root xmlns="" xmlns:foo=""/>');
		},
	);
	context.test(
		'Attribute nodes are serialized as the empty string',
		({ document, DOMParser, XMLSerializer }) => {
			const parse = (xmlString: string) =>
				new DOMParser().parseFromString(xmlString, 'text/xml').documentElement;
			const serialize = (node: Node) => new XMLSerializer().serializeToString(node);

			expect(serialize(document.createAttribute('foobar'))).toBe('');
		},
	);
}
