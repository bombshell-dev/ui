import type { Host } from './host.ts';
import { installBrowserFacade } from './browser-facade.ts';
import {
	HostDOMEvent,
	type HostDOMEventListener,
	type BrowserElement,
	type HostWindow,
} from './browser-types.ts';

type DOMGlobals = {
	window: HostWindow;
	document: HostWindow['document'];
	Element: Function;
	HTMLElement: Function;
	Node: Function;
	PointerEvent: HostWindow['PointerEvent'];
	Event: typeof HostDOMEvent;
	ResizeObserver: typeof HostResizeObserver;
	requestAnimationFrame: HostWindow['requestAnimationFrame'];
	cancelAnimationFrame: HostWindow['cancelAnimationFrame'];
	getComputedStyle: HostWindow['getComputedStyle'];
};

const globalNames = [
	'window',
	'document',
	'Element',
	'HTMLElement',
	'Node',
	'PointerEvent',
	'Event',
	'ResizeObserver',
	'requestAnimationFrame',
	'cancelAnimationFrame',
	'getComputedStyle',
] as const satisfies readonly (keyof DOMGlobals)[];

let activeHost: Host | undefined;
let activeReleases = 0;
let previousGlobals: Map<keyof DOMGlobals, PropertyDescriptor | undefined> | undefined;

/** Install the one-Host global DOM bridge before importing libraries that test for `document`. */
export function installDOMGlobals(host: Host): () => void {
	const target = globalThis as unknown as Record<string, unknown>;
	if (activeHost && activeHost !== host) {
		throw new MultipleHostDOMGlobalsError();
	}
	const api = installBrowserFacade(host);
	if (!activeHost && (target.document !== undefined || target.window !== undefined)) {
		return () => {};
	}
	if (!activeHost) {
		activeHost = host;
		activeReleases = 0;
		previousGlobals = new Map(
			globalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
		);
		const Element = hostConstructor((value) => isHostElement(value));
		const Node = hostConstructor(
			(value) =>
				isHostElement(value) ||
				(typeof value === 'object' &&
					value !== null &&
					'type' in value &&
					value.type === 'literal' &&
					'nodeType' in value &&
					value.nodeType === 3),
		);
		Object.assign(Node, {
			ELEMENT_NODE: 1,
			TEXT_NODE: 3,
			DOCUMENT_NODE: 9,
			DOCUMENT_POSITION_DISCONNECTED: 1,
			DOCUMENT_POSITION_PRECEDING: 2,
			DOCUMENT_POSITION_FOLLOWING: 4,
			DOCUMENT_POSITION_CONTAINS: 8,
			DOCUMENT_POSITION_CONTAINED_BY: 16,
			DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
		});
		const PointerEvent = class extends HostDOMEvent {};
		const ResizeObserver = HostResizeObserver;
		const window = api.document.defaultView;
		Object.assign(window, {
			Element,
			HTMLElement: Element,
			Node,
			PointerEvent,
			Image: function Image(width?: number, height?: number) {
				return createHostImage(host, { width, height });
			},
			getComputedStyle: (element: BrowserElement) => computedStyle(element),
			requestAnimationFrame: (callback: (time: number) => void) =>
				setTimeout(() => callback(performance.now()), 16) as unknown as number,
			cancelAnimationFrame: (id: number) => clearTimeout(id),
		});
		const globals: DOMGlobals = {
			window,
			document: api.document,
			Element,
			HTMLElement: Element,
			Node,
			PointerEvent,
			Event: HostDOMEvent,
			ResizeObserver,
			requestAnimationFrame: window.requestAnimationFrame,
			cancelAnimationFrame: window.cancelAnimationFrame,
			getComputedStyle: window.getComputedStyle,
		};
		for (const name of globalNames) {
			Object.defineProperty(target, name, {
				configurable: true,
				writable: true,
				value: globals[name],
			});
		}
	}
	activeReleases++;
	let released = false;
	return () => {
		if (released || activeHost !== host) return;
		released = true;
		activeReleases--;
		if (activeReleases > 0) return;
		for (const name of globalNames) {
			const descriptor = previousGlobals?.get(name);
			if (descriptor) Object.defineProperty(target, name, descriptor);
			else Reflect.deleteProperty(target, name);
		}
		activeHost = undefined;
		previousGlobals = undefined;
	};
}

class HostResizeObserver {
	constructor(_callback: (entries: unknown[]) => void) {}

	observe(_target: unknown): void {}

	unobserve(_target: unknown): void {}

	disconnect(): void {}
}

function createHostImage(
	host: Host,
	{ width, height }: { width?: number; height?: number },
): BrowserElement {
	const image = installBrowserFacade(host).element(host.createElement('img'));
	const listeners = new Map<string, Set<HostDOMEventListener>>();
	let request = 0;
	let complete = true;
	Object.assign(image, { onload: null, onerror: null, naturalWidth: 0, naturalHeight: 0 });
	if (width !== undefined) image.setProperty('width', width);
	if (height !== undefined) image.setProperty('height', height);
	Object.defineProperty(image, 'complete', { get: () => complete });
	for (const property of ['src', 'srcset', 'sizes', 'crossOrigin', 'referrerPolicy']) {
		Object.defineProperty(image, property, {
			configurable: true,
			get: () => image.properties[property] ?? (property === 'crossOrigin' ? null : ''),
			set(value: unknown) {
				image.setProperty(property, value);
				if (property !== 'src' && property !== 'srcset') return;
				const currentRequest = ++request;
				complete = false;
				// The terminal Host has no image loader or decoder; never report invented pixels.
				queueMicrotask(() => {
					if (request !== currentRequest) return;
					complete = true;
					image.dispatchEvent(new HostDOMEvent('error'));
				});
			},
		});
	}
	// Preload images remain detached, so their events cannot rely on Host node traversal.
	Object.assign(image, {
		addEventListener(type: string, listener: HostDOMEventListener) {
			let callbacks = listeners.get(type);
			if (!callbacks) listeners.set(type, (callbacks = new Set()));
			callbacks.add(listener);
		},
		removeEventListener(type: string, listener: HostDOMEventListener) {
			listeners.get(type)?.delete(listener);
		},
		dispatchEvent(event: HostDOMEvent) {
			event.target = image;
			event.currentTarget = image;
			try {
				const callback = Reflect.get(image, `on${event.type}`);
				if (typeof callback === 'function') callback.call(image, event);
				for (const listener of Array.from(listeners.get(event.type) ?? [])) {
					listener.call(image, event);
				}
			} finally {
				event.currentTarget = null;
			}
			return !event.defaultPrevented;
		},
	});
	return image;
}

class MultipleHostDOMGlobalsError extends Error {
	constructor() {
		super('Only one Host can own the process-global DOM facade at a time');
		this.name = 'MultipleHostDOMGlobalsError';
	}
}

function hostConstructor(check: (value: unknown) => boolean): Function {
	class HostDOMNode {}
	Object.defineProperty(HostDOMNode, Symbol.hasInstance, { value: check });
	return HostDOMNode;
}

function isHostElement(value: unknown): value is BrowserElement {
	return (
		typeof value === 'object' &&
		value !== null &&
		'value' in value &&
		'nodeType' in value &&
		(value as BrowserElement).type === 'element'
	);
}

function computedStyle(element: BrowserElement): Record<string, unknown> {
	const style = element.style;
	return new Proxy(
		{
			direction: element.properties.dir ?? 'ltr',
			display: 'block',
			position: 'static',
			visibility: 'visible',
			overflow: 'visible',
			overflowX: 'visible',
			overflowY: 'visible',
			boxSizing: 'content-box',
			transform: 'none',
			animationName: 'none',
			animationDuration: '0s',
			transitionDuration: '0s',
			marginTop: '0px',
			marginRight: '0px',
			marginBottom: '0px',
			marginLeft: '0px',
			borderInlineStartWidth: '0px',
			borderInlineEndWidth: '0px',
			borderLeftWidth: '0px',
			borderRightWidth: '0px',
			borderTopWidth: '0px',
			borderBottomWidth: '0px',
			paddingInlineStart: '0px',
			paddingInlineEnd: '0px',
			paddingLeft: '0px',
			paddingRight: '0px',
			paddingTop: '0px',
			paddingBottom: '0px',
		},
		{
			get(target, property) {
				if (property === 'getPropertyValue') {
					return (name: string) => {
						const inline = style.getPropertyValue(name);
						if (inline !== '') return inline;
						const key = name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
						return target[key as keyof typeof target] ?? '';
					};
				}
				const inline = style[property as string];
				return inline !== '' && inline !== undefined
					? inline
					: (target[property as keyof typeof target] ?? '');
			},
		},
	);
}
