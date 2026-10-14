// oxlint-disable max-params bombshell-dev/max-params -- Browser mutations retain Host mutation arguments.
import {
	getElement,
	getElementHost,
	type HostElement,
	type HostLiteral,
	type HostElementChild,
} from './elements.ts';
import { HostApi, type Host } from './host.ts';
import { FocusApi } from './focus.ts';
import { EventApi, type EventResult } from './event-api.ts';
import type { AnyHostEvent, HostEventListener, HostEventType } from './events.ts';
import { compareDocumentPosition, matchesSelector, queryElements } from './selectors.ts';
import {
	HostDOMEvent,
	type BrowserElement,
	type BrowserLiteral,
	type HostDocument,
	type HostWindow,
	type HostDOMEventListener,
	type HostRect,
	type HostStyle,
} from './browser-types.ts';

/** Explicit, in-place browser compatibility for a Host's structural nodes. */
export class BrowserFacade {
	readonly host: Host;
	readonly document: HostDocument;
	readonly window: HostWindow;
	private documentListeners = new Map<string, Set<HostDOMEventListener>>();
	private windowListeners = new Map<string, Set<HostDOMEventListener>>();
	private pointerCaptures = new Map<number, BrowserElement>();
	private decorated = new WeakSet<HostElement | HostLiteral>();

	constructor(host: Host) {
		this.host = host;
		// oxlint-disable-next-line typescript/no-this-alias -- Document getters retain the owning facade.
		const facade = this;
		const view: HostWindow = {
			document: undefined as unknown as HostDocument,
			Element: class {},
			HTMLElement: class {},
			Node: class {},
			PointerEvent: HostDOMEvent,
			get innerWidth() {
				return host.viewport.width;
			},
			set innerWidth(value) {
				host.viewport.width = value;
			},
			get innerHeight() {
				return host.viewport.height;
			},
			set innerHeight(value) {
				host.viewport.height = value;
			},
			addEventListener(type, listener) {
				facade.addGlobalListener(facade.windowListeners, type, listener);
			},
			removeEventListener(type, listener) {
				facade.removeGlobalListener(facade.windowListeners, type, listener);
			},
			getComputedStyle(element) {
				return element.style;
			},
			requestAnimationFrame(callback) {
				return setTimeout(() => callback(performance.now()), 16) as unknown as number;
			},
			cancelAnimationFrame(id) {
				clearTimeout(id);
			},
		};
		this.document = {
			get body() {
				return facade.element(host.element);
			},
			get documentElement() {
				return facade.element(host.element);
			},
			get activeElement() {
				try {
					return facade.element(getElement(FocusApi.at(host.root).getFocus()));
				} catch {
					return facade.element(host.element);
				}
			},
			createElement(name) {
				return facade.element(host.createElement(name));
			},
			createTextNode(content) {
				return facade.literal(host.createLiteral(content));
			},
			querySelector(selector) {
				return this.querySelectorAll(selector)[0] ?? null;
			},
			querySelectorAll(selector) {
				const element = facade.element(host.element);
				const descendants = queryElements(element, selector);
				return matchesSelector(element, selector) ? [element, ...descendants] : descendants;
			},
			getElementById(id) {
				return findElementById(facade.element(host.element), id);
			},
			defaultView: view,
			addEventListener(type, listener) {
				facade.addGlobalListener(facade.documentListeners, type, listener);
			},
			removeEventListener(type, listener) {
				facade.removeGlobalListener(facade.documentListeners, type, listener);
			},
			dispatchEvent(event) {
				return facade.dispatchDocumentEvent(event);
			},
		};
		view.document = this.document;
		this.window = view;
	}

	element(source: HostElement): BrowserElement {
		const owner = getElementHost(source);
		if (owner !== this.host) throw new CrossHostBrowserNodeError(this.host, source);
		const element = source as BrowserElement;
		if (this.decorated.has(element)) return element;
		this.decorated.add(element);
		const host = this.host;
		const style = createStyle(host, element);
		Object.assign(element, {
			nodeType: 1,
			nodeName: element === host.element ? 'HTML' : element.name.toUpperCase(),
			tagName: element === host.element ? 'HTML' : element.name.toUpperCase(),
			ownerDocument: this.document,
			scrollLeft: 0,
			scrollTop: 0,
		});
		Object.defineProperties(element, {
			clientWidth: {
				get: () => (element === host.element ? host.viewport.width : element.offsetWidth),
			},
			clientHeight: {
				get: () => (element === host.element ? host.viewport.height : element.offsetHeight),
			},
			scrollWidth: { get: () => element.clientWidth },
			scrollHeight: { get: () => element.clientHeight },
			offsetWidth: { configurable: true, get: () => element.getBoundingClientRect().width },
			offsetHeight: { configurable: true, get: () => element.getBoundingClientRect().height },
			value: {
				configurable: true,
				get: () => element.properties.value ?? '',
				set: (value: unknown) => host.setProperty(element, 'value', value),
			},
			checked: {
				configurable: true,
				get: () => Boolean(element.properties.checked),
				set: (value: unknown) => host.setProperty(element, 'checked', Boolean(value)),
			},
			disabled: {
				configurable: true,
				get: () => Boolean(element.properties.disabled),
				set: (value: unknown) => host.setProperty(element, 'disabled', Boolean(value)),
			},
			tabIndex: {
				configurable: true,
				get: () => Number(element.properties.tabIndex ?? -1),
				set: (value: unknown) => host.setProperty(element, 'tabIndex', Number(value)),
			},
			style: {
				configurable: true,
				get: () => style,
				set: (value: unknown) => host.setProperty(element, 'style', value),
			},
		});
		element.getBoundingClientRect = () => this.getBoundingClientRect(element);
		element.getClientRects = () => (element.isConnected ? [element.getBoundingClientRect()] : []);
		element.dispatchEvent = (event) => this.dispatchDOMEvent(element, event);
		element.setPointerCapture = (pointerId) => this.setPointerCapture(element, pointerId);
		element.releasePointerCapture = (pointerId) => this.releasePointerCapture(element, pointerId);
		element.hasPointerCapture = (pointerId) => this.hasPointerCapture(element, pointerId);
		element.querySelector = (selector) => queryElements(element, selector)[0] ?? null;
		element.querySelectorAll = (selector) => queryElements(element, selector);
		element.compareDocumentPosition = (other) =>
			compareDocumentPosition(element, this.element(other));
		element.matches = (selector) => matchesSelector(element, selector);
		element.closest = (selector) => {
			for (let current: BrowserElement | null = element; current; current = current.parentElement)
				if (matchesSelector(current, selector)) return current;
			return null;
		};
		element.getRootNode = () => this.document;
		const cloneNode = element.cloneNode;
		element.cloneNode = (deep = false) => {
			const clone = this.element(cloneNode(deep));
			if (clone.properties.style)
				host.setProperty(clone, 'style', {
					...(clone.properties.style as Record<string, unknown>),
				});
			return clone;
		};
		element.getAttribute = (name) => {
			name = attributeName(name);
			if (!Object.prototype.hasOwnProperty.call(element.properties, name)) return null;
			const value = element.properties[name];
			if (booleanAttributes.has(name)) return value ? '' : null;
			return value == null ? null : String(value);
		};
		element.setAttribute = (name, value) => {
			name = attributeName(name);
			host.setProperty(element, name, booleanAttributes.has(name) ? true : String(value));
		};
		element.removeAttribute = (name) => host.setProperty(element, attributeName(name), undefined);
		element.hasAttribute = (name) => element.getAttribute(name) !== null;
		element.toggleAttribute = (name, force) => {
			const present = force ?? !element.hasAttribute(name);
			if (present) element.setAttribute(name, '');
			else element.removeAttribute(name);
			return present;
		};
		const nativeListeners = new WeakMap<Function, Map<string, HostEventListener<HostEventType>>>();
		element.addEventListener = (
			type: string,
			listener: HostEventListener<HostEventType> | HostDOMEventListener,
		) => {
			let types = nativeListeners.get(listener);
			if (!types) nativeListeners.set(listener, (types = new Map()));
			let wrapped = types.get(type);
			if (!wrapped) {
				wrapped = (event) => {
					const native = event.nativeEvent as HostDOMEvent | undefined;
					if (native) native.currentTarget = element;
					Reflect.apply(listener, element, [native ?? event]);
				};
				types.set(type, wrapped);
			}
			EventApi.at(host.root).addEventListener(element, normalizeDOMEventType(type), wrapped);
		};
		element.removeEventListener = (
			type: string,
			listener: HostEventListener<HostEventType> | HostDOMEventListener,
		) => {
			const wrapped = nativeListeners.get(listener)?.get(type);
			if (wrapped)
				EventApi.at(host.root).removeEventListener(element, normalizeDOMEventType(type), wrapped);
			else
				EventApi.at(host.root).removeEventListener(
					element,
					type as HostEventType,
					listener as HostEventListener<HostEventType>,
				);
		};
		for (const child of element.childNodes) {
			if (child.type === 'element') this.element(child);
			else this.literal(child);
		}
		return element;
	}

	literal(value: HostLiteral): BrowserLiteral {
		const owner = getElementHost(value);
		if (owner !== this.host) throw new CrossHostBrowserNodeError(this.host, value);
		const literal = value as BrowserLiteral;
		if (this.decorated.has(literal)) return literal;
		this.decorated.add(literal);
		Object.assign(literal, { nodeType: 3, nodeName: '#text', ownerDocument: this.document });
		Object.defineProperties(
			literal,
			Object.fromEntries(
				['nodeValue', 'data'].map((name) => [
					name,
					{
						get: () => literal.content,
						set: (content: string) => this.host.setText(literal, String(content)),
					},
				]),
			),
		);
		return literal;
	}

	getBoundingClientRect(element: HostElement): HostRect {
		const bounds = this.host.getBounds(element) ?? { x: 0, y: 0, width: 0, height: 0 };
		return {
			...bounds,
			top: bounds.y,
			right: bounds.x + bounds.width,
			bottom: bounds.y + bounds.height,
			left: bounds.x,
			toJSON() {
				return { x: this.x, y: this.y, width: this.width, height: this.height };
			},
		};
	}

	dispatchDOMEvent(source: HostElement, event: HostDOMEvent): boolean {
		let element = this.element(source);
		if (event.type.startsWith('pointer'))
			element = this.pointerCaptures.get(event.pointerId) ?? element;
		event.target = element;
		const hostEvent = {
			...event,
			type: normalizeDOMEventType(event.type),
			target: element,
			currentTarget: undefined,
			nativeEvent: event,
			stopPropagation() {
				event.stopPropagation();
				this.cancelBubble = true;
			},
			preventDefault() {
				event.preventDefault();
				this.defaultPrevented = event.defaultPrevented;
			},
		} as AnyHostEvent;
		try {
			const result = EventApi.at(element.node ?? this.host.root).emit(hostEvent);
			if (result.stopped) event.cancelBubble = true;
		} finally {
			event.currentTarget = null;
		}
		return !event.defaultPrevented;
	}

	dispatchEvent(event: AnyHostEvent, deliver: (event: AnyHostEvent) => EventResult): EventResult {
		const type = nativeEventTypes[event.type];
		if (!type && !event.nativeEvent) return deliver(event);
		const native =
			(event.nativeEvent as HostDOMEvent | undefined) ??
			new HostDOMEvent(type!, {
				...Object.fromEntries(
					Object.entries(event).filter(
						([name, value]) =>
							!['type', 'target', 'currentTarget', 'nativeEvent'].includes(name) &&
							typeof value !== 'function',
					),
				),
				bubbles: event.bubbles ?? true,
				cancelable: true,
			});
		event.bubbles = native.bubbles = event.bubbles ?? native.bubbles;
		let element = this.element(event.target);
		if (native.type.startsWith('pointer'))
			element = this.pointerCaptures.get(native.pointerId) ?? element;
		event.target = element;
		event.nativeEvent = native;
		native.target = element;
		native.cancelBubble ||= event.cancelBubble ?? false;
		native.defaultPrevented ||= event.defaultPrevented ?? false;
		Object.defineProperties(event, {
			cancelBubble: {
				configurable: true,
				get: () => native.cancelBubble,
				set: (value: boolean) => {
					native.cancelBubble = value;
				},
			},
			defaultPrevented: {
				configurable: true,
				get: () => native.defaultPrevented,
				set: (value: boolean) => {
					native.defaultPrevented = value;
				},
			},
			currentTarget: {
				configurable: true,
				get: () => native.currentTarget ?? undefined,
				set: (target: HostElement | undefined) => {
					native.currentTarget = target ? this.element(target) : null;
				},
			},
		});
		event.stopPropagation = () => native.stopPropagation();
		event.preventDefault = () => native.preventDefault();
		let result: EventResult;
		try {
			result = deliver(event);
			if (result.stopped) native.cancelBubble = true;
		} finally {
			native.currentTarget = null;
		}
		if (element.isConnected && native.bubbles && !native.cancelBubble)
			this.dispatchDocumentEvent(native);
		if (
			native.type === 'click' &&
			!native.defaultPrevented &&
			element.name === 'input' &&
			(element.properties.type === 'checkbox' || element.properties.type === 'radio')
		) {
			this.host.setProperty(element, 'checked', !element.properties.checked);
			this.dispatchDOMEvent(element, new HostDOMEvent('input', { bubbles: true }));
			this.dispatchDOMEvent(element, new HostDOMEvent('change', { bubbles: true }));
		}
		return { handled: result.handled, stopped: result.stopped || native.cancelBubble };
	}

	dispatchDocumentEvent(event: HostDOMEvent): boolean {
		this.dispatchGlobalEvent(this.documentListeners, event, this.document);
		if (event.bubbles && !event.cancelBubble) this.dispatchWindowEvent(event);
		return !event.defaultPrevented;
	}

	dispatchWindowEvent(event: HostDOMEvent): boolean {
		return this.dispatchGlobalEvent(this.windowListeners, event, this.document.defaultView);
	}
	setPointerCapture(element: HostElement, pointerId: number): void {
		this.pointerCaptures.set(pointerId, this.element(element));
	}
	releasePointerCapture(element: HostElement, pointerId: number): void {
		if (this.pointerCaptures.get(pointerId) === element) this.pointerCaptures.delete(pointerId);
	}
	hasPointerCapture(element: HostElement, pointerId: number): boolean {
		return this.pointerCaptures.get(pointerId) === element;
	}

	private addGlobalListener(
		target: Map<string, Set<HostDOMEventListener>>,
		type: string,
		listener: HostDOMEventListener,
	): void {
		let listeners = target.get(type);
		if (!listeners) target.set(type, (listeners = new Set()));
		listeners.add(listener);
	}

	private removeGlobalListener(
		target: Map<string, Set<HostDOMEventListener>>,
		type: string,
		listener: HostDOMEventListener,
	): void {
		const listeners = target.get(type);
		listeners?.delete(listener);
		if (listeners?.size === 0) target.delete(type);
	}

	private dispatchGlobalEvent(
		target: Map<string, Set<HostDOMEventListener>>,
		event: HostDOMEvent,
		currentTarget: HostDocument | HostWindow,
	): boolean {
		event.currentTarget = currentTarget;
		try {
			for (const listener of Array.from(target.get(event.type) ?? [])) listener(event);
		} finally {
			event.currentTarget = null;
		}
		return !event.defaultPrevented;
	}
}

const facades = new WeakMap<Host, BrowserFacade>();

/** Install browser compatibility once without registering elements or changing globals. */
export function installBrowserFacade(host: Host): BrowserFacade {
	const existing = facades.get(host);
	if (existing) return existing;
	const facade = new BrowserFacade(host);
	facades.set(host, facade);
	EventApi.decorate(host.root, () => ({
		dispatchEvent(event) {
			return facade.dispatchEvent(event, (adapted) => super.dispatchEvent(adapted));
		},
	}));
	HostApi.decorate(host.root, () => ({
		createElement(name, propertiesOrChild, ...children) {
			return facade.element(super.createElement(name, propertiesOrChild, ...children));
		},
		createLiteral(content) {
			return facade.literal(super.createLiteral(content));
		},
		insertBefore(parent, child, anchor) {
			this.validateInsertion(parent, child, anchor);
			facade.element(parent);
			if (child.type === 'element') facade.element(child);
			else facade.literal(child);
			return super.insertBefore(parent, child, anchor);
		},
	}));
	facade.element(host.element);
	return facade;
}

class CrossHostBrowserNodeError extends TypeError {
	readonly code = 'CLACK_UI_CROSS_HOST_BROWSER_NODE';
	readonly host: Host;
	readonly element: HostElementChild;

	constructor(host: Host, element: HostElementChild) {
		super('Cannot enhance a node owned by another Host with this browser facade');
		this.name = 'CrossHostBrowserNodeError';
		this.host = host;
		this.element = element;
	}
}

const booleanAttributes = new Set([
	'disabled',
	'checked',
	'hidden',
	'multiple',
	'required',
	'readOnly',
	'autoFocus',
]);

const nativeEventTypes: Record<string, string> = {
	click: 'click',
	change: 'change',
	input: 'input',
	focus: 'focus',
	blur: 'blur',
	pointerDown: 'pointerdown',
	pointerMove: 'pointermove',
	pointerUp: 'pointerup',
	pointerCancel: 'pointercancel',
};

function attributeName(name: string): string {
	return (
		(
			{
				class: 'className',
				tabindex: 'tabIndex',
				readonly: 'readOnly',
				autofocus: 'autoFocus',
			} as Record<string, string>
		)[name] ?? name
	);
}

function normalizeDOMEventType(type: string): HostEventType {
	return (
		(
			{
				pointerdown: 'pointerDown',
				pointermove: 'pointerMove',
				pointerup: 'pointerUp',
				pointercancel: 'pointerCancel',
			} as Record<string, HostEventType>
		)[type] ?? (type as HostEventType)
	);
}

function findElementById(root: BrowserElement, id: string): BrowserElement | null {
	if (root.properties.id === id) return root;
	for (const child of root.children) {
		const match = findElementById(child, id);
		if (match) return match;
	}
	return null;
}

function createStyle(host: Host, element: BrowserElement): HostStyle {
	const priorities = new Map<string, string>();
	const key = (name: string): string =>
		name.startsWith('--')
			? name
			: name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
	const read = (): Record<string, unknown> =>
		(element.properties.style as Record<string, unknown> | undefined) ?? {};
	const write = (name: string, value: unknown): void =>
		host.setProperty(element, 'style', { ...read(), [key(name)]: value });
	const methods = {
		setProperty(name: string, value: string | null, priority = '') {
			if (value == null || value === '') {
				this.removeProperty(name);
				return;
			}
			priorities.set(key(name), priority);
			write(name, value);
		},
		removeProperty(name: string) {
			const previous = this.getPropertyValue(name);
			const next = { ...read() };
			delete next[key(name)];
			priorities.delete(key(name));
			host.setProperty(element, 'style', next);
			return previous;
		},
		getPropertyValue: (name: string) => String(read()[key(name)] ?? ''),
		getPropertyPriority: (name: string) => priorities.get(key(name)) ?? '',
	};
	return new Proxy(methods as HostStyle, {
		get: (target, property) =>
			property in target ? Reflect.get(target, property) : (read()[property as string] ?? ''),
		set: (_target, property, value) => {
			write(String(property), value);
			return true;
		},
	});
}
