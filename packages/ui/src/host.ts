// oxlint-disable max-params
import { text, type Op } from '@bomb.sh/tty';
import { type Node, create, createApi, createContext, destroy, LifecycleApi } from './core.ts';
import {
	getElement,
	setElement,
	type HostElements,
	type HostElementChildInput,
	type HostElementChild,
	type HostElement,
	type HostLiteral,
} from './elements.ts';
import { installLayoutCache, invalidateLayout, LayoutApi, layout, layoutCached } from './layout.ts';
import { EmitApi, type EmitResult } from './emit.ts';
import type { HostEventType, HostEvents, HostEventListener } from './events.ts';

/** Set up a custom host element as it is created. */
export type ElementDefinition = (element: HostElement) => void;

export type HostElementProperties<Name extends string> = Name extends keyof HostElements
	? HostElements[Name]
	: Record<string, unknown>;

export interface Host {
	root: Node;
	element: HostElement;
	defineElement(name: string, define: ElementDefinition): void;
	createElement<Name extends string>(name: Name, ...children: HostElementChildInput[]): HostElement;
	createElement<Name extends string>(
		name: Name,
		properties: HostElementProperties<Name>,
		...children: HostElementChildInput[]
	): HostElement;
	createLiteral(content: string): HostLiteral;
	insertBefore(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void;
	removeChild(parent: HostElement, child: HostElementChild): void;
	setProperty(element: HostElement, name: string, value: unknown): void;
	setText(text: HostLiteral, content: string): void;
	addEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void;
	removeEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void;
}

export function createHost(): Host {
	const root = create();
	const element = {
		type: 'element',
		name: 'root',
		node: root,
		parent: null,
		properties: {},
		children: [],
	} as HostElement;
	const definitions = new Map<string, ElementDefinition>();

	const host: Host = {
		root,
		element,
		defineElement(name, define) {
			definitions.set(name, define);
		},
		createElement(name, propertiesOrChild?, ...children) {
			const created = HostApi.methods.createElement(root, name);
			const properties = isProperties(propertiesOrChild) ? propertiesOrChild : undefined;
			const initialChildren = properties ? children : [propertiesOrChild, ...children];

			if (properties) {
				for (const [property, value] of Object.entries(properties)) {
					host.setProperty(created, property, value);
				}
			}
			appendChildren(host, created, initialChildren);
			return created;
		},
		createLiteral(content) {
			return HostApi.methods.createLiteral(root, content);
		},
		insertBefore(parent, child, anchor) {
			return HostApi.methods.insertBefore(root, parent, child, anchor);
		},
		removeChild(parent, child) {
			return HostApi.methods.removeChild(root, parent, child);
		},
		setProperty(target, name, value) {
			return HostApi.methods.setProperty(root, target, name, value);
		},
		setText(text, value) {
			return HostApi.methods.setText(root, text, value);
		},
		addEventListener(target, type, listener) {
			return HostApi.methods.addEventListener(root, target, type, listener);
		},
		removeEventListener(target, type, listener) {
			return HostApi.methods.removeEventListener(root, target, type, listener);
		},
	};

	bindElement(host, element);

	setElement(root, element);
	installRootLayout(root, element);
	installElementLayout(host);

	// Definitions are middleware so framework adapters, which use HostApi
	// directly, receive the same custom-element behavior as host.createElement.
	HostApi.around(root, {
		createElement([node, name], next) {
			const created = next(node, name);
			bindElement(host, created);
			definitions.get(name)?.(created);
			return created;
		},
	});

	LifecycleApi.around(root, {
		destroy([node], next) {
			const element = getElement(node);
			if (element.detach) {
				element.detach(node);
			}
			element.node = null;
			return next(node);
		},
	});

	EmitApi.around(root, {
		emit([node, event], next): EmitResult {
			next(node, event);
			return dispatchHostEvent(node, event);
		},
	});

	HostContext.set(root, host);
	ListenerContext.set(root, new WeakMap());
	installLayoutCache(root);
	return host;
}

/** Render children of custom elements that do not install their own layout. */
function installElementLayout(host: Host): void {
	if (elementLayoutHosts.has(host)) return;
	elementLayoutHosts.add(host);

	LayoutApi.around(host.root, {
		layout([node], next) {
			const element = getElement(node);
			if (element.name === 'root') {
				return next(node);
			}
			return layoutCached(node, () => layoutElement(element, node));
		},
	});

	HostApi.around(host.root, {
		insertBefore([root, parent, child, anchor], next) {
			const originalParentNode = child.parent?.node;
			next(root, parent, child, anchor);
			if (originalParentNode) invalidateLayout(originalParentNode);
			if (parent.node) invalidateLayout(parent.node);
		},
		removeChild([root, parent, child], next) {
			next(root, parent, child);
			if (parent.node) invalidateLayout(parent.node);
		},
		setProperty([root, element, name, value], next) {
			next(root, element, name, value);
			if (element.node) invalidateLayout(element.node);
		},
		setText([root, text, content], next) {
			const previous = text.content;
			next(root, text, content);
			if (previous !== text.content && text.parent?.node) {
				invalidateLayout(text.parent.node);
			}
		},
	});
}

const elementLayoutHosts = new WeakSet<Host>();

export const HostApi = createApi('host', {
	createElement(node, name: string): HostElement {
		return {
			type: 'element',
			name,
			node: null,
			parent: null,
			properties: {},
			children: [],
		} as HostElement;
	},
	createLiteral(node, content: string): HostLiteral {
		return { type: 'literal', content };
	},
	insertBefore(
		node,
		parent: HostElement,
		child: HostElementChild,
		anchor?: HostElementChild,
	): void {
		if (child.parent !== parent) {
			if (child.type === 'element') {
				detach(child);

				if (isAttached(parent)) {
					attach(parent, child);
				}
			}
		}
		if (child.parent) {
			const currentIndex = child.parent.children.indexOf(child);
			child.parent.children.splice(currentIndex, 1);
		}
		const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
		parent.children.splice(index, 0, child);
		child.parent = parent;
	},
	removeChild(root, parent: HostElement, child: HostElementChild): void {
		if (child.parent === parent) {
			child.parent = null;
			parent.children.splice(parent.children.indexOf(child), 1);
			if (child.type === 'element') {
				detach(child);
			}
		}
	},
	setProperty(node, element: HostElement, name: string, value: unknown): void {
		const eventType = getEventPropertyType(name);
		if (eventType) {
			const previous = element.properties[name];
			if (typeof previous === 'function') {
				HostApi.methods.removeEventListener(
					node,
					element,
					eventType,
					previous as HostEventListener<HostEventType>,
				);
			}
			if (typeof value === 'function') {
				HostApi.methods.addEventListener(
					node,
					element,
					eventType,
					value as HostEventListener<HostEventType>,
				);
			}
			if (typeof value === 'undefined') {
				delete element.properties[name];
			} else {
				element.properties[name] = value;
			}
			return;
		}

		const previous = element.properties[name];
		if (typeof value === 'undefined') {
			delete element.properties[name];
		} else {
			element.properties[name] = value;
		}
		if (!Object.is(previous, value)) {
			element.propertyChanged?.({ name, previous, value });
		}
	},

	setText(node, text: HostLiteral, content: string): void {
		if (text.content !== content) text.content = content;
	},

	getHost(node): Host {
		return HostContext.expect(node);
	},

	addEventListener(node, element, type, listener): void {
		const map = ListenerContext.expect(node);
		let types = map.get(element);
		if (!types) {
			map.set(element, (types = new Map()));
		}
		let listeners = types.get(type);
		if (!listeners) {
			types.set(type, (listeners = new Set()));
		}
		listeners.add(listener);
	},

	removeEventListener(node, element, type, listener): void {
		const map = ListenerContext.expect(node);
		const types = map.get(element);
		if (types) {
			const listeners = types.get(type);
			if (listeners) {
				listeners.delete(listener);
				if (listeners.size === 0) {
					types.delete(type);
				}
			}
			if (types.size === 0) {
				map.delete(element);
			}
		}
	},
});

const HostContext = createContext<Host>('host');
const ListenerContext =
	createContext<WeakMap<HostElement, Map<string, Set<HostEventListener<keyof HostEvents>>>>>(
		'listeners',
	);

function isAttached(element: HostElement): boolean {
	return !!element.node;
}

function bindElement(host: Host, element: HostElement): void {
	Object.defineProperty(element, 'textContent', {
		configurable: true,
		get: () => getTextContent(element),
		set: (value: string) => {
			const child = element.children.length === 1 ? element.children[0] : undefined;
			if (value !== '' && child?.type === 'literal') {
				host.setText(child, value);
			} else {
				element.replaceChildren(value === '' ? [] : value);
			}
		},
	});
	element.createElement = (name, propertiesOrChild?, ...children) => {
		if (isProperties(propertiesOrChild)) {
			return host.createElement(name, propertiesOrChild, ...children);
		}
		return host.createElement(name, propertiesOrChild, ...children);
	};
	element.append = (...children) => appendChildren(host, element, children);
	element.prepend = (...children) => {
		const anchor = element.children[0];
		for (const child of normalizeChildren(host, children)) {
			host.insertBefore(element, child, anchor);
		}
	};
	element.replaceChildren = (...children) => {
		for (const child of element.children.slice()) {
			host.removeChild(element, child);
		}
		appendChildren(host, element, children);
	};
	element.remove = () => {
		if (element.parent) {
			host.removeChild(element.parent, element);
		}
	};
	element.setProperty = (name, value) => host.setProperty(element, name, value);
	element.addEventListener = (type, listener) => host.addEventListener(element, type, listener);
	element.removeEventListener = (type, listener) =>
		host.removeEventListener(element, type, listener);
}

function getTextContent(element: HostElement): string {
	let content = '';
	for (const child of element.children) {
		content += child.type === 'literal' ? child.content : getTextContent(child);
	}
	return content;
}

function appendChildren(
	host: Host,
	parent: HostElement,
	children: readonly HostElementChildInput[],
): void {
	for (const child of normalizeChildren(host, children)) {
		host.insertBefore(parent, child);
	}
}

function normalizeChildren(
	host: Host,
	children: readonly HostElementChildInput[],
): HostElementChild[] {
	const normalized: HostElementChild[] = [];
	for (const child of children) {
		if (Array.isArray(child)) {
			normalized.push(...normalizeChildren(host, child));
		} else if (child === null || child === undefined || typeof child === 'boolean') {
			continue;
		} else if (typeof child === 'string' || typeof child === 'number') {
			normalized.push(host.createLiteral(String(child)));
		} else {
			normalized.push(child);
		}
	}
	return normalized;
}

function isProperties(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value) && !isHostChild(value);
}

function dispatchHostEvent(node: Node, event: HostEvents[HostEventType]): EmitResult {
	event.bubbles ??= true;
	event.cancelBubble ??= false;
	event.stopPropagation ??= () => {
		event.cancelBubble = true;
	};

	const root = HostApi.methods.getHost(node).root;
	let handled = false;
	let current: Node | undefined = node;
	while (current) {
		event.currentTarget = getElement(current);
		const map = ListenerContext.expect(current);
		const listeners = map.get(event.currentTarget)?.get(event.type);
		if (listeners) {
			handled ||= listeners.size > 0;
			for (const listener of Array.from(listeners)) {
				listener(event);
			}
		}
		if (!event.bubbles || event.cancelBubble || current === root) break;
		current = current.parent;
	}
	event.currentTarget = undefined;
	return { handled, stopped: event.cancelBubble === true };
}

function getEventPropertyType(name: string): HostEventType | undefined {
	if (!name.startsWith('on') || name.length <= 2) return;

	const suffix = name.slice(2);
	const first = suffix[0];
	const type = first === first.toUpperCase() ? first.toLowerCase() + suffix.slice(1) : suffix;
	return type as HostEventType;
}

function isHostChild(value: object): value is HostElementChild {
	return 'type' in value && (value.type === 'element' || value.type === 'literal');
}

function attach(parent: HostElement, child: HostElement): void {
	child.node = create(parent.node!);
	setElement(child.node, child);

	if (child.attach) {
		child.attach(child.node);
	}
	for (const grandchild of child.children) {
		if (grandchild.type === 'element' && grandchild.node === null) {
			attach(child, grandchild);
		}
	}
}

function detach(child: HostElement): void {
	if (child.node) {
		destroy(child.node);
	}
}

function installRootLayout(root: Node, element: HostElement): void {
	LayoutApi.around(root, {
		layout([node], next) {
			if (node !== root) {
				return next(node);
			}
			return layoutElementChildren(element);
		},
	});
}

function layoutElement(element: HostElement, node: Node): Iterable<Op> {
	const primitive = element.layout?.(node);
	if (primitive) return primitive;
	return layoutElementChildren(element);
}

function layoutElementChildren(element: HostElement): Op[] {
	const operations: Op[] = [];
	let content = '';
	for (const child of element.children) {
		if (child.type === 'element') {
			if (content !== '') {
				operations.push(text(content));
				content = '';
			}
			for (const operation of layout(child.node!)) {
				operations.push(operation);
			}
		} else {
			content += child.content;
		}
	}
	if (content !== '') {
		operations.push(text(content));
	}
	return operations;
}
