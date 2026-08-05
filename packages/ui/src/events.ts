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

export type WithoutTarget<T> = T extends unknown ? Omit<T, 'target'> : never;

export type HostEventData = WithoutTarget<AnyHostEvent>;

export interface HostEventListener<T extends HostEventType> {
	(event: HostEvents[T]): void;
}
