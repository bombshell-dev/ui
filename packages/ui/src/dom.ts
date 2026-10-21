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

export interface EventListener<Target extends EventTarget = EventTarget> {
	(this: Target, event: Event): void;
}

export const EventTarget = globalThis.EventTarget;
export type EventTarget = globalThis.EventTarget;

export abstract class Node<Owner extends Document | null = Document | null> extends EventTarget {
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
			throw new DOMException('Anchor is not a child of this node', 'NotFoundError');
		}

		if (node === this) {
			throw new DOMException('cannot make a Node a child of itself', 'HierarchyRequestError');
		}

		if (ancestorOf(this, node)) {
			throw new DOMException(
				'cannot add an ancestor Node to its descendant',
				'HierarchyRequestError',
			);
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
			throw new DOMException(
				`cannot remove ${node.nodeName} from ${this.nodeName}. It is not a child`,
				'NotFoundError',
			);
		}

		this.#children.splice(currentIndex, 1);
		node.parentNode = null;

		this.notify();
		return node;
	}

	override dispatchEvent(event: Event): boolean {
		if (event.eventPhase !== Event.NONE) {
			throw new DOMException('Cannot redispatch an active event', 'InvalidStateError');
		}

		const path: Node[] = [this];
		for (let current = this.parentNode; current; current = current.parentNode) {
			path.push(current);
		}

		// Native dispatch retargets on each node. Keep the tree's original target
		// and expose its current node and phase while each native dispatch runs.
		Object.defineProperty(event, 'target', { configurable: true, value: this });
		const originals = Object.getOwnPropertyDescriptors(event);

		try {
			Object.defineProperty(event, 'composedPath', {
				value: () => [...path],
				configurable: true,
			});
			const end = event.bubbles ? path.length : 1;
			for (let i = 0; i < end; i++) {
				Object.defineProperties(event, {
					currentTarget: { value: path[i], configurable: true },
					eventPhase: {
						value: i === 0 ? Event.AT_TARGET : Event.BUBBLING_PHASE,
						configurable: true,
					},
				});
				super.dispatchEvent.call(path[i], event);
				if (event.cancelBubble) {
					break;
				}
			}
			return !event.defaultPrevented;
		} finally {
			for (const name of ['currentTarget', 'eventPhase', 'composedPath']) {
				const original = originals[name];
				if (original) {
					Object.defineProperty(event, name, original);
				} else {
					Reflect.deleteProperty(event, name);
				}
			}
		}
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
			throw new DOMException('only HTML namespace is supported', 'NotSupportedError');
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

export interface EventOptions {
	bubbles?: boolean;
	cancelable?: boolean;
	composed?: boolean;
}

// Node exposes these constants at runtime, but its type declarations omit them.
export const Event = globalThis.Event as typeof globalThis.Event & {
	readonly NONE: 0;
	readonly CAPTURING_PHASE: 1;
	readonly AT_TARGET: 2;
	readonly BUBBLING_PHASE: 3;
};
export type Event = globalThis.Event;

function ancestorOf(node: Node, candidate: Node) {
	for (let current: Node | null = node; current; current = current.parentNode) {
		if (current.parentNode === candidate) {
			return true;
		}
	}
	return false;
}
