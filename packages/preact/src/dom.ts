/**
 * Minimal DOM implementation, trimmed to the exact surface of Preact 11
 */

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const DOCUMENT_NODE = 9;

type Attr = { name: string; value: string };

interface Style {
	cssText?: string;
	setProperty(property: string, value: string): void;
	[key: string]: string | ((property: string, value: string) => void) | undefined;
}

function createStyle(): Style {
	const style: Style = {
		setProperty(property, value) {
			style[property] = value;
		},
	};
	return style;
}

export class Node {
	nodeType: number;
	childNodes: Node[] = [];
	parentNode: Node | null = null;
	ownerDocument: Document | null = null;

	constructor(nodeType: number) {
		this.nodeType = nodeType;
	}

	get firstChild(): Node | null {
		return this.childNodes[0] ?? null;
	}

	get nextSibling(): Node | null {
		const parent = this.parentNode;
		if (!parent) return null;
		const index = parent.childNodes.indexOf(this);
		return index === -1 ? null : (parent.childNodes[index + 1] ?? null);
	}

	insertBefore(child: Node, ref?: Node | null): Node {
		child.remove();
		child.parentNode = this;
		if (ref == null) {
			this.childNodes.push(child);
		} else {
			const index = this.childNodes.indexOf(ref);
			this.childNodes.splice(index === -1 ? this.childNodes.length : index, 0, child);
		}
		return child;
	}

	removeChild(child: Node): Node {
		const index = this.childNodes.indexOf(child);
		if (index !== -1) this.childNodes.splice(index, 1);
		child.parentNode = null;
		return child;
	}

	remove(): void {
		this.parentNode?.removeChild(this);
	}
}

export class Text extends Node {
	data: string;

	constructor(data: string) {
		super(TEXT_NODE);
		this.data = data;
	}
}

export class Element extends Node {
	localName: string;
	namespaceURI: string | null;
	attributes: Attr[] = [];
	style: Style = createStyle();

	constructor(localName: string, namespaceURI: string | null = null) {
		super(ELEMENT_NODE);
		this.localName = localName;
		this.namespaceURI = namespaceURI;
	}

	setAttribute(name: string, value: unknown): void {
		const attr = this.attributes.find((a) => a.name === name);
		if (attr) attr.value = String(value);
		else this.attributes.push({ name, value: String(value) });
	}

	removeAttribute(name: string): void {
		const index = this.attributes.findIndex((a) => a.name === name);
		if (index !== -1) this.attributes.splice(index, 1);
	}
}

export class Document extends Element {
	documentElement: Element;
	body: Element;

	constructor() {
		super('#document');
		this.nodeType = DOCUMENT_NODE;

		this.documentElement = this.createElementNS(XHTML_NAMESPACE, 'html');
		this.insertBefore(this.documentElement);

		this.body = this.createElementNS(XHTML_NAMESPACE, 'body');
		this.documentElement.insertBefore(this.body);
	}

	createElementNS(namespaceURI: string | null, localName: string): Element {
		const element = new Element(localName, namespaceURI);
		element.ownerDocument = this;
		return element;
	}

	createTextNode(data: string): Text {
		const text = new Text(data);
		text.ownerDocument = this;
		return text;
	}
}

/** Create a fresh, minimally-viable document. */
export function createDocument(): Document {
	return new Document();
}
