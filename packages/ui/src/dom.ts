/* oxlint-disable bombshell-dev/no-generic-error -- Web IDL requires TypeError for missing arguments. */

import { asciiUppercase, asciiLowercase } from './ascii.ts';
import { NamedNodeMap } from './named-node-map.ts';
import { HTMLCollection } from './html-collection.ts';
import { StyleDeclaration } from './style.ts';
import {
	validateElementName,
	validateElementNamespace,
	validateAttributeName,
	validateAttributeNamespace,
} from './validation.ts';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

export class Document {
	readonly documentElement: Element;
	readonly body: HTMLBodyElement;
	readonly notify: () => void;

	#registry: Map<string, typeof Element> = new Map([
		['html', HTMLHtmlElement],
		['body', HTMLBodyElement],
		['span', HTMLSpanElement],
		['div', HTMLDivElement],
	]);

	constructor(notify: () => void) {
		this.notify = notify;
		this.documentElement = this.createElement('html');
		this.body = this.createElement('body');
		this.documentElement.appendChild(this.body);
	}

	getElementsByTagName(qualifiedName: string): HTMLCollection {
		if (arguments.length === 0) {
			throw new TypeError('getElementsByTagName requires a qualified name');
		}
		const name = `${qualifiedName}`;
		const lowerName = asciiLowercase(name);
		return new HTMLCollection(() => {
			const matches: Element[] = [];
			const stack = [this.documentElement];
			while (stack.length > 0) {
				const element = stack.pop()!;
				const elementName =
					element.prefix === null ? element.localName : `${element.prefix}:${element.localName}`;
				if (name === '*' || elementName === (element.namespaceURI === HTML_NS ? lowerName : name)) {
					matches.push(element);
				}
				for (let i = element.childNodes.length - 1; i >= 0; i--) {
					const child = element.childNodes[i];
					if (child instanceof Element) {
						stack.push(child);
					}
				}
			}
			return matches;
		});
	}

	getElementById(id: string): Element | null {
		if (arguments.length === 0) {
			throw new TypeError('getElementById requires an ID');
		}
		const name = `${id}`;
		if (name === '') {
			return null;
		}
		const stack = [this.documentElement];
		while (stack.length > 0) {
			const element = stack.pop()!;
			if (element.id === name) {
				return element;
			}
			for (let i = element.childNodes.length - 1; i >= 0; i--) {
				const child = element.childNodes[i];
				if (child instanceof Element) {
					stack.push(child);
				}
			}
		}
		return null;
	}

	createElement(tagName: string): Element {
		if (arguments.length === 0) {
			throw new TypeError('createElement requires a tag name');
		}
		const localName = `${tagName}`;
		validateElementName(localName);
		return this.#createElement(asciiLowercase(localName), { namespaceURI: HTML_NS, prefix: null });
	}

	createElementNS(namespace: string | null, qualifiedName: string): Element {
		if (arguments.length < 2) {
			throw new TypeError('createElementNS requires a namespace and qualified name');
		}
		const namespaceURI = namespace == null ? null : `${namespace}` || null;
		const name = `${qualifiedName}`;
		const { prefix, localName } = validateElementNamespace(namespaceURI, name);
		return this.#createElement(localName, { namespaceURI, prefix });
	}

	createAttribute(localName: string): Attr {
		const name = `${localName}`;
		validateAttributeName(name);
		return new Attr(this, asciiLowercase(name), this.notify);
	}

	createAttributeNS(namespace: string | null, qualifiedName: string): Attr {
		if (arguments.length < 2) {
			throw new TypeError('createAttributeNS requires a namespace and qualified name');
		}
		const namespaceURI = namespace == null ? null : `${namespace}` || null;
		const name = `${qualifiedName}`;
		const { prefix, localName } = validateAttributeNamespace(namespaceURI, name);
		return new Attr(this, localName, this.notify, { namespaceURI, prefix });
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

	#createElement(localName: string, namespace: ElementNamespace): Element {
		if (namespace.namespaceURI !== HTML_NS) {
			return new Element(this, localName, this.notify, namespace);
		} else {
			const ElementConstructor = this.#registry.get(localName) ?? HTMLUnknownElement;
			return new ElementConstructor(this, localName, this.notify, namespace);
		}
	}
}

export interface EventListener<Target extends EventTarget = EventTarget> {
	(this: Target, event: Event): void;
}

export abstract class Node extends EventTarget {
	static readonly ELEMENT_NODE = 1;
	static readonly ATTRIBUTE_NODE = 2;
	static readonly TEXT_NODE = 3;
	static readonly PROCESSING_INSTRUCTION_NODE = 7;
	static readonly COMMENT_NODE = 8;

	readonly ELEMENT_NODE = Node.ELEMENT_NODE;
	readonly ATTRIBUTE_NODE = Node.ATTRIBUTE_NODE;
	readonly TEXT_NODE = Node.TEXT_NODE;
	readonly PROCESSING_INSTRUCTION_NODE = Node.PROCESSING_INSTRUCTION_NODE;
	readonly COMMENT_NODE = Node.COMMENT_NODE;

	readonly #childNodes: Node[] = [];
	readonly ownerDocument: Document;

	abstract readonly nodeType: number;
	abstract readonly nodeName: string;

	protected readonly notify: () => void;

	#parentNode: Node | null = null;

	constructor(owner: Document, notify: Node['notify']) {
		super();
		this.notify = notify;
		this.ownerDocument = owner;
	}

	// Adds bubbling to the host EventTarget. Capture traversal and resetting the
	// host's propagation flags after dispatch are not implemented here.
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

	get previousSibling(): Node | null {
		if (!this.#parentNode) {
			return null;
		}
		const siblings = this.#parentNode.#childNodes;
		return siblings[siblings.indexOf(this) - 1] ?? null;
	}

	get nextSibling(): Node | null {
		if (!this.#parentNode) {
			return null;
		}
		const siblings = this.#parentNode.#childNodes;
		return siblings[siblings.indexOf(this) + 1] ?? null;
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
	readonly style: StyleDeclaration;
	readonly localName: string;
	readonly nodeName: string;
	readonly namespaceURI: string | null;
	readonly prefix: string | null;

	readonly #attributes: NamedNodeMap;

	constructor(
		owner: Document,
		localName: string,
		notify: Node['notify'],
		{ namespaceURI = HTML_NS, prefix = null }: Partial<ElementNamespace> = {},
	) {
		super(owner, notify);
		this.style = new StyleDeclaration(this.notify);
		this.localName = localName;
		this.namespaceURI = namespaceURI;
		this.prefix = prefix;
		const qualifiedName = prefix === null ? localName : `${prefix}:${localName}`;
		this.nodeName = namespaceURI === HTML_NS ? asciiUppercase(qualifiedName) : qualifiedName;
		this.#attributes = new NamedNodeMap({
			ownerElement: this,
			createAttribute: (name, namespace) => new Attr(owner, name, notify, namespace),
			notify,
		});
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

	get attributes(): NamedNodeMap {
		return this.#attributes;
	}

	getAttribute(name: string): string | null {
		return this.#attributes.getNamedItem(name)?.value ?? null;
	}

	hasAttribute(name: string): boolean {
		if (arguments.length === 0) {
			throw new TypeError('hasAttribute requires an attribute name');
		}
		return this.#attributes.getNamedItem(name) !== null;
	}

	setAttribute(name: string, value: string): void {
		this.#attributes.setAttribute(name, value);
	}

	getAttributeNS(namespace: string | null, localName: string): string | null {
		if (arguments.length < 2) {
			throw new TypeError('getAttributeNS requires a namespace and local name');
		}
		return this.#attributes.getNamedItemNS(namespace, localName)?.value ?? null;
	}

	setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void {
		if (arguments.length < 3) {
			throw new TypeError('setAttributeNS requires a namespace, qualified name, and value');
		}
		this.#attributes.setAttributeNS(namespace, qualifiedName, value);
	}

	hasAttributeNS(namespace: string | null, localName: string): boolean {
		return this.#attributes.getNamedItemNS(namespace, localName) !== null;
	}

	getAttributeNode(name: string): Attr | null {
		return this.#attributes.getNamedItem(name);
	}

	getAttributeNodeNS(namespace: string | null, localName: string): Attr | null {
		return this.#attributes.getNamedItemNS(namespace, localName);
	}

	setAttributeNode(attribute: Attr): Attr | null {
		return this.#attributes.setNamedItem(attribute);
	}

	setAttributeNodeNS(attribute: Attr): Attr | null {
		return this.#attributes.setNamedItemNS(attribute);
	}

	removeAttribute(name: string): void {
		this.#attributes.removeAttribute(name);
	}

	removeAttributeNS(namespace: string | null, localName: string): void {
		this.#attributes.removeAttributeNS(namespace, localName);
	}

	removeAttributeNode(attribute: Attr): Attr {
		return this.#attributes.removeAttributeNode(attribute);
	}

	getAttributeNames(): string[] {
		return this.#attributes.getAttributeNames();
	}

	toggleAttribute(name: string, force?: boolean): boolean {
		return this.#attributes.toggleAttribute(name, force);
	}

	get id(): string {
		return this.#attributes.getNamedItemNS(null, 'id')?.value ?? '';
	}

	set id(value: string) {
		this.#attributes.setAttributeNS(null, 'id', value);
	}
}

export class HTMLElement extends Element {}

export class HTMLHtmlElement extends HTMLElement {}

export class HTMLSpanElement extends HTMLElement {}

export class HTMLDivElement extends HTMLElement {}

export class HTMLBodyElement extends HTMLElement {}

export class HTMLUnknownElement extends HTMLElement {}

export class Attr extends Node {
	readonly localName: string;
	readonly namespaceURI: string | null;
	readonly prefix: string | null;
	ownerElement: Element | null;
	readonly specified = true;

	#value: string;

	constructor(
		owner: Document,
		localName: string,
		notify: Node['notify'],
		{
			namespaceURI = null,
			prefix = null,
			ownerElement = null,
			value = '',
		}: Partial<ElementNamespace> & { ownerElement?: Element | null; value?: string } = {},
	) {
		super(owner, notify);
		this.localName = localName;
		this.namespaceURI = namespaceURI;
		this.prefix = prefix;
		this.ownerElement = ownerElement;
		this.#value = value;
	}

	get nodeType(): number {
		return Node.ATTRIBUTE_NODE;
	}

	get nodeName(): string {
		return this.name;
	}

	get name(): string {
		return this.prefix === null ? this.localName : `${this.prefix}:${this.localName}`;
	}

	get value(): string {
		return this.#value;
	}

	set value(value: string) {
		const normal = `${value}`;
		if (this.#value !== normal) {
			this.#value = normal;
			this.ownerDocument?.notify();
		}
	}

	override get nodeValue(): string {
		return this.value;
	}

	get textContent(): string {
		return this.value;
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

interface ElementNamespace {
	namespaceURI: string | null;
	prefix: string | null;
}

export interface EventOptions {
	bubbles?: boolean;
	cancelable?: boolean;
	composed?: boolean;
}

// Node exposes these constants at runtime, but its type declarations omit them.
const Event = globalThis.Event as typeof globalThis.Event & {
	readonly NONE: 0;
	readonly CAPTURING_PHASE: 1;
	readonly AT_TARGET: 2;
	readonly BUBBLING_PHASE: 3;
};
