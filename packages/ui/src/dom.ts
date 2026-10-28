import { StyleDeclaration } from './style.ts';

/**
 * Container type for valid names of createElement()
 */
export interface Elements {
	document: Element;
	div: Element;
	span: Element;
}

export class Document {
	readonly documentElement: Element;
	readonly notify: () => void;

	constructor(notify: () => void) {
		this.notify = notify;
		this.documentElement = new Element('document', notify);
	}

	createElement(tagName: keyof Elements) {
		return new Element(tagName, this.notify);
	}

	createTextNode(data: string): Text {
		return new Text(data, this.notify);
	}
}

export class Node {
	readonly nodeName: string;
	readonly childNodes: Node[];

	protected readonly notify: () => void;

	constructor(nodeName: string, notify: Node['notify']) {
		this.notify = notify;
		this.nodeName = nodeName;
		this.childNodes = [];
	}

	appendChild(node: Node): Node {
		this.childNodes.push(node);
		this.notify();
		return node;
	}
}

export class Element extends Node {
	readonly tagName: string;
	readonly style: StyleDeclaration;

	constructor(tagName: keyof Elements, notify: Node['notify']) {
		super(tagName.toUpperCase(), notify);
		this.tagName = tagName;
		this.style = new StyleDeclaration(this.notify);
	}

	get children(): Element[] {
		return this.childNodes.filter((node) => node instanceof Element);
	}
}

export class Text extends Node {
	#data: string;
	constructor(data: string, notify: Node['notify']) {
		super('#text', notify);
		this.#data = data;
	}

	get data() {
		return this.#data;
	}

	set data(data: string) {
		if (data !== this.data) {
			this.#data = data;
			this.notify();
		}
	}
}
