/* oxlint-disable bombshell-dev/no-generic-error -- Web IDL requires TypeError for missing arguments. */

import { findElement, findElements, querySelector } from './css-select.ts';
import { asciiUppercase, asciiLowercase } from './ascii.ts';
import { NamedNodeMap } from './named-node-map.ts';
import { HTMLCollection } from './html-collection.ts';
import { StyleDeclaration } from './style.ts';
import {
	validateElementName,
	validateElementNamespace,
	validateAttributeName,
	validateAttributeNamespace,
	validateDocumentTypeName,
} from './validation.ts';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

export abstract class Node extends EventTarget {
	static readonly ELEMENT_NODE = 1;
	static readonly ATTRIBUTE_NODE = 2;
	static readonly TEXT_NODE = 3;
	static readonly PROCESSING_INSTRUCTION_NODE = 7;
	static readonly COMMENT_NODE = 8;
	static readonly DOCUMENT_NODE = 9;
	static readonly DOCUMENT_TYPE_NODE = 10;
	static readonly DOCUMENT_FRAGMENT_NODE = 11;

	readonly ELEMENT_NODE = Node.ELEMENT_NODE;
	readonly ATTRIBUTE_NODE = Node.ATTRIBUTE_NODE;
	readonly TEXT_NODE = Node.TEXT_NODE;
	readonly PROCESSING_INSTRUCTION_NODE = Node.PROCESSING_INSTRUCTION_NODE;
	readonly COMMENT_NODE = Node.COMMENT_NODE;
	readonly DOCUMENT_NODE = Node.DOCUMENT_NODE;
	readonly DOCUMENT_TYPE_NODE = Node.DOCUMENT_TYPE_NODE;
	readonly DOCUMENT_FRAGMENT_NODE = Node.DOCUMENT_FRAGMENT_NODE;

	readonly #childNodes: Node[] = [];
	readonly ownerDocument: Document | null;

	abstract readonly nodeType: number;
	abstract readonly nodeName: string;

	protected readonly notify: () => void;

	#parentNode: Node | null = null;

	constructor(owner: Document | null, notify: Node['notify']) {
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

	set nodeValue(_: string | null) {
		//ignore
	}

	get textContent(): string | null {
		return null;
	}

	set textContent(_: string | null) {
		//ignore
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

		if (node instanceof DocumentFragment) {
			for (const child of node.childNodes.slice()) {
				this.insertBefore(child, anchor);
			}
			return node;
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

export class DOMImplementation {
	#document: Document;
	#notify: Node['notify'];
	constructor(document: Document, notify: Node['notify']) {
		this.#document = document;
		this.#notify = notify;
	}

	// oxlint-disable-next-line bombshell-dev/max-params -- DOMImplementation.createDocument uses three positional arguments.
	createDocument(
		namespace: string | null,
		qualifiedName: string | null,
		doctype: DocumentType | null = null,
	): XMLDocument {
		if (arguments.length < 2) {
			throw new TypeError('createDocument requires a namespace and qualified name');
		}
		const namespaceURI = namespace == null ? null : `${namespace}` || null;
		const name = qualifiedName === null ? '' : `${qualifiedName}`;
		if (doctype !== null && !(doctype instanceof DocumentType)) {
			throw new TypeError('createDocument requires a DocumentType or null for its doctype');
		}

		const document = new XMLDocument(this.#notify);
		const element = name === '' ? null : document.createElementNS(namespaceURI, name);
		if (doctype !== null) {
			document.appendChild(doctype);
		}
		if (element !== null) {
			document.appendChild(element);
		}
		return document;
	}

	createHTMLDocument(title?: string): HTMLDocument {
		return createHTMLDocument(this.#notify, title);
	}

	// oxlint-disable-next-line bombshell-dev/max-params -- DOMImplementation.createDocumentType requires three positional arguments.
	createDocumentType(name: string, publicId: string, systemId: string): DocumentType {
		if (arguments.length < 3) {
			throw new TypeError('createDocumentType requires a name, public ID, and system ID');
		}
		const options = {
			owner: this.#document,
			name: `${name}`,
			publicId: `${publicId}`,
			systemId: `${systemId}`,
			notify: this.#notify,
		};
		validateDocumentTypeName(options.name);
		return new DocumentType(options);
	}
}

export class Document extends Node {
	declare readonly ownerDocument: null;

	readonly implementation: DOMImplementation;

	#factory: (...params: ConstructorParameters<typeof Element>) => Element;

	constructor(
		notify: () => void,
		factory?: (...params: ConstructorParameters<typeof Element>) => Element,
	) {
		super(null, notify);
		this.#factory = factory ?? ((...params) => new Element(...params));
		this.implementation = new DOMImplementation(this, notify);
	}

	get nodeType(): number {
		return Node.DOCUMENT_NODE;
	}

	get nodeName(): string {
		return '#document';
	}

	get doctype(): DocumentType | null {
		for (const child of this.childNodes) {
			if (child instanceof DocumentType) {
				return child;
			}
		}
		return null;
	}

	get documentElement(): Element | null {
		for (const child of this.childNodes) {
			if (child instanceof Element) {
				return child;
			}
		}
		return null;
	}

	querySelector(selector: string): Element | null {
		return querySelector(Array.from(this.childNodes), selector);
	}

	getElementsByTagName(qualifiedName: string): HTMLCollection {
		if (arguments.length === 0) {
			throw new TypeError('getElementsByTagName requires a qualified name');
		}
		const name = `${qualifiedName}`;
		const lowerName = asciiLowercase(name);
		return new HTMLCollection(() =>
			findElements(Array.from(this.childNodes), (element) => {
				const elementName =
					element.prefix === null ? element.localName : `${element.prefix}:${element.localName}`;
				return (
					name === '*' ||
					elementName ===
						(this instanceof HTMLDocument && element.namespaceURI === HTML_NS ? lowerName : name)
				);
			}),
		);
	}

	getElementById(id: string): Element | null {
		if (arguments.length === 0) {
			throw new TypeError('getElementById requires an ID');
		}
		const name = `${id}`;
		if (name === '') {
			return null;
		}
		return findElement(Array.from(this.childNodes), (element) => element.id === name);
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

	createDocumentFragment(): DocumentFragment {
		return new DocumentFragment(this, this.notify);
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
			return this.#factory(this, localName, this.notify, namespace);
		}
	}
}

export class DocumentFragment extends Node {
	declare readonly ownerDocument: Document;

	constructor(owner: Document, notify: Node['notify']) {
		super(owner, notify);
	}

	get nodeType(): number {
		return Node.DOCUMENT_FRAGMENT_NODE;
	}

	get nodeName(): string {
		return '#document-fragment';
	}

	override get textContent(): string {
		return getTextContent(this);
	}

	override set textContent(value: string | null) {
		setTextContent(this, value == null ? '' : `${value}`);
	}
}

export class DocumentType extends Node {
	declare readonly ownerDocument: Document;

	readonly name: string;
	readonly publicId: string;
	readonly systemId: string;

	constructor(options: {
		owner: Document;
		name: string;
		publicId: string;
		systemId: string;
		notify: Node['notify'];
	}) {
		super(options.owner, options.notify);
		this.name = options.name;
		this.publicId = options.publicId;
		this.systemId = options.systemId;
	}

	get nodeType(): number {
		return Node.DOCUMENT_TYPE_NODE;
	}

	get nodeName(): string {
		return this.name;
	}
}

export interface EventListener {
	(this: EventTarget, event: Event): void;
}

export class Element extends Node {
	declare readonly ownerDocument: Document;

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

	override get textContent(): string {
		return getTextContent(this);
	}

	override set textContent(value: string | null) {
		setTextContent(this, value == null ? '' : `${value}`);
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

export class Attr extends Node {
	declare readonly ownerDocument: Document;

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
			this.notify();
		}
	}

	override get nodeValue(): string {
		return this.value;
	}

	override get textContent(): string {
		return this.value;
	}
}

export abstract class CharacterData extends Node {
	declare readonly ownerDocument: Document;

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

	override get textContent(): string {
		return this.data;
	}

	override set textContent(value: string | null) {
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

/* HTML */

export function createHTMLDocument(notify: Node['notify'], title?: string): HTMLDocument {
	const titleText = title === undefined ? undefined : `${title}`;
	const document = new HTMLDocument(notify);
	const doctype = document.implementation.createDocumentType('html', '', '');
	document.appendChild(doctype);

	const root = document.createElement('html');
	const head = document.createElement('head');
	const body = document.createElement('body');

	root.appendChild(head);
	if (titleText !== undefined) {
		const titleElement = document.createElement('title');
		head.appendChild(titleElement);
		titleElement.appendChild(document.createTextNode(titleText));
	}
	root.appendChild(body);
	document.appendChild(root);

	return document;
}

export class HTMLDocument extends Document {
	#elements = new Map<string, typeof HTMLElement>([
		['html', HTMLHtmlElement],
		['head', HTMLHeadElement],
		['title', HTMLTitleElement],
		['body', HTMLBodyElement],
		['span', HTMLSpanElement],
		['div', HTMLDivElement],
	]);
	constructor(notify: Node['notify']) {
		super(notify, (owner, localName, notifyElement, namespace) => {
			const ElementConstructor = this.#elements.get(localName) ?? HTMLUnknownElement;

			return new ElementConstructor(owner, localName, notifyElement, namespace);
		});
	}

	get head(): HTMLHeadElement | null {
		const root = this.documentElement;
		if (root instanceof HTMLHtmlElement) {
			for (const child of root.childNodes) {
				if (child instanceof HTMLHeadElement) {
					return child;
				}
			}
		}
		return null;
	}

	get body(): HTMLBodyElement | null {
		const root = this.documentElement;
		if (root && root instanceof HTMLHtmlElement) {
			for (const child of root.childNodes) {
				if (child instanceof HTMLBodyElement) {
					return child;
				}
			}
		}
		return null;
	}
}

export class HTMLElement extends Element {}

export class HTMLHtmlElement extends HTMLElement {}

export class HTMLHeadElement extends HTMLElement {}

export class HTMLTitleElement extends HTMLElement {}

export class HTMLBodyElement extends HTMLElement {}

export class HTMLSpanElement extends HTMLElement {}

export class HTMLDivElement extends HTMLElement {}

export class HTMLUnknownElement extends HTMLElement {}

/** XML */

export class XMLDocument extends Document {}

/** internal helpers **/

function getTextContent(node: Element | DocumentFragment): string {
	const parts: string[] = [];
	const stack = node.childNodes.toReversed();
	while (stack.length > 0) {
		const descendant = stack.pop()!;
		if (descendant instanceof Text) {
			parts.push(descendant.data);
		}
		for (let index = descendant.childNodes.length - 1; index >= 0; index--) {
			stack.push(descendant.childNodes[index]!);
		}
	}
	return parts.join('');
}

function setTextContent(node: Element | DocumentFragment, content: string): void {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
	if (content !== '') {
		node.appendChild(node.ownerDocument.createTextNode(content));
	}
}
