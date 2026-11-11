import type { CompatibilityContext } from '../../../shared/context.ts';
import type { DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		function assertEqualNode(fixture: DOMFixture, nodeA: Node, nodeB: Node) {
			expect(nodeB.nodeType, 'nodeType').toBe(nodeA.nodeType);
			expect(nodeB.nodeName, 'nodeName').toBe(nodeA.nodeName);

			if (nodeA.nodeType === 1) {
				const elementA = nodeA as Element;
				const elementB = nodeB as Element;
				expect(elementB.prefix, 'prefix').toBe(elementA.prefix);
				expect(elementB.namespaceURI, 'namespaceURI').toBe(elementA.namespaceURI);
				expect(elementB.localName, 'localName').toBe(elementA.localName);
				expect(elementB.tagName, 'tagName').toBe(elementA.tagName);
				expect(elementB.attributes != elementA.attributes).not.toBe('attributes');
				expect(elementB.attributes.length, 'attributes.length').toBe(elementA.attributes.length);
				for (let i = 0, il = elementA.attributes.length; i < il; ++i) {
					expect(elementB.attributes[i], 'attributes[' + i + ']').not.toBe(elementA.attributes[i]);
					expect(elementB.attributes[i]!.name, 'attributes[' + i + '].name').toBe(
						elementA.attributes[i]!.name,
					);
					expect(elementB.attributes[i]!.prefix, 'attributes[' + i + '].prefix').toBe(
						elementA.attributes[i]!.prefix,
					);
					expect(elementB.attributes[i]!.namespaceURI, 'attributes[' + i + '].namespaceURI').toBe(
						elementA.attributes[i]!.namespaceURI,
					);
					expect(elementB.attributes[i]!.value, 'attributes[' + i + '].value').toBe(
						elementA.attributes[i]!.value,
					);
				}
			}
		}

		function checkCopy(fixture: DOMFixture, orig: Node, copy: Node, type: unknown) {
			expect(orig, 'Object equality').not.toBe(copy);
			assertEqualNode(fixture, orig, copy);
			expect(orig, 'original instanceof ' + String(type)).toBeInstanceOf(type);
			expect(copy, 'copy instanceof ' + String(type)).toBeInstanceOf(type);
		}

		for (const [localName, typeName] of [
			['a', 'HTMLAnchorElement'],
			['abbr', 'HTMLElement'],
			['acronym', 'HTMLElement'],
			['address', 'HTMLElement'],
			['area', 'HTMLAreaElement'],
			['article', 'HTMLElement'],
			['aside', 'HTMLElement'],
			['audio', 'HTMLAudioElement'],
			['b', 'HTMLElement'],
			['base', 'HTMLBaseElement'],
			['bdi', 'HTMLElement'],
			['bdo', 'HTMLElement'],
			['bgsound', 'HTMLElement'],
			['big', 'HTMLElement'],
			['blockquote', 'HTMLElement'],
			['body', 'HTMLBodyElement'],
			['br', 'HTMLBRElement'],
			['button', 'HTMLButtonElement'],
			['canvas', 'HTMLCanvasElement'],
			['caption', 'HTMLTableCaptionElement'],
			['center', 'HTMLElement'],
			['cite', 'HTMLElement'],
			['code', 'HTMLElement'],
			['col', 'HTMLTableColElement'],
			['colgroup', 'HTMLTableColElement'],
			['data', 'HTMLDataElement'],
			['datalist', 'HTMLDataListElement'],
			['dialog', 'HTMLDialogElement'],
			['dd', 'HTMLElement'],
			['del', 'HTMLModElement'],
			['details', 'HTMLElement'],
			['dfn', 'HTMLElement'],
			['dir', 'HTMLDirectoryElement'],
			['div', 'HTMLDivElement'],
			['dl', 'HTMLDListElement'],
			['dt', 'HTMLElement'],
			['embed', 'HTMLEmbedElement'],
			['fieldset', 'HTMLFieldSetElement'],
			['figcaption', 'HTMLElement'],
			['figure', 'HTMLElement'],
			['font', 'HTMLFontElement'],
			['footer', 'HTMLElement'],
			['form', 'HTMLFormElement'],
			['frame', 'HTMLFrameElement'],
			['frameset', 'HTMLFrameSetElement'],
			['h1', 'HTMLHeadingElement'],
			['h2', 'HTMLHeadingElement'],
			['h3', 'HTMLHeadingElement'],
			['h4', 'HTMLHeadingElement'],
			['h5', 'HTMLHeadingElement'],
			['h6', 'HTMLHeadingElement'],
			['head', 'HTMLHeadElement'],
			['header', 'HTMLElement'],
			['hgroup', 'HTMLElement'],
			['hr', 'HTMLHRElement'],
			['html', 'HTMLHtmlElement'],
			['i', 'HTMLElement'],
			['iframe', 'HTMLIFrameElement'],
			['img', 'HTMLImageElement'],
			['input', 'HTMLInputElement'],
			['ins', 'HTMLModElement'],
			['isindex', 'HTMLElement'],
			['kbd', 'HTMLElement'],
			['label', 'HTMLLabelElement'],
			['legend', 'HTMLLegendElement'],
			['li', 'HTMLLIElement'],
			['link', 'HTMLLinkElement'],
			['main', 'HTMLElement'],
			['map', 'HTMLMapElement'],
			['mark', 'HTMLElement'],
			['marquee', 'HTMLElement'],
			['meta', 'HTMLMetaElement'],
			['meter', 'HTMLMeterElement'],
			['nav', 'HTMLElement'],
			['nobr', 'HTMLElement'],
			['noframes', 'HTMLElement'],
			['noscript', 'HTMLElement'],
			['object', 'HTMLObjectElement'],
			['ol', 'HTMLOListElement'],
			['optgroup', 'HTMLOptGroupElement'],
			['option', 'HTMLOptionElement'],
			['output', 'HTMLOutputElement'],
			['p', 'HTMLParagraphElement'],
			['param', 'HTMLParamElement'],
			['pre', 'HTMLPreElement'],
			['progress', 'HTMLProgressElement'],
			['q', 'HTMLQuoteElement'],
			['rp', 'HTMLElement'],
			['rt', 'HTMLElement'],
			['ruby', 'HTMLElement'],
			['s', 'HTMLElement'],
			['samp', 'HTMLElement'],
			['script', 'HTMLScriptElement'],
			['section', 'HTMLElement'],
			['small', 'HTMLElement'],
			['source', 'HTMLSourceElement'],
			['spacer', 'HTMLElement'],
			['span', 'HTMLSpanElement'],
			['strike', 'HTMLElement'],
			['style', 'HTMLStyleElement'],
			['sub', 'HTMLElement'],
			['summary', 'HTMLElement'],
			['sup', 'HTMLElement'],
			['table', 'HTMLTableElement'],
			['tbody', 'HTMLTableSectionElement'],
			['td', 'HTMLTableCellElement'],
			['template', 'HTMLTemplateElement'],
			['textarea', 'HTMLTextAreaElement'],
			['th', 'HTMLTableCellElement'],
			['time', 'HTMLTimeElement'],
			['title', 'HTMLTitleElement'],
			['tr', 'HTMLTableRowElement'],
			['tt', 'HTMLElement'],
			['track', 'HTMLTrackElement'],
			['u', 'HTMLElement'],
			['ul', 'HTMLUListElement'],
			['var', 'HTMLElement'],
			['video', 'HTMLVideoElement'],
			['unknown', 'HTMLUnknownElement'],
			['wbr', 'HTMLElement'],
		] as const) {
			context.test('createElement(' + localName + ')', (fixture) => {
				const { document } = fixture;
				const type = fixture[typeName];
				expect(type !== undefined, typeName + ' is not supported').toBe(true);
				const element = document.createElement(localName);
				const copy = element.cloneNode();
				checkCopy(fixture, element, copy, type);
			});
		}
		context.test('createDocumentFragment', (fixture) => {
			const { document, DocumentFragment } = fixture;

			let fragment = document.createDocumentFragment();
			let copy = fragment.cloneNode() as typeof fragment;
			checkCopy(fixture, fragment, copy, DocumentFragment);
		});
		context.test('createTextNode', (fixture) => {
			const { document, Text } = fixture;

			let text = document.createTextNode('hello world');
			let copy = text.cloneNode() as typeof text;
			checkCopy(fixture, text, copy, Text);
			expect(text.data).toBe(copy.data);
			expect(text.wholeText).toBe(copy.wholeText);
		});
		context.test('createComment', (fixture) => {
			const { document, Comment } = fixture;

			let comment = document.createComment('a comment');
			let copy = comment.cloneNode() as typeof comment;
			checkCopy(fixture, comment, copy, Comment);
			expect(comment.data).toBe(copy.data);
		});
		context.test('createElement with attributes', (fixture) => {
			const { document, Element } = fixture;

			let el = document.createElement('foo');
			el.setAttribute('a', 'b');
			el.setAttribute('c', 'd');
			let c = el.cloneNode() as typeof el;
			checkCopy(fixture, el, c, Element);
		});
		context.test('createElementNS HTML', (fixture) => {
			const { document, HTMLDivElement } = fixture;

			let el = document.createElementNS('http://www.w3.org/1999/xhtml', 'foo:div');
			let c = el.cloneNode() as typeof el;
			checkCopy(fixture, el, c, HTMLDivElement);
		});
		context.test('createElementNS non-HTML', (fixture) => {
			const { document, Element } = fixture;

			let el = document.createElementNS('http://www.example.com/', 'foo:div');
			let c = el.cloneNode() as typeof el;
			checkCopy(fixture, el, c, Element);
		});
		context.test('createProcessingInstruction', (fixture) => {
			const { document, ProcessingInstruction } = fixture;

			let pi = document.createProcessingInstruction('target', 'data');
			let copy = pi.cloneNode() as typeof pi;
			checkCopy(fixture, pi, copy, ProcessingInstruction);
			expect(pi.data, 'data').toBe(copy.data);
			expect(pi.target, 'target').toBe(pi.target);
		});
		context.test('createAttribute', (fixture) => {
			const { document, Attr } = fixture;

			let attr = document.createAttribute('class');
			let copy = attr.cloneNode() as typeof attr;
			checkCopy(fixture, attr, copy, Attr);
			expect(attr.namespaceURI).toBe(copy.namespaceURI);
			expect(attr.prefix).toBe(copy.prefix);
			expect(attr.localName).toBe(copy.localName);
			expect(attr.value).toBe(copy.value);

			attr.value = 'abc';
			expect(attr.namespaceURI).toBe(copy.namespaceURI);
			expect(attr.prefix).toBe(copy.prefix);
			expect(attr.localName).toBe(copy.localName);
			expect(attr.value).not.toBe(copy.value);

			let copy2 = attr.cloneNode() as typeof attr;
			checkCopy(fixture, attr, copy2, Attr);
			expect(attr.namespaceURI).toBe(copy.namespaceURI);
			expect(attr.prefix).toBe(copy.prefix);
			expect(attr.localName).toBe(copy2.localName);
			expect(attr.value).toBe(copy2.value);
		});
		context.test('createAttributeNS', (fixture) => {
			const { document, Attr } = fixture;

			let attr = document.createAttributeNS('http://www.w3.org/1999/xhtml', 'foo:class');
			let copy = attr.cloneNode() as typeof attr;
			checkCopy(fixture, attr, copy, Attr);
			expect(attr.namespaceURI).toBe(copy.namespaceURI);
			expect(attr.prefix).toBe(copy.prefix);
			expect(attr.localName).toBe(copy.localName);
			expect(attr.value).toBe(copy.value);

			attr.value = 'abc';
			expect(attr.namespaceURI).toBe(copy.namespaceURI);
			expect(attr.prefix).toBe(copy.prefix);
			expect(attr.localName).toBe(copy.localName);
			expect(attr.value).not.toBe(copy.value);

			let copy2 = attr.cloneNode() as typeof attr;
			checkCopy(fixture, attr, copy2, Attr);
			expect(attr.namespaceURI).toBe(copy.namespaceURI);
			expect(attr.prefix).toBe(copy.prefix);
			expect(attr.localName).toBe(copy2.localName);
			expect(attr.value).toBe(copy2.value);
		});
		context.test('implementation.createDocumentType', (fixture) => {
			const { document, DocumentType } = fixture;

			let doctype = document.implementation.createDocumentType('html', 'public', 'system');
			let copy = doctype.cloneNode() as typeof doctype;
			checkCopy(fixture, doctype, copy, DocumentType);
			expect(doctype.name, 'name').toBe(copy.name);
			expect(doctype.publicId, 'publicId').toBe(copy.publicId);
			expect(doctype.systemId, 'systemId').toBe(copy.systemId);
		});
		context.test('implementation.createDocument', (fixture) => {
			const { document, Document } = fixture;

			let doc = document.implementation.createDocument(null, null as unknown as string);
			let copy = doc.cloneNode() as typeof doc;
			checkCopy(fixture, doc, copy, Document);
			expect(doc.charset, 'charset value').toBe('UTF-8');
			expect(doc.charset, 'charset equality').toBe(copy.charset);
			expect(doc.contentType, 'contentType value').toBe('application/xml');
			expect(doc.contentType, 'contentType equality').toBe(copy.contentType);
			expect(doc.URL, 'URL value').toBe('about:blank');
			expect(doc.URL, 'URL equality').toBe(copy.URL);
			expect(doc.compatMode, 'compatMode value').toBe('CSS1Compat');
			expect(doc.compatMode, 'compatMode equality').toBe(copy.compatMode);
		});
		context.test('implementation.createHTMLDocument', (fixture) => {
			const { document, Document } = fixture;

			let html = document.implementation.createHTMLDocument('title');
			let copy = html.cloneNode() as typeof html;
			checkCopy(fixture, html, copy, Document);
			expect(copy.title, 'title value').toBe('');
		});
		context.test('node with children', (fixture) => {
			const { document, HTMLDivElement } = fixture;

			let parent = document.createElement('div');
			let child1 = document.createElement('div');
			let child2 = document.createElement('div');
			let grandChild = document.createElement('div');

			child2.appendChild(grandChild);
			parent.appendChild(child1);
			parent.appendChild(child2);

			let deep = true;
			let copy = parent.cloneNode(deep) as typeof parent;

			checkCopy(fixture, parent, copy, HTMLDivElement);
			expect(copy.childNodes.length, 'copy.childNodes.length with deep copy').toBe(2);

			checkCopy(fixture, child1, copy.childNodes[0]!, HTMLDivElement);
			expect(copy.childNodes[0]!.childNodes.length, 'copy.childNodes[0]!.childNodes.length').toBe(
				0,
			);

			checkCopy(fixture, child2, copy.childNodes[1]!, HTMLDivElement);
			expect(copy.childNodes[1]!.childNodes.length, 'copy.childNodes[1]!.childNodes.length').toBe(
				1,
			);
			checkCopy(fixture, grandChild, copy.childNodes[1]!.childNodes[0]!, HTMLDivElement);

			deep = false;
			copy = parent.cloneNode(deep) as typeof parent;

			checkCopy(fixture, parent, copy, HTMLDivElement);
			expect(copy.childNodes.length, 'copy.childNodes.length with non-deep copy').toBe(0);
		});
		context.test('Node with custom prototype', ({ document, HTMLElement, HTMLUnknownElement }) => {
			const proto = Object.create(HTMLElement.prototype),
				node = document.createElement('hi');
			Object.setPrototypeOf(node, proto);
			expect(proto.isPrototypeOf(node)).toBe(true);
			const clone = node.cloneNode() as typeof node;
			expect(proto.isPrototypeOf(clone)).toBe(false);
			expect(HTMLUnknownElement.prototype.isPrototypeOf(clone)).toBe(true);
			const deepClone = node.cloneNode(true) as typeof node;
			expect(proto.isPrototypeOf(deepClone)).toBe(false);
			expect(HTMLUnknownElement.prototype.isPrototypeOf(deepClone)).toBe(true);
		});
	}

	{
		const { expect } = context.runner;
		function assertEqualNode(nodeA: Node, nodeB: Node) {
			expect(nodeB.nodeType, 'nodeType').toBe(nodeA.nodeType);
			expect(nodeB.nodeName, 'nodeName').toBe(nodeA.nodeName);

			if (nodeA.nodeType === 1) {
				const elementA = nodeA as Element;
				const elementB = nodeB as Element;
				expect(elementB.prefix, 'prefix').toBe(elementA.prefix);
				expect(elementB.namespaceURI, 'namespaceURI').toBe(elementA.namespaceURI);
				expect(elementB.localName, 'localName').toBe(elementA.localName);
				expect(elementB.tagName, 'tagName').toBe(elementA.tagName);
				expect(elementB.attributes != elementA.attributes).not.toBe('attributes');
				expect(elementB.attributes.length, 'attributes.length').toBe(elementA.attributes.length);
				for (let i = 0, il = elementA.attributes.length; i < il; ++i) {
					expect(elementB.attributes[i], 'attributes[' + i + ']').not.toBe(elementA.attributes[i]);
					expect(elementB.attributes[i]!.name, 'attributes[' + i + '].name').toBe(
						elementA.attributes[i]!.name,
					);
					expect(elementB.attributes[i]!.prefix, 'attributes[' + i + '].prefix').toBe(
						elementA.attributes[i]!.prefix,
					);
					expect(elementB.attributes[i]!.namespaceURI, 'attributes[' + i + '].namespaceURI').toBe(
						elementA.attributes[i]!.namespaceURI,
					);
					expect(elementB.attributes[i]!.value, 'attributes[' + i + '].value').toBe(
						elementA.attributes[i]!.value,
					);
				}
			}
		}

		function checkCopy(orig: Node, copy: Node, type: unknown) {
			expect(orig, 'Object equality').not.toBe(copy);
			assertEqualNode(orig, copy);
			expect(orig, 'original instanceof ' + String(type)).toBeInstanceOf(type);
			expect(copy, 'copy instanceof ' + String(type)).toBeInstanceOf(type);
		}

		context.test('createElement(select)', ({ document, HTMLSelectElement: type }) => {
			expect(type !== undefined, 'HTMLSelectElement is not supported').toBe(true);
			const element = document.createElement('select');
			const copy = element.cloneNode();
			checkCopy(element, copy, type);
		});
	}
}
