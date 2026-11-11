import { asciiUppercase, asciiLowercase } from './ascii.ts';

/**
 * Container type for valid names of createElement()
 */
export interface Elements {
	document: Element;
}

export class Document {
	readonly documentElement: Element;
	readonly notify: () => void;

	constructor(notify: () => void) {
		this.notify = notify;
		this.documentElement = new Element(this, 'document', notify);
	}

	createElement(tagName: keyof Elements): Element {
		if (arguments.length === 0) {
			// oxlint-disable-next-line bombshell-dev/no-generic-error -- Web IDL requires TypeError for missing arguments.
			throw new TypeError('createElement requires a tag name');
		}
		if (
			!/^(?:[A-Za-z][^\0\t\n\f\r\u0020/>]*|[:_\u0080-\u{10FFFF}][A-Za-z0-9_.:\-\u0080-\u{10FFFF}]*)$/u.test(
				tagName,
			)
		) {
			throw new DOMException('Invalid element name', 'InvalidCharacterError');
		}
		return new Element(this, asciiLowercase(String(tagName)), this.notify);
	}

	createTextNode(data: string): Text {
		return new Text(this, String(data), this.notify);
	}

	createComment(data: string): Text {
		return new Comment(this, String(data), this.notify);
	}
}

export abstract class Node {
	static readonly ELEMENT_NODE = 1;
	static readonly ATTRIBUTE_NODE = 2;
	static readonly TEXT_NODE = 3;
	static readonly COMMENT_NODE = 8;

	readonly childNodes: Node[];
	readonly ownerDocument: Document;

	abstract readonly nodeType: number;
	abstract readonly nodeName: string;

	protected readonly notify: () => void;

	constructor(owner: Document, notify: Node['notify']) {
		this.notify = notify;
		this.childNodes = [];
		this.ownerDocument = owner;
	}

	hasChildNodes(): boolean {
		return this.childNodes.length > 0;
	}

	get firstChild(): Node | null {
		return this.childNodes[0] ?? null;
	}

	get lastChild(): Node | null {
		return this.childNodes[this.childNodes.length - 1] ?? null;
	}

	appendChild(node: Node): Node {
		this.childNodes.push(node);
		this.notify();
		return node;
	}

	get nodeValue(): string | null {
		return null;
	}
}

export class Element extends Node {
	readonly localName: string;
	readonly nodeName: string;

	constructor(owner: Document, localName: string, notify: Node['notify']) {
		super(owner, notify);
		this.localName = localName;
		this.nodeName = asciiUppercase(String(localName));
	}

	get nodeType(): number {
		return Node.ELEMENT_NODE;
	}

	get tagName(): string {
		return this.nodeName;
	}

	get children(): Element[] {
		return this.childNodes.filter((node) => node instanceof Element);
	}
	get prefix(): null {
		return null;
	}
	get namespaceURI(): string {
		return 'http://www.w3.org/1999/xhtml';
	}
}

export abstract class CharacterData extends Node {
	#data: string;
	constructor(owner: Document, data: string, notify: Node['notify']) {
		super(owner, notify);
		this.#data = data;
	}

	get data(): string {
		return this.#data;
	}

	set data(data: string) {
		const normal = data === null ? '' : String(data);
		if (normal !== this.data) {
			this.#data = normal;
			this.notify();
		}
	}

	override get nodeValue(): string {
		return this.data;
	}

	override set nodeValue(value: string | null) {
		this.data = value ?? '';
	}

	get textContent(): string {
		return this.data;
	}

	set textContent(value: string | null) {
		this.data = value ?? '';
	}

	get length(): number {
		return this.data.length;
	}
}

export class Text extends CharacterData {
	get nodeType(): number {
		return Node.TEXT_NODE;
	}

	get nodeName(): string {
		return '#text';
	}
}

export class Comment extends CharacterData {
	get nodeType(): number {
		return Node.COMMENT_NODE;
	}

	get nodeName(): string {
		return '#comment';
	}
}
