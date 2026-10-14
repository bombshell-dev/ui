// oxlint-disable max-params bombshell-dev/max-params -- Host mutations pass their parent, child, and anchor explicitly.
import { text, type Op, type RenderInfo } from '@bomb.sh/tty';
import { type Node, lifecycle, LifecycleApi } from './core.ts';
import {
	getElement,
	getElementHost,
	setElement,
	setElementHost,
	type HostElementChild,
	type HostElementChildInput,
	type HostElement,
	type HostLiteral,
} from './elements.ts';
import { invalidateLayout, layout, LayoutApi } from './layout.ts';
import { type HostEventType, type HostEventListener } from './events.ts';
import { Api } from './core/api.ts';
import { EventApi, emit } from './event-api.ts';
import { FocusApi } from './focus.ts';

export type ElementDefinition = (element: HostElement) => void;
export interface HostBounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Host nodes cannot be adopted by another Host or inserted through its API. */
export class CrossHostInsertionError extends TypeError {
	readonly code = 'CLACK_UI_CROSS_HOST_INSERTION';
	readonly host: Host;
	readonly parent: HostElement;
	readonly child: HostElementChild;

	constructor(host: Host, parent: HostElement, child: HostElementChild) {
		super(
			'Cannot insert nodes across Hosts: the parent, child, child container, and anchor must belong to the receiving Host',
		);
		this.name = 'CrossHostInsertionError';
		this.host = host;
		this.parent = parent;
		this.child = child;
	}
}

export interface Host {
	root: Node;
	element: HostElement;
	viewport: { width: number; height: number };
	renderInfo: RenderInfo | undefined;
	setRenderInfo(info: RenderInfo): void;
	getBounds(element: HostElement): HostBounds | undefined;
	defineElement(name: string, define: ElementDefinition): void;
	createElement(
		name: string,
		propertiesOrChild?: Record<string, unknown> | HostElementChildInput,
		...children: HostElementChildInput[]
	): HostElement;
	createLiteral(content: string): HostLiteral;
	insertBefore(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void;
	removeChild(parent: HostElement, child: HostElementChild): void;
	setProperty(element: HostElement, name: string, value: unknown): void;
	setText(text: HostLiteral, content: string): void;
	focus(element: HostElement): void;
	blur(element: HostElement): void;
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

export class HostApi extends Api implements Host {
	root: Node;
	element: HostElement;
	viewport = { width: 80, height: 24 };
	renderInfo: RenderInfo | undefined;
	definitions = new Map<string, ElementDefinition>();

	constructor(root: Node) {
		super(root);
		this.root = root;
		this.element = {
			type: 'element',
			name: 'root',
			node: root,
			parent: null,
			properties: {},
			childNodes: [],
		} as unknown as HostElement;
		const { element } = this;
		// Resolve the stable API handle lazily: init has not published it during construction.
		bindElement(() => HostApi.at(root), element);
		setElement(root, element);
		EventApi.init(root);
		LifecycleApi.decorate(root, () => ({
			destroy(node) {
				const element = getElement(node);
				element.detach?.(node);
				element.node = null;
				return super.destroy(node);
			},
		}));
		LayoutApi.decorate(root, () => ({
			*layout() {
				if (this.node !== root) {
					const element = getElement(this.node);
					const ownLayout = element.layout?.(this.node);
					if (ownLayout) return yield* ownLayout;
					return yield* layoutChildren(element);
				}
				yield* layoutChildren(element);
			},
		}));
	}

	defineElement(name: string, define: ElementDefinition): void {
		this.definitions.set(name, define);
	}

	createElement(
		name: string,
		propertiesOrChild?: Record<string, unknown> | HostElementChildInput,
		...children: HostElementChildInput[]
	): HostElement {
		const element = {
			type: 'element',
			name,
			node: null,
			parent: null,
			properties: {},
			childNodes: [],
		} as unknown as HostElement;
		const host = this.getHost();
		bindElement(() => host, element);
		setElementHost(element, host);
		if (isProperties(propertiesOrChild)) {
			for (const [property, value] of Object.entries(propertiesOrChild))
				this.setProperty(element, property, value);
			appendChildren(host, element, children);
		} else {
			appendChildren(
				host,
				element,
				propertiesOrChild === undefined
					? children
					: [propertiesOrChild as HostElementChildInput, ...children],
			);
		}
		this.definitions.get(name)?.(element);
		return element;
	}

	createLiteral(content: string): HostLiteral {
		const host = this.getHost();
		const literal = { type: 'literal', parent: null, content } as unknown as HostLiteral;
		setElementHost(literal, host);
		Object.defineProperties(literal, {
			parentNode: { get: () => literal.parent ?? null },
			parentElement: { get: () => literal.parent ?? null },
			firstChild: { value: null },
			lastChild: { value: null },
			nextSibling: { get: () => sibling(literal, 1) },
			previousSibling: { get: () => sibling(literal, -1) },
			isConnected: { get: () => Boolean(literal.parent?.isConnected) },
			textContent: {
				get: () => literal.content,
				set: (value: string) => host.setText(literal, String(value)),
			},
		});
		literal.cloneNode = () => host.createLiteral(literal.content);
		return literal;
	}

	validateInsertion(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void {
		const host = this.getHost();
		if (
			getElementHost(parent) !== host ||
			getElementHost(child) !== host ||
			(parent.childrenContainer && getElementHost(parent.childrenContainer) !== host) ||
			(anchor && getElementHost(anchor) !== host)
		)
			throw new CrossHostInsertionError(host, parent, child);
	}

	insertBefore(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void {
		this.validateInsertion(parent, child, anchor);
		const target =
			parent.childrenContainer && parent.childrenContainer !== child
				? parent.childrenContainer
				: parent;
		const previousParentNode = child.parent?.node;
		if (child === anchor) return;
		const moving = child.parent !== target;
		let focusedElement: HostElement | undefined;
		if (moving && child.type === 'element' && child.node) {
			try {
				const current = getElement(FocusApi.at(child.node).getFocus());
				if (containsElement(child, current)) focusedElement = current;
			} catch {}
			detach(child);
		}
		if (child.parent) child.parent.childNodes.splice(child.parent.childNodes.indexOf(child), 1);
		const index = anchor ? target.childNodes.indexOf(anchor) : target.childNodes.length;
		target.childNodes.splice(index, 0, child);
		child.parent = target;
		if (moving && child.type === 'element' && target.node) attach(target, child);
		if (focusedElement?.node && !focusedElement.properties.disabled)
			FocusApi.at(focusedElement.node).setFocus(focusedElement.node, { force: true });
		if (previousParentNode) invalidateLayout(previousParentNode);
		if (target.node) invalidateLayout(target.node);
	}

	removeChild(parent: HostElement, child: HostElementChild): void {
		const target =
			parent.childrenContainer && child.parent === parent.childrenContainer
				? parent.childrenContainer
				: parent;
		if (child.parent === target) {
			if (target.node) invalidateLayout(target.node);
			child.parent = null;
			target.childNodes.splice(target.childNodes.indexOf(child), 1);
			if (child.type === 'element') detach(child);
		}
	}

	setProperty(element: HostElement, name: string, value: unknown): void {
		const previous = element.properties[name];
		const eventType = getEventPropertyType(name);
		if (eventType) {
			if (typeof previous === 'function')
				this.removeEventListener(element, eventType, previous as HostEventListener<HostEventType>);
			if (typeof value === 'function')
				this.addEventListener(element, eventType, value as HostEventListener<HostEventType>);
			if (typeof value === 'undefined') delete element.properties[name];
			else element.properties[name] = value;
			return;
		}
		if (typeof value === 'undefined') {
			const descriptor = Object.getOwnPropertyDescriptor(element.properties, name);
			if (descriptor?.set) element.properties[name] = undefined;
			else delete element.properties[name];
		} else element.properties[name] = value;
		if (!Object.is(previous, value)) element.propertyChanged?.({ name, previous, value });
		if (element.node) invalidateLayout(element.node);
	}

	setText(text: HostLiteral, content: string): void {
		if (text.parent?.node) invalidateLayout(text.parent.node);
		text.content = content;
	}

	focus(element: HostElement): void {
		if (element.node && !element.properties.disabled)
			FocusApi.at(element.node).setFocus(element.node, { force: true });
	}

	blur(element: HostElement): void {
		if (!element.node) return;
		const focus = FocusApi.at(element.node);
		if (focus.getFocus() === element.node) focus.setFocus(this.root);
	}

	setRenderInfo(info: RenderInfo): void {
		this.renderInfo = info;
	}

	getBounds(element: HostElement): HostBounds | undefined {
		if (element.node && this.renderInfo) {
			const bounds = this.renderInfo.get(LifecycleApi.at(element.node).id(element.node))?.bounds;
			if (bounds) return bounds;
		}
		let bounds: HostBounds | undefined;
		for (const child of element.children) bounds = unionBounds(bounds, this.getBounds(child));
		return bounds;
	}

	getHost(): Host {
		return HostApi.at(this.root);
	}

	addEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void {
		EventApi.at(this.root).addEventListener(element, type, listener);
	}

	removeEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void {
		EventApi.at(this.root).removeEventListener(element, type, listener);
	}
}

function* layoutChildren(element: HostElement): Iterable<Op> {
	let content = '';
	for (const child of element.childNodes) {
		if (child.type === 'element') {
			if (content !== '') {
				yield text(content);
				content = '';
			}
			yield* layout(child.node!);
		} else content += child.content;
	}
	if (content !== '') yield text(content);
}

export function createHost(): Host {
	const host = HostApi.init(lifecycle.create());
	setElementHost(host.element, host);
	return host;
}

function attach(parent: HostElement, child: HostElement): void {
	child.node = lifecycle.create(parent.node!);
	setElement(child.node, child);
	child.attach?.(child.node);
	if (!child.node) return;
	for (const grandchild of child.children) if (grandchild.node === null) attach(child, grandchild);
}

function detach(child: HostElement): void {
	if (child.node) LifecycleApi.at(child.node).destroy(child.node);
}

function bindElement(getHost: () => Host, element: HostElement): void {
	Object.defineProperties(element, {
		textContent: {
			configurable: true,
			get: () =>
				childrenTarget(element)
					.childNodes.map((child) => (child.type === 'literal' ? child.content : child.textContent))
					.join(''),
			set: (value: string) => {
				const target = childrenTarget(element);
				const only = target.childNodes.length === 1 ? target.childNodes[0] : undefined;
				if (value !== '' && only?.type === 'literal') getHost().setText(only, value);
				else replaceChildren(getHost(), target, value === '' ? [] : [value]);
			},
		},
		children: { get: () => element.childNodes.filter((child) => child.type === 'element') },
		isConnected: { configurable: true, get: () => element.node !== null },
		parentNode: { get: () => element.parent },
		parentElement: { configurable: true, get: () => element.parent },
		firstChild: { get: () => element.childNodes[0] ?? null },
		lastChild: { get: () => element.childNodes.at(-1) ?? null },
		nextSibling: { get: () => sibling(element, 1) },
		previousSibling: { get: () => sibling(element, -1) },
		firstElementChild: { get: () => element.children[0] ?? null },
		lastElementChild: { get: () => element.children.at(-1) ?? null },
		nextElementSibling: { get: () => elementSibling(element, 1) },
		previousElementSibling: { get: () => elementSibling(element, -1) },
	});
	element.createElement = (name, ...children) => getHost().createElement(name, ...children);
	element.append = (...children) => appendChildren(getHost(), childrenTarget(element), children);
	element.appendChild = (child) => {
		getHost().insertBefore(element, child);
		return child;
	};
	element.insertBefore = (child, anchor) => {
		getHost().insertBefore(element, child, anchor ?? undefined);
		return child;
	};
	element.removeChild = (child) => {
		getHost().removeChild(element, child);
		return child;
	};
	element.cloneNode = (deep = false) => {
		const properties = Object.fromEntries(
			Object.entries(element.properties).filter(([name]) => !getEventPropertyType(name)),
		);
		const clone = getHost().createElement(element.name, properties);
		if (deep)
			clone.append(...childrenTarget(element).childNodes.map((child) => child.cloneNode(true)));
		return clone;
	};
	element.prepend = (...children) => {
		const target = childrenTarget(element);
		const anchor = target.childNodes[0];
		for (const child of normalizeChildren(getHost(), children))
			getHost().insertBefore(target, child, anchor);
	};
	element.replaceChildren = (...children) =>
		replaceChildren(getHost(), childrenTarget(element), children);
	element.remove = () => {
		if (element.parent) getHost().removeChild(element.parent, element);
	};
	element.focus = () => getHost().focus(element);
	element.blur = () => getHost().blur(element);
	element.emit = (data) => emit(element, data);
	element.contains = (other) => containsElement(element, other);
	element.setProperty = (name, value) => getHost().setProperty(element, name, value);
	element.addEventListener = (type, listener) =>
		getHost().addEventListener(element, type, listener);
	element.removeEventListener = (type, listener) =>
		getHost().removeEventListener(element, type, listener);
}

function sibling(child: HostElementChild, direction: number): HostElementChild | null {
	const siblings = child.parent?.childNodes;
	return siblings?.[siblings.indexOf(child) + direction] ?? null;
}

function elementSibling(element: HostElement, direction: number): HostElement | null {
	const siblings = element.parent?.children;
	return siblings?.[siblings.indexOf(element) + direction] ?? null;
}

function childrenTarget(element: HostElement): HostElement {
	return element.childrenContainer ?? element;
}

function replaceChildren(
	host: Host,
	parent: HostElement,
	children: readonly HostElementChildInput[],
): void {
	for (const child of parent.childNodes.slice()) host.removeChild(parent, child);
	appendChildren(host, parent, children);
}

function appendChildren(
	host: Host,
	parent: HostElement,
	children: readonly HostElementChildInput[],
): void {
	for (const child of normalizeChildren(host, children)) host.insertBefore(parent, child);
}

function normalizeChildren(
	host: Host,
	children: readonly HostElementChildInput[],
): HostElementChild[] {
	const result: HostElementChild[] = [];
	for (const child of children) {
		if (Array.isArray(child))
			result.push(...normalizeChildren(host, child as readonly HostElementChildInput[]));
		else if (child == null || typeof child === 'boolean') continue;
		else if (typeof child === 'string' || typeof child === 'number')
			result.push(host.createLiteral(String(child)));
		else result.push(child as HostElementChild);
	}
	return result;
}

function isProperties(value: unknown): value is Record<string, unknown> {
	return (
		!!value &&
		typeof value === 'object' &&
		!Array.isArray(value) &&
		!('type' in value && (value.type === 'element' || value.type === 'literal'))
	);
}

function getEventPropertyType(name: string): HostEventType | undefined {
	if (!name.startsWith('on') || name.length <= 2) return;
	const suffix = name.slice(2);
	const first = suffix[0];
	if (!first) return;
	return (
		first === first.toUpperCase() ? first.toLowerCase() + suffix.slice(1) : suffix
	) as HostEventType;
}

function containsElement(parent: HostElement, child: HostElement): boolean {
	for (let current: HostElement | null = child; current; current = current.parent)
		if (current === parent) return true;
	return false;
}

function unionBounds(
	first: HostBounds | undefined,
	second: HostBounds | undefined,
): HostBounds | undefined {
	if (!first) return second;
	if (!second) return first;
	const x = Math.min(first.x, second.x);
	const y = Math.min(first.y, second.y);
	return {
		x,
		y,
		width: Math.max(first.x + first.width, second.x + second.width) - x,
		height: Math.max(first.y + first.height, second.y + second.height) - y,
	};
}
