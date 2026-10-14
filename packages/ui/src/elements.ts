import { createContext, type Node } from './core.ts';
import type { Op } from '@bomb.sh/tty';
import type { KeyDown, KeyRepeat } from './keyboard.ts';
import type { HostEventType, HostEventListener, HostEventData, EventResult } from './events.ts';
import type { Host } from './host.ts';

/**
 * Type container for elements and their properties
 */
export interface HostElements {}

export interface HostElement {
	parent: HostElement | null;
	readonly type: 'element';
	readonly name: string;
	readonly properties: Record<string, unknown>;
	/** Physical children, including text nodes; Host mutation storage. */
	readonly childNodes: HostElementChild[];
	/** Physical element children only, as in the browser DOM. */
	readonly children: HostElement[];
	readonly parentNode: HostElement | null;
	readonly parentElement: HostElement | null;
	readonly firstElementChild: HostElement | null;
	readonly lastElementChild: HostElement | null;
	readonly nextElementSibling: HostElement | null;
	readonly previousElementSibling: HostElement | null;
	readonly firstChild: HostElementChild | null;
	readonly lastChild: HostElementChild | null;
	readonly nextSibling: HostElementChild | null;
	readonly previousSibling: HostElementChild | null;
	/** Physical child container used to preserve consumer child ownership. */
	childrenContainer?: HostElement;
	node: Node | null;
	textContent: string;
	createElement(
		name: string,
		propertiesOrChild?: Record<string, unknown> | HostElementChildInput,
		...children: HostElementChildInput[]
	): HostElement;
	append(...children: HostElementChildInput[]): void;
	appendChild<T extends HostElementChild>(child: T): T;
	insertBefore<T extends HostElementChild>(child: T, anchor: HostElementChild | null): T;
	removeChild<T extends HostElementChild>(child: T): T;
	cloneNode(deep?: boolean): HostElement;
	prepend(...children: HostElementChildInput[]): void;
	replaceChildren(...children: HostElementChildInput[]): void;
	remove(): void;
	focus(): void;
	blur(): void;
	contains(element: HostElement): boolean;
	readonly isConnected: boolean;
	setProperty(name: string, value: unknown): void;
	addEventListener<T extends HostEventType>(type: T, listener: HostEventListener<T>): void;
	removeEventListener<T extends HostEventType>(type: T, listener: HostEventListener<T>): void;
	emit(data: HostEventData): EventResult;
	attach?: (node: Node) => void;
	detach?: (node: Node) => void;
	propertyChanged?: (change: PropertyChange) => void;
	focusedCallback?: (node: Node) => void;
	blurredCallback?: (node: Node) => void;
	keydown?: (event: KeyDown) => boolean;
	keyrepeat?: (event: KeyRepeat) => boolean;
	layout?: (node: Node) => Iterable<Op> | undefined;
}

export interface PropertyChange {
	name: string;
	previous: unknown;
	value: unknown;
}

export interface HostLiteral {
	parent?: HostElement | null;
	type: 'literal';
	readonly parentNode: HostElement | null;
	readonly parentElement: HostElement | null;
	readonly firstChild: null;
	readonly lastChild: null;
	readonly nextSibling: HostElementChild | null;
	readonly previousSibling: HostElementChild | null;
	textContent: string;
	readonly isConnected: boolean;
	cloneNode(deep?: boolean): HostLiteral;
	content: string;
}

export type HostElementChild = HostElement | HostLiteral;
export type HostElementChildInput =
	| HostElementChild
	| string
	| number
	| boolean
	| null
	| undefined
	| readonly HostElementChildInput[];

export function getElement(node: Node): HostElement {
	return ElementContext.expect(node);
}

export function setElement(node: Node, element: HostElement): void {
	element.node = node;
	ElementContext.set(node, element);
}

const ElementContext = createContext<HostElement>('element');

const elementHosts = new WeakMap<HostElementChild, Host>();

/** Resolve a node's stable creator Host, including while detached. */
export function getElementHost(element: HostElementChild): Host {
	const host = elementHosts.get(element);
	if (!host) throw new MissingElementHostError(element);
	return host;
}

/** Bind ownership once when a Host creates a node, independently of attachment. */
export function setElementHost(element: HostElementChild, host: Host): void {
	const owner = elementHosts.get(element);
	if (owner && owner !== host) throw new ElementHostOwnershipError(element);
	elementHosts.set(element, host);
}

class ElementHostOwnershipError extends TypeError {
	readonly code = 'CLACK_UI_IMMUTABLE_ELEMENT_HOST';
	readonly element: HostElementChild;

	constructor(element: HostElementChild) {
		super('A Host node cannot change its creator Host');
		this.name = 'ElementHostOwnershipError';
		this.element = element;
	}
}

class MissingElementHostError extends TypeError {
	readonly code = 'CLACK_UI_MISSING_ELEMENT_HOST';
	readonly element: HostElementChild;

	constructor(element: HostElementChild) {
		super('Host node has no owning Host');
		this.name = 'MissingElementHostError';
		this.element = element;
	}
}
