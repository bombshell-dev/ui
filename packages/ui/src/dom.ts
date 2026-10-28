/**
 * Container type for valid names of createElement()
 */
export interface Elements {
	document: Element;
}

export const ELEMENT_NODE = 1;
export const ATTRIBUTE_NODE = 2;
export const TEXT_NODE = 3;
export const DOCUMENT_NODE = 9;

export type NodeType =
	| typeof ELEMENT_NODE
	| typeof ATTRIBUTE_NODE
	| typeof TEXT_NODE
	| typeof DOCUMENT_NODE;

interface DefaultEventMap {}

type TypedListener<E extends Event> = ((ev: E) => void) | { handleEvent(object: E): void };

interface ListenerOptions {
	once?: boolean;
	passive?: boolean;
	signal?: AbortSignal;
}

const NONE = 0;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

class TypedEventTarget<T extends Record<keyof T, Event>> extends EventTarget {
	override addEventListener<K extends keyof T & string>(
		type: K,
		callback: TypedListener<T[K]>,
		options?: ListenerOptions,
	): void;
	override addEventListener(
		type: string,
		callback: TypedListener<Event>,
		options?: ListenerOptions,
	): void {
		super.addEventListener(type, callback, options);
	}

	override removeEventListener<K extends keyof T & string>(
		type: K,
		callback: TypedListener<T[K]>,
	): void;
	override removeEventListener(type: string, callback: TypedListener<Event>): void {
		super.removeEventListener(type, callback);
	}
}

export abstract class Node<
	Owner extends Document | null = Document | null,
> extends TypedEventTarget<DefaultEventMap> {
	parentNode: Node | null;
	readonly ownerDocument: Owner;
	readonly nodeName: string;
	abstract readonly nodeType: NodeType;

	readonly #children: Node[] = [];

	constructor(nodeName: string, owner: Owner) {
		super();
		this.nodeName = nodeName;
		this.ownerDocument = owner;
		this.parentNode = null;
	}

	get namespaceURI() {
		return 'http://www.w3.org/1999/xhtml';
	}

	get isConnected(): boolean {
		return this.parentNode ? this.parentNode.isConnected : false;
	}

	get childNodes(): ReadonlyArray<Node> {
		return this.#children;
	}

	get firstChild(): Node | null {
		return this.#children[0] ?? null;
	}

	get nextSibling(): Node | null {
		if (this.parentNode) {
			const index = this.parentNode.childNodes.indexOf(this);
			return this.parentNode.childNodes[index + 1] ?? null;
		}
		return null;
	}

	remove() {
		this.parentNode?.removeChild(this);
		return this;
	}

	insertBefore(node: Node, anchor: Node | null): Node {
		if (anchor && anchor.parentNode !== this) {
			throw new NotFoundError('Anchor is not a child of this node');
		}

		if (node === this) {
			throw new HierarchyRequestError(`cannot make a Node a child of itself`);
		}

		if (ancestorOf(this, node)) {
			throw new HierarchyRequestError(`cannot add an ancestor Node to its descendant`);
		}
		if (node === anchor) {
			return node;
		}
		if (node.parentNode) {
			if (node.parentNode === this) {
				const currentIndex = this.#children.indexOf(node);
				this.#children.splice(currentIndex, 1);
			} else {
				node.parentNode.removeChild(node);
			}
		}
		const anchorIndex = anchor ? this.#children.indexOf(anchor) : this.#children.length;
		this.#children.splice(anchorIndex, 0, node);

		node.parentNode = this;
		this.notify();

		return node;
	}

	appendChild(node: Node): Node {
		return this.insertBefore(node, null);
	}

	removeChild(node: Node): Node {
		const currentIndex = this.#children.indexOf(node);
		if (currentIndex < 0) {
			throw new NotFoundError(
				`cannot remove ${node.nodeName} from ${this.nodeName}. It is not a child`,
			);
		}

		this.#children.splice(currentIndex, 1);
		node.parentNode = null;

		this.notify();
		return node;
	}

	override dispatchEvent(event: Event): boolean {
		if (event.eventPhase !== NONE) {
			throw new InvalidStateError('cannot dispatch an event that is already dispatching');
		}

		const path: Node[] = [];
		for (let current: Node | null = this; current; current = current.parentNode) {
			path.push(current);
		}

		Object.defineProperties(event, {
			target: { value: this, configurable: true },
			composedPath: { value: () => [...path], configurable: true },
		});

		try {
			const end = event.bubbles ? path.length : 1;
			for (let i = 0; i < end && !event.cancelBubble; i++) {
				Object.defineProperties(event, {
					currentTarget: { value: path[i], configurable: true },
					eventPhase: { value: i === 0 ? AT_TARGET : BUBBLING_PHASE, configurable: true },
				});
				// To avoid triggering the bubbling phase again
				EventTarget.prototype.dispatchEvent.call(path[i], event);
			}
		} finally {
			Object.defineProperties(event, {
				currentTarget: { value: null, configurable: true },
				eventPhase: { value: NONE, configurable: true },
				composedPath: { value: () => [], configurable: true },
			});
		}

		return !event.defaultPrevented;
	}

	protected notify(): void {
		if (this.isConnected) {
			this.ownerDocument?.notify();
		}
	}
}

export class Document extends Node<null> {
	readonly documentElement: Element;
	override readonly notify: () => void;

	constructor(notify: () => void) {
		super('#document', null);
		this.documentElement = this.createElement('document');
		this.notify = () => {};
		this.appendChild(this.documentElement);
		this.notify = notify;
	}

	get nodeType(): NodeType {
		return DOCUMENT_NODE;
	}

	override get isConnected() {
		return true;
	}

	createElement<K extends keyof Elements>(tagName: K): Elements[K];
	createElement(tagName: string): Element;
	createElement(tagName: string): Element {
		return new Element(tagName, this);
	}

	createElementNS(namespace: string, tagName: string): Element {
		if (namespace !== 'http://www.w3.org/1999/xhtml') {
			throw new DOMException('only HTML namespace is supported');
		}
		return this.createElement(tagName);
	}

	createAttribute(name: string): Attr {
		return new Attr(name, this);
	}

	createTextNode(data: string): Text {
		return new Text(String(data), this);
	}
}

export class Element extends Node<Document> {
	readonly tagName: string;

	#attributes = new Map<string, Attr>();

	constructor(tagName: string, document: Document) {
		super(tagName.toUpperCase(), document);
		this.tagName = tagName;
	}

	get nodeType(): NodeType {
		return ELEMENT_NODE;
	}

	get localName(): string {
		return this.tagName;
	}

	get children(): Element[] {
		return this.childNodes.filter((node) => node instanceof Element);
	}

	get attributes(): Attr[] {
		return [...this.#attributes.values()];
	}

	setAttribute(name: string, value: string): void {
		let attr = this.#attributes.get(name);
		if (!attr) {
			attr = this.ownerDocument.createAttribute(name);
			attr.ownerElement = this;
			this.#attributes.set(name, attr);
		}
		if (value !== attr.value) {
			attr.value = value;
			this.notify();
		}
	}

	removeAttribute(name: string) {
		const attr = this.#attributes.get(name);
		if (attr) {
			this.#attributes.delete(name);
			attr.ownerElement = null;
			this.notify();
		}
	}
}

export class Text extends Node<Document> {
	#data: string;
	constructor(data: string, document: Document) {
		super('#text', document);
		this.#data = data;
	}

	get nodeType(): NodeType {
		return TEXT_NODE;
	}

	get data() {
		return this.#data;
	}

	set data(data: string) {
		const value = String(data);
		if (value !== this.data) {
			this.#data = value;
			this.notify();
		}
	}
}

export class Attr extends Node<Document> {
	readonly name: string;
	ownerElement: Element | null = null;
	#value = '';

	constructor(name: string, owner: Document) {
		super(name, owner);
		this.name = name;
	}

	get nodeType(): NodeType {
		return ATTRIBUTE_NODE;
	}

	get value(): string {
		return this.#value;
	}

	set value(value: string) {
		this.#value = String(value);
	}
}

export class DOMException extends Error {
	override name = 'DOMException';
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

export class HierarchyRequestError extends Error {
	override name = 'HierarchyRequestError';
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

export class NotFoundError extends Error {
	override name = 'NotFoundError';

	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

export class InvalidStateError extends Error {
	override name = 'InvalidStateError';

	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

function ancestorOf(node: Node, candidate: Node) {
	for (let current: Node | null = node; current; current = current.parentNode) {
		if (current.parentNode === candidate) {
			return true;
		}
	}
	return false;
}
