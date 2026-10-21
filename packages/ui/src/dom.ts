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

export interface EventListener<
	Type extends string = string,
	Target extends EventTarget = EventTarget,
> {
	(this: Target, event: Event<Type>): void;
}

export abstract class EventTarget {
	#registry = new Map<
		string,
		{
			capture: Map<EventListener, EventRegistration>;
			bubble: Map<EventListener, EventRegistration>;
		}
	>();

	// oxlint-disable-next-line bombshell-dev/max-params -- Matches the DOM EventTarget signature.
	addEventListener<Type extends string>(
		type: Type,
		listener: EventListener<Type, this>,
		capture = false,
	): void {
		let listeners = this.#registry.get(type);
		if (!listeners) {
			listeners = { capture: new Map(), bubble: new Map() };
			this.#registry.set(type, listeners);
		}
		const map = capture ? listeners.capture : listeners.bubble;
		const callback = listener as EventListener;
		if (!map.has(callback)) {
			map.set(callback, { listener: callback, removed: false });
		}
	}

	// oxlint-disable-next-line bombshell-dev/max-params -- Matches the DOM EventTarget signature.
	removeEventListener<Type extends string>(
		type: Type,
		listener: EventListener<Type, this>,
		capture?: boolean,
	): void {
		const listeners = this.#registry.get(type);
		const map = capture ? listeners?.capture : listeners?.bubble;

		if (map) {
			const callback = listener as EventListener;
			const registration = map.get(callback);
			if (registration) {
				registration.removed = true;
				map.delete(callback);
			}
		}
	}

	abstract dispatchEvent(event: Event): boolean;

	protected listenersFor(eventType: string, capture: boolean): EventRegistration[] {
		const listeners = this.#registry.get(eventType);
		if (!listeners) {
			return [];
		}
		const map = capture ? listeners.capture : listeners.bubble;
		return [...map.values()];
	}
}

interface EventRegistration {
	listener: EventListener;
	removed: boolean;
}

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

	dispatchEvent(event: Event): boolean {
		if (event.eventPhase !== Event.NONE) {
			throw new InvalidStateError('cannot dispatch an event that is already dispatching');
		}

		const path: Node[] = [];

		for (let current = this.parentNode; current; current = current.parentNode) {
			path.push(current);
		}

		Event.prepare({ event, target: this, currentTarget: null, phase: Event.NONE });

		const propagation = Event.currentPropagation(event);

		try {
			for (let i = path.length - 1; i >= 0; i--) {
				if (!propagation.ancestor) {
					return !event.defaultPrevented;
				}
				const currentTarget = path[i]!;
				const registrations = currentTarget.listenersFor(event.type, true);
				for (const registration of registrations) {
					if (registration.removed) {
						continue;
					}
					Event.prepare({ event, target: this, currentTarget, phase: Event.CAPTURING_PHASE });
					registration.listener.call(currentTarget, event);
					if (!propagation.immediate) {
						return !event.defaultPrevented;
					}
				}
			}

			if (!propagation.ancestor) {
				return !event.defaultPrevented;
			}

			const captures = [...this.listenersFor(event.type, true)];
			for (const registration of captures) {
				if (registration.removed) {
					continue;
				}
				Event.prepare({ event, target: this, currentTarget: this, phase: Event.AT_TARGET });
				registration.listener.call(this, event);
				if (!propagation.immediate) {
					return !event.defaultPrevented;
				}
			}

			if (!propagation.ancestor) {
				return !event.defaultPrevented;
			}

			const bubbles = [...this.listenersFor(event.type, false)];
			for (const registration of bubbles) {
				if (registration.removed) {
					continue;
				}
				Event.prepare({ event, target: this, currentTarget: this, phase: Event.AT_TARGET });
				registration.listener.call(this, event);
				if (!propagation.immediate) {
					return !event.defaultPrevented;
				}
			}

			if (!event.bubbles) {
				return !event.defaultPrevented;
			}

			for (let i = 0; i < path.length; i++) {
				if (!propagation.ancestor) {
					return !event.defaultPrevented;
				}
				const currentTarget = path[i]!;
				const registrations = [...currentTarget.listenersFor(event.type, false)];
				for (const registration of registrations) {
					if (registration.removed) {
						continue;
					}
					Event.prepare({ event, target: this, currentTarget, phase: Event.BUBBLING_PHASE });
					registration.listener.call(currentTarget, event);
					if (!propagation.immediate) {
						return !event.defaultPrevented;
					}
				}
			}

			return !event.defaultPrevented;
		} finally {
			Event.prepare({ event, target: this, currentTarget: null, phase: Event.NONE });
			propagation.ancestor = true;
			propagation.immediate = true;
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
			throw new DOMExecption('only HTML namespace is supported');
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

export type EventPhase = 0 | 1 | 2 | 3;

export class Event<Type extends string = string> {
	static readonly NONE = 0;
	static readonly CAPTURING_PHASE = 1;
	static readonly AT_TARGET = 2;
	static readonly BUBBLING_PHASE = 3;

	readonly type: Type;
	readonly bubbles: boolean;
	readonly cancelable: boolean;
	readonly composed: boolean;

	#eventPhase: EventPhase = Event.NONE;
	#defaultPrevented = false;
	#target: Node | null = null;
	#currentTarget: Node | null = null;
	#propagation = { ancestor: true, immediate: true };

	static prepare(options: {
		event: Event;
		target: Node | null;
		currentTarget: Node | null;
		phase: EventPhase;
	}) {
		const { event, target, currentTarget, phase } = options;
		event.#target = target;
		event.#currentTarget = currentTarget;
		event.#eventPhase = phase;
	}

	static currentPropagation(event: Event) {
		return event.#propagation;
	}

	constructor(type: Type, options?: EventOptions) {
		const { bubbles = false, cancelable = false, composed = false } = options ?? {};
		this.type = type;
		this.bubbles = bubbles;
		this.cancelable = cancelable;
		this.composed = composed;
	}

	get eventPhase() {
		return this.#eventPhase;
	}

	get defaultPrevented() {
		return this.#defaultPrevented;
	}

	get target() {
		return this.#target;
	}

	get currentTarget() {
		return this.#currentTarget;
	}

	stopPropagation(): void {
		this.#propagation.ancestor = false;
	}

	stopImmediatePropagation(): void {
		this.#propagation.immediate = false;
	}

	preventDefault(): void {
		if (this.cancelable) {
			this.#defaultPrevented = true;
		}
	}
}

export class DOMExecption extends Error {
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
