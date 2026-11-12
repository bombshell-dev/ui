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

	createProcessingInstruction(target: string, data: string): ProcessingInstruction {
		return new ProcessingInstruction(this, target, data, this.notify);
	}
}

export abstract class Node {
	static readonly ELEMENT_NODE = 1;
	static readonly ATTRIBUTE_NODE = 2;
	static readonly TEXT_NODE = 3;
	static readonly PROCESSING_INSTRUCTION_NODE = 7;
	static readonly COMMENT_NODE = 8;

	readonly #childNodes: Node[] = [];
	readonly ownerDocument: Document;

	abstract readonly nodeType: number;
	abstract readonly nodeName: string;

	protected readonly notify: () => void;

	#parentNode: Node | null = null;

	constructor(owner: Document, notify: Node['notify']) {
		this.notify = notify;
		this.ownerDocument = owner;
	}

	hasChildNodes(): boolean {
		return this.#childNodes.length > 0;
	}

	get parentNode(): Node | null {
		return this.#parentNode;
	}

	get parentElement(): Element | null {
		return this.#parentNode instanceof Element ? this.#parentNode : null;
	}

	get childNodes(): ReadonlyArray<Node> {
		return this.#childNodes;
	}

	get firstChild(): Node | null {
		return this.#childNodes[0] ?? null;
	}

	get lastChild(): Node | null {
		return this.#childNodes[this.childNodes.length - 1] ?? null;
	}

	get nodeValue(): string | null {
		return null;
	}

	appendChild(node: Node): Node {
		return this.insertBefore(node, null);
	}

	removeChild(node: Node): Node {
		const currentIndex = this.childNodes.indexOf(node);
		if (currentIndex < 0) {
			throw new DOMException(
				`cannot remove ${node.nodeName} from ${this.nodeName}. It is not a child`,
				'NotFoundError',
			);
		}

		this.#childNodes.splice(currentIndex, 1);
		node.#parentNode = null;

		this.notify();
		return node;
	}

	remove(): void {
		this.parentNode?.removeChild(this);
	}

	insertBefore(node: Node, anchor: Node | null): Node {
		// oxlint-disable-next-line typescript/no-this-alias -- This cursor walks the insertion parent's ancestry.
		for (let current: Node | null = this; current; current = current.parentNode) {
			if (current === node) {
				throw new DOMException(
					'cannot add an ancestor Node to its descendant',
					'HierarchyRequestError',
				);
			}
		}

		if (anchor && anchor.parentNode !== this) {
			throw new DOMException('Anchor is not a child of this node', 'NotFoundError');
		}

		if (node === this) {
			throw new DOMException('cannot make a Node a child of itself', 'HierarchyRequestError');
		}

		if (node === anchor) {
			return node;
		}
		if (node.parentNode) {
			if (node.parentNode === this) {
				const currentIndex = this.childNodes.indexOf(node);
				this.#childNodes.splice(currentIndex, 1);
			} else {
				node.parentNode.removeChild(node);
			}
		}
		const anchorIndex = anchor ? this.childNodes.indexOf(anchor) : this.childNodes.length;
		this.#childNodes.splice(anchorIndex, 0, node);

		node.#parentNode = this;
		this.notify();

		return node;
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

export class ProcessingInstruction extends CharacterData {
	readonly target: string;

	constructor(owner: Document, target: string, data: string, notify: Node['notify']) {
		super(owner, data, notify);
		this.target = target;
	}

	get nodeType(): number {
		return Node.PROCESSING_INSTRUCTION_NODE;
	}

	get nodeName(): string {
		return this.target;
	}
}
