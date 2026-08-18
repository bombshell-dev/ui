// oxlint-disable bombshell-dev/exported-function-async -- This is an internal synchronous renderer factory.
// oxlint-disable max-params -- Renderer option signatures are fixed by Vue.
import type { Host } from '@clack/ui';
import type { HostElement, HostElementChild, HostLiteral } from '@clack/ui/elements';
import type { HostEventListener, HostEventType } from '@clack/ui/events';
import {
	callWithAsyncErrorHandling,
	createRenderer as createVueRenderer,
	ErrorCodes,
	markRaw,
	type ComponentInternalInstance,
	type Renderer,
} from 'vue';

/** Create Vue renderer operations scoped to a single Host. */
export function createHostRenderer(host: Host): Renderer<HostElement> {
	return createVueRenderer<HostElementChild, HostElement>({
		patchProp(element, name, _previous, next, _namespace, parent) {
			updateProperty({ host, element, name, next, parent: parent ?? null });
		},
		insert(child, parent, anchor) {
			host.insertBefore(parent, child, anchor ?? undefined);
		},
		remove(child) {
			if (child.parent) host.removeChild(child.parent, child);
		},
		createElement(name) {
			return markRaw(host.createElement(name));
		},
		createText(content) {
			return markRaw(host.createLiteral(String(content)));
		},
		createComment() {
			return markRaw(host.createLiteral(''));
		},
		setText(literal, content) {
			host.setText(expectLiteral(literal, 'setText'), String(content));
		},
		setElementText(element, content) {
			setElementText({ host, element, content: String(content) });
		},
		parentNode(child) {
			return child.parent ?? null;
		},
		nextSibling(child) {
			const parent = child.parent;
			if (!parent) return null;
			return parent.children[parent.children.indexOf(child) + 1] ?? null;
		},
	});
}

class InvalidVueHostNodeError extends TypeError {
	readonly code = 'CLACK_VUE_INVALID_HOST_NODE';
	readonly operation: string;
	readonly child: HostElementChild;

	constructor(operation: string, child: HostElementChild) {
		super(`Vue renderer ${operation} received an element`);
		this.name = 'InvalidVueHostNodeError';
		this.operation = operation;
		this.child = child;
	}
}

function expectLiteral(child: HostElementChild, operation: string): HostLiteral {
	if (child.type !== 'literal') throw new InvalidVueHostNodeError(operation, child);
	return child;
}

function eventType(name: string): HostEventType | undefined {
	const first = name[2];
	if (!name.startsWith('on') || !first || first === first.toLowerCase()) return;
	return `${first.toLowerCase()}${name.slice(3)}` as HostEventType;
}

interface PropertyUpdate {
	host: Host;
	element: HostElement;
	name: string;
	next: unknown;
	parent: ComponentInternalInstance | null;
}

function updateProperty({ host, element, name, next, parent }: PropertyUpdate): void {
	const type = eventType(name);
	if (type) {
		updateEventListener({ host, element, type, value: next, parent });
	} else {
		// Vue uses null to signal a removed property.
		host.setProperty(element, name, next ?? undefined);
	}
}

interface ElementTextUpdate {
	host: Host;
	element: HostElement;
	content: string;
}

function setElementText({ host, element, content }: ElementTextUpdate): void {
	const [only] = element.children;
	if (content !== '' && element.children.length === 1 && only?.type === 'literal') {
		host.setText(only, content);
		return;
	}

	for (const child of element.children.slice()) host.removeChild(element, child);
	if (content !== '') host.insertBefore(element, markRaw(host.createLiteral(content)));
}

interface EventListenerUpdate {
	host: Host;
	element: HostElement;
	type: HostEventType;
	value: unknown;
	parent: ComponentInternalInstance | null;
}

function updateEventListener({ host, element, type, value, parent }: EventListenerUpdate): void {
	let listeners = eventListeners.get(element);
	const previous = listeners?.get(type);
	if (previous) {
		host.removeEventListener(element, type, previous);
		listeners!.delete(type);
	}

	if (isEventHandler(value)) {
		const listener: HostEventListener<HostEventType> = (event) => {
			callWithAsyncErrorHandling(value, parent, ErrorCodes.NATIVE_EVENT_HANDLER, [event]);
		};
		if (!listeners) eventListeners.set(element, (listeners = new Map()));
		listeners.set(type, listener);
		host.addEventListener(element, type, listener);
	}

	if (listeners?.size === 0) eventListeners.delete(element);
}

function isEventHandler(value: unknown): value is Function | Function[] {
	return (
		typeof value === 'function' ||
		(Array.isArray(value) && value.every((handler) => isEventHandler(handler)))
	);
}

const eventListeners = new WeakMap<
	HostElement,
	Map<HostEventType, HostEventListener<HostEventType>>
>();
