import { Api } from './core/api.ts';
import type { Node } from './core/node.ts';
import { getElement, getElementHost, type HostElement } from './elements.ts';
import type { AnyHostEvent, HostEventData, HostEventListener, HostEventType } from './events.ts';

export interface EventResult {
	handled: boolean;
	stopped: boolean;
}

/** Host-root listener storage with separately decoratable policy and delivery. */
export class EventApi extends Api {
	readonly listeners = new WeakMap<
		HostElement,
		Map<string, Set<HostEventListener<HostEventType>>>
	>();

	validateOwner(element: HostElement): void {
		if (getElementHost(getElement(this.node)).root !== getElementHost(element).root)
			throw new CrossHostEventError(element);
	}

	addEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void {
		this.validateOwner(element);
		let types = this.listeners.get(element);
		if (!types) this.listeners.set(element, (types = new Map()));
		let listeners = types.get(type);
		if (!listeners) types.set(type, (listeners = new Set()));
		listeners.add(listener as HostEventListener<HostEventType>);
	}

	removeEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void {
		this.validateOwner(element);
		const types = this.listeners.get(element);
		const listeners = types?.get(type);
		listeners?.delete(listener as HostEventListener<HostEventType>);
		if (listeners?.size === 0) types?.delete(type);
		if (types?.size === 0) this.listeners.delete(element);
	}

	hasEventListener(element: HostElement, type: HostEventType): boolean {
		this.validateOwner(element);
		return (this.listeners.get(element)?.get(type)?.size ?? 0) > 0;
	}

	getEventParent(element: HostElement): HostElement | null {
		return element.parent;
	}

	emit(event: AnyHostEvent): EventResult {
		const expected = event.target.node ?? getElementHost(event.target).root;
		if (this.node !== expected) throw new InvalidEventTargetError(this.node, event.target);
		return this.dispatchEvent(event);
	}

	dispatchEvent(event: AnyHostEvent): EventResult {
		this.validateOwner(event.target);
		let current: HostElement | null = event.target;
		let handled = false;
		try {
			while (current) {
				this.validateOwner(current);
				event.currentTarget = current;
				const listeners = this.listeners.get(current)?.get(event.type);
				if (listeners) {
					handled ||= listeners.size > 0;
					for (const listener of Array.from(listeners)) listener(event);
				}
				if (event.bubbles === false || event.cancelBubble) break;
				current = this.getEventParent(current);
			}
		} finally {
			event.currentTarget = undefined;
		}
		return { handled, stopped: event.cancelBubble === true };
	}
}

/** Emit a semantic event, including from a detached creator-owned element. */
export function emit(target: HostElement, data: HostEventData): EventResult {
	const event = {
		...data,
		target,
		currentTarget: undefined,
		bubbles: data.bubbles ?? true,
		cancelBubble: false,
		defaultPrevented: false,
	} as AnyHostEvent;
	event.stopPropagation = () => {
		event.cancelBubble = true;
	};
	event.preventDefault = () => {
		event.defaultPrevented = true;
	};
	return EventApi.at(target.node ?? getElementHost(target).root).emit(event);
}

/** The event was emitted at a runtime location other than its target's. */
export class InvalidEventTargetError extends TypeError {
	readonly code = 'CLACK_UI_INVALID_EVENT_TARGET';
	readonly node: Node;
	readonly target: HostElement;

	constructor(node: Node, target: HostElement) {
		super('event target does not match emitting node');
		this.name = 'InvalidEventTargetError';
		this.node = node;
		this.target = target;
	}
}

/** Listener registration or delivery attempted to cross Host ownership. */
export class CrossHostEventError extends TypeError {
	readonly code = 'CLACK_UI_CROSS_HOST_EVENT';
	readonly target: HostElement;

	constructor(target: HostElement) {
		super('Event target must belong to the receiving Host');
		this.name = 'CrossHostEventError';
		this.target = target;
	}
}
