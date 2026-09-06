import type { HostElement } from './elements.ts';

/**
 * Open interface that is extended with new event types
 */
export interface HostEvents {}

export interface HostEvent<T extends HostEventType = HostEventType> {
	type: T;
	target: HostElement;
}

export type HostEventType = keyof HostEvents;

export type AnyHostEvent = HostEvents[HostEventType];

export type Dispatched<E> = E & {
	readonly currentTarget: HostElement;
	stopPropagation(): void;
};

export interface HostEventListener<T extends HostEventType> {
	(event: Dispatched<HostEvents[T]>): void;
}

type AnyListener = (event: Dispatched<AnyHostEvent>) => void;

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const registry = new WeakMap<HostElement, Map<string, Set<AnyListener>>>();

// oxlint-disable-next-line max-params
export function addListener<T extends HostEventType>(
	element: HostElement,
	type: T,
	listener: HostEventListener<T>,
): void {
	let types = registry.get(element);
	if (!types) {
		types = new Map<string, Set<AnyListener>>();
		registry.set(element, types);
	}
	let listeners = types.get(type);
	if (!listeners) {
		listeners = new Set<AnyListener>();
		types.set(type, listeners);
	}
	listeners.add(listener as AnyListener);
}

// oxlint-disable-next-line max-params
export function removeListener<T extends HostEventType>(
	element: HostElement,
	type: T,
	listener: HostEventListener<T>,
): void {
	const types = registry.get(element);
	if (types) {
		const listeners = types.get(type);
		if (listeners) {
			listeners.delete(listener as AnyListener);
			if (listeners.size === 0) {
				types.delete(type);
			}
		}
		if (types.size === 0) {
			registry.delete(element);
		}
	}
}

/**
 * Run `event` through the listeners registered on `element`. Listeners added
 * while the event is being delivered are not called for it.
 */
function deliver(element: HostElement, event: AnyHostEvent): void {
	const listeners = registry.get(element)?.get(event.type);
	if (!listeners || listeners.size === 0) {
		return;
	}
	// so listeners added mid-delivery don't get called
	const active = Array.from(listeners);
	const state = event as Mutable<Dispatched<AnyHostEvent>>;
	state.currentTarget = element;
	for (const listener of active) {
		listener(state);
	}
}

export interface DispatchOptions {
	bubbles?: boolean;
}

/**
 * Dispatch `event` to the listeners registered on `target` and its parents
 * unless stopPropagation is called or this is non-bubbling.
 */
// oxlint-disable-next-line max-params
export function dispatch(
	target: HostElement,
	event: AnyHostEvent,
	options?: DispatchOptions,
): void {
	let stopped = false;
	const state = event as Mutable<Dispatched<AnyHostEvent>>;
	state.stopPropagation = () => {
		stopped = true;
	};

	for (let element: HostElement | null = target; element; element = element.parent) {
		deliver(element, event);
		if (stopped || !options?.bubbles) {
			break;
		}
	}
}
