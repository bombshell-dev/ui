import type { HostElement, HostLiteral, HostElementChildInput } from './elements.ts';
import type { HostEventType, HostEventListener } from './events.ts';

export interface HostDocument {
	body: BrowserElement;
	documentElement: BrowserElement;
	activeElement: BrowserElement;
	defaultView: HostWindow;
	addEventListener(type: string, listener: HostDOMEventListener): void;
	removeEventListener(type: string, listener: HostDOMEventListener): void;
	dispatchEvent(event: HostDOMEvent): boolean;
	createElement(name: string): BrowserElement;
	createTextNode(content: string): BrowserLiteral;
	getElementById(id: string): BrowserElement | null;
	querySelector(selector: string): BrowserElement | null;
	querySelectorAll(selector: string): BrowserElement[];
}

/** Native-style event used exclusively by the optional browser facade. */
export class HostDOMEvent {
	type: string;
	target: BrowserElement | null = null;
	currentTarget: BrowserElement | HostDocument | HostWindow | null = null;
	nativeEvent: HostDOMEvent;
	bubbles: boolean;
	cancelable: boolean;
	defaultPrevented = false;
	cancelBubble = false;
	button: number;
	buttons: number;
	clientX: number;
	clientY: number;
	pointerId: number;
	pointerType: string;
	shiftKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
	metaKey: boolean;
	detail: number;
	[key: string]: unknown;

	constructor(type: string, init: Record<string, unknown> = {}) {
		this.type = type;
		Object.assign(this, init);
		this.bubbles = Boolean(init.bubbles);
		this.cancelable = Boolean(init.cancelable);
		this.button = Number(init.button ?? 0);
		this.buttons = Number(init.buttons ?? 0);
		this.clientX = Number(init.clientX ?? 0);
		this.clientY = Number(init.clientY ?? 0);
		this.pointerId = Number(init.pointerId ?? 1);
		this.pointerType = String(init.pointerType ?? '');
		this.shiftKey = Boolean(init.shiftKey);
		this.ctrlKey = Boolean(init.ctrlKey);
		this.altKey = Boolean(init.altKey);
		this.metaKey = Boolean(init.metaKey);
		this.detail = Number(init.detail ?? 0);
		this.nativeEvent = this;
	}

	stopPropagation(): void {
		this.cancelBubble = true;
	}

	preventDefault(): void {
		if (this.cancelable) this.defaultPrevented = true;
	}
}

export interface HostWindow {
	document: HostDocument;
	Element: Function;
	HTMLElement: Function;
	Node: Function;
	PointerEvent: new (type: string, init?: Record<string, unknown>) => HostDOMEvent;
	innerWidth: number;
	innerHeight: number;
	addEventListener(type: string, listener: HostDOMEventListener): void;
	removeEventListener(type: string, listener: HostDOMEventListener): void;
	getComputedStyle(element: BrowserElement): Record<string, unknown>;
	requestAnimationFrame(callback: (time: number) => void): number;
	cancelAnimationFrame(id: number): void;
}

export interface HostDOMEventListener {
	(event: HostDOMEvent): void;
}

export interface HostRect {
	x: number;
	y: number;
	width: number;
	height: number;
	top: number;
	right: number;
	bottom: number;
	left: number;
	toJSON(): Record<string, number>;
}

export interface HTMLAttributes {
	id?: string;
	className?: string;
	style?: Record<string, unknown>;
	role?: string;
	tabIndex?: number;
	[attribute: `aria-${string}`]: unknown;
	[attribute: `data-${string}`]: unknown;
}

export interface HostStyle {
	[property: string]: unknown;
	setProperty(name: string, value: string | null, priority?: string): void;
	removeProperty(name: string): string;
	getPropertyValue(name: string): string;
	getPropertyPriority(name: string): string;
}

export interface BrowserElement extends HostElement {
	parent: BrowserElement | null;
	readonly nodeType: 1;
	readonly nodeName: string;
	readonly tagName: string;
	readonly ownerDocument: HostDocument;
	readonly children: BrowserElement[];
	readonly childNodes: (BrowserElement | BrowserLiteral)[];
	readonly parentNode: BrowserElement | null;
	readonly parentElement: BrowserElement | null;
	readonly firstElementChild: BrowserElement | null;
	readonly lastElementChild: BrowserElement | null;
	readonly nextElementSibling: BrowserElement | null;
	readonly previousElementSibling: BrowserElement | null;
	readonly firstChild: BrowserElement | BrowserLiteral | null;
	readonly lastChild: BrowserElement | BrowserLiteral | null;
	readonly nextSibling: BrowserElement | BrowserLiteral | null;
	readonly previousSibling: BrowserElement | BrowserLiteral | null;
	value: string;
	checked: boolean;
	disabled: boolean;
	tabIndex: number;
	style: HostStyle;
	readonly offsetWidth: number;
	readonly offsetHeight: number;
	readonly clientWidth: number;
	readonly clientHeight: number;
	scrollLeft: number;
	scrollTop: number;
	readonly scrollWidth: number;
	readonly scrollHeight: number;
	cloneNode(deep?: boolean): BrowserElement;
	createElement(
		name: string,
		propertiesOrChild?: Record<string, unknown> | HostElementChildInput,
		...children: HostElementChildInput[]
	): BrowserElement;
	getBoundingClientRect(): HostRect;
	getClientRects(): HostRect[];
	dispatchEvent(event: HostDOMEvent): boolean;
	setPointerCapture(pointerId: number): void;
	releasePointerCapture(pointerId: number): void;
	hasPointerCapture(pointerId: number): boolean;
	querySelector(selector: string): BrowserElement | null;
	querySelectorAll(selector: string): BrowserElement[];
	compareDocumentPosition(other: HostElement): number;
	matches(selector: string): boolean;
	closest(selector: string): BrowserElement | null;
	getRootNode(): HostDocument;
	getAttribute(name: string): string | null;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
	hasAttribute(name: string): boolean;
	toggleAttribute(name: string, force?: boolean): boolean;
	addEventListener<T extends HostEventType>(type: T, listener: HostEventListener<T>): void;
	addEventListener(type: string, listener: HostDOMEventListener): void;
	removeEventListener<T extends HostEventType>(type: T, listener: HostEventListener<T>): void;
	removeEventListener(type: string, listener: HostDOMEventListener): void;
}

export interface BrowserLiteral extends HostLiteral {
	parent?: BrowserElement | null;
	readonly nodeType: 3;
	readonly nodeName: '#text';
	readonly ownerDocument: HostDocument;
	readonly parentNode: BrowserElement | null;
	readonly parentElement: BrowserElement | null;
	readonly nextSibling: BrowserElement | BrowserLiteral | null;
	readonly previousSibling: BrowserElement | BrowserLiteral | null;
	nodeValue: string;
	data: string;
	cloneNode(deep?: boolean): BrowserLiteral;
}
