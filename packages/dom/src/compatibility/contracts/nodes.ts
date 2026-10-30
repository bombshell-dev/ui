/** Standard interfaces used by the compatibility tests, independent of implementation support. */
import type { DOMEventTarget } from './events.ts';
import type { DOMElements } from './elements.ts';
import type { DOMRange, DOMSelection } from './selection.ts';
import type { DOMShadowRoot, DOMSlotElement } from './shadow.ts';
import type { DOMHTMLCollection, DOMNamedNodeMap, DOMNodeList } from './collections.ts';

export interface DOMNode extends DOMEventTarget {
	readonly nodeType: number;
	readonly nodeName: string;
	readonly ownerDocument: DOMDocument | null;
	readonly parentNode: DOMNode | null;
	readonly parentElement: DOMElement | null;
	readonly childNodes: DOMNodeList;
	readonly firstChild: DOMNode | null;
	readonly lastChild: DOMNode | null;
	readonly previousSibling: DOMNode | null;
	readonly nextSibling: DOMNode | null;
	readonly isConnected: boolean;
	readonly baseURI: string;
	nodeValue: string | null;
	textContent: string | null;
	appendChild(node: DOMNode): DOMNode;
	insertBefore(node: DOMNode, anchor: DOMNode | null): DOMNode;
	removeChild(node: DOMNode): DOMNode;
	replaceChild(node: DOMNode, child: DOMNode): DOMNode;
	cloneNode(deep?: boolean): DOMNode;
	contains(node: DOMNode | null): boolean;
	hasChildNodes(): boolean;
	isSameNode(node: DOMNode | null): boolean;
	isEqualNode(node: DOMNode | null): boolean;
	normalize(): void;
	compareDocumentPosition(other: DOMNode): number;
	lookupPrefix(namespace: string | null): string | null;
	lookupNamespaceURI(prefix: string | null): string | null;
	isDefaultNamespace(namespace: string | null): boolean;
	getRootNode(options?: { composed?: boolean }): DOMNode;
}

export interface DOMParentNode {
	readonly children: DOMHTMLCollection;
	readonly firstElementChild: DOMElement | null;
	readonly lastElementChild: DOMElement | null;
	readonly childElementCount: number;
	append(...nodes: (DOMNode | string)[]): void;
	prepend(...nodes: (DOMNode | string)[]): void;
	replaceChildren(...nodes: (DOMNode | string)[]): void;
}

export interface DOMChildNode {
	remove(): void;
	before(...nodes: (DOMNode | string)[]): void;
	after(...nodes: (DOMNode | string)[]): void;
	replaceWith(...nodes: (DOMNode | string)[]): void;
}

export interface DOMElement extends DOMNode, DOMParentNode, DOMChildNode {
	readonly lastElementChild: DOMElement | null;
	readonly childElementCount: number;
	readonly localName: string;
	readonly namespaceURI: string | null;
	readonly prefix: string | null;
	readonly tagName: string;
	readonly attributes: DOMNamedNodeMap;
	readonly shadowRoot: DOMShadowRoot | null;
	readonly assignedSlot: DOMSlotElement | null;
	id: string;
	className: string;
	get classList(): DOMTokenList;
	set classList(value: string);
	slot: string;
	innerHTML: string;
	getAttribute(name: string): string | null;
	getAttributeNS(namespace: string | null, name: string): string | null;
	getAttributeNames(): string[];
	hasAttribute(name: string): boolean;
	hasAttributeNS(namespace: string | null, name: string): boolean;
	hasAttributes(): boolean;
	setAttribute(name: string, value: string): void;
	setAttributeNS(namespace: string | null, name: string, value: string): void;
	removeAttribute(name: string): void;
	removeAttributeNS(namespace: string | null, name: string): void;
	toggleAttribute(name: string, force?: boolean): boolean;
	getAttributeNode(name: string): DOMAttr | null;
	getAttributeNodeNS(namespace: string | null, name: string): DOMAttr | null;
	setAttributeNode(attr: DOMAttr): DOMAttr | null;
	setAttributeNodeNS(attr: DOMAttr): DOMAttr | null;
	removeAttributeNode(attr: DOMAttr): DOMAttr;
	attachShadow(init: {
		mode: 'open' | 'closed';
		delegatesFocus?: boolean;
		slotAssignment?: 'named' | 'manual';
		clonable?: boolean;
		serializable?: boolean;
	}): DOMShadowRoot;
	getHTML(options?: {
		serializableShadowRoots?: boolean;
		shadowRoots?: readonly DOMShadowRoot[];
	}): string;
	setHTMLUnsafe(html: string): void;
}

export interface DOMHTMLElement extends DOMElement {
	tabIndex: number;
	hidden: boolean | string;
	inert: boolean;
	contentEditable: string;
	readonly isContentEditable: boolean;
	focus(options?: { preventScroll?: boolean; focusVisible?: boolean }): void;
	blur(): void;
	click(): void;
}

export interface DOMAttr extends DOMNode {
	readonly name: string;
	readonly localName: string;
	readonly namespaceURI: string | null;
	readonly prefix: string | null;
	readonly ownerElement: DOMElement | null;
	readonly specified: boolean;
	value: string;
}

export interface DOMCharacterData extends DOMNode, DOMChildNode {
	data: string;
	readonly length: number;
	substringData(offset: number, count: number): string;
	appendData(data: string): void;
	insertData(offset: number, data: string): void;
	deleteData(offset: number, count: number): void;
	replaceData(offset: number, count: number, data: string): void;
}

export interface DOMText extends DOMCharacterData {
	readonly wholeText: string;
	splitText(offset: number): DOMText;
}

export interface DOMDocumentFragment extends DOMNode, DOMParentNode {}

export interface DOMDocument extends DOMNode, DOMParentNode {
	readonly documentElement: DOMElement | null;
	body: DOMHTMLElement | null;
	readonly activeElement: DOMElement | null;
	createElement<K extends keyof DOMElements>(name: K): DOMElements[K];
	createElement(name: string): DOMHTMLElement;
	createElementNS(namespace: string | null, name: string): DOMElement;
	createTextNode(data: string): DOMText;
	createComment(data: string): DOMCharacterData;
	createDocumentFragment(): DOMDocumentFragment;
	createAttribute(name: string): DOMAttr;
	createAttributeNS(namespace: string | null, name: string): DOMAttr;
	getElementById(id: string): DOMElement | null;
	adoptNode(node: DOMNode): DOMNode;
	importNode(node: DOMNode, deep?: boolean): DOMNode;
	createRange(): DOMRange;
	getSelection(): DOMSelection | null;
	createTreeWalker(
		root: DOMNode,
		whatToShow?: number,
		filter?: { acceptNode(node: DOMNode): number } | ((node: DOMNode) => number) | null,
	): DOMTreeWalker;
}

export interface DOMTreeWalker {
	readonly root: DOMNode;
	readonly whatToShow: number;
	readonly filter: { acceptNode(node: DOMNode): number } | ((node: DOMNode) => number) | null;
	currentNode: DOMNode;
	nextNode(): DOMNode | null;
	parentNode(): DOMNode | null;
	firstChild(): DOMNode | null;
	lastChild(): DOMNode | null;
	previousSibling(): DOMNode | null;
	nextSibling(): DOMNode | null;
	previousNode(): DOMNode | null;
}

export interface DOMTokenList extends Iterable<string> {
	value: string;
	readonly length: number;
	readonly [index: number]: string;
	item(index: number): string | null;
	contains(token: string): boolean;
	add(...tokens: string[]): void;
	remove(...tokens: string[]): void;
	toggle(token: string, force?: boolean): boolean;
	replace(token: string, replacement: string): boolean;
	supports(token: string): boolean;
	entries(): IterableIterator<[number, string]>;
	keys(): IterableIterator<number>;
	values(): IterableIterator<string>;
	forEach(
		callback: (value: string, index: number, list: DOMTokenList) => void,
		thisArg?: unknown,
	): void;
	toString(): string;
}
