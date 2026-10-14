import type { HostElement } from './elements.ts';

export { EventApi, emit, InvalidEventTargetError, CrossHostEventError } from './event-api.ts';
export type { EventResult } from './event-api.ts';

/**
 * Open interface that is extended with new event types
 */
export interface HostEvents {
	click: HostEvent<'click'>;
	change: HostEvent<'change'>;
	focus: HostEvent<'focus'>;
	blur: HostEvent<'blur'>;
	pointerDown: HostEvent<'pointerDown'>;
	pointerMove: HostEvent<'pointerMove'>;
	pointerUp: HostEvent<'pointerUp'>;
	pointerCancel: HostEvent<'pointerCancel'>;
}

export interface HostEvent<T extends HostEventType = HostEventType> {
	type: T;
	target: HostElement;
	currentTarget?: HostElement;
	nativeEvent?: {
		cancelBubble: boolean;
		defaultPrevented: boolean;
		stopPropagation(): void;
		preventDefault(): void;
	};
	button?: number;
	buttons?: number;
	clientX?: number;
	clientY?: number;
	pointerId?: number;
	pointerType?: string;
	shiftKey?: boolean;
	ctrlKey?: boolean;
	altKey?: boolean;
	metaKey?: boolean;
	detail?: number;
	bubbles?: boolean;
	cancelBubble?: boolean;
	defaultPrevented?: boolean;
	stopPropagation?: () => void;
	preventDefault?: () => void;
}

export type HostEventType = keyof HostEvents;

export type AnyHostEvent = HostEvents[HostEventType];

export type WithoutTarget<T> = T extends unknown ? Omit<T, 'target'> : never;

export type HostEventData = WithoutTarget<AnyHostEvent>;

export interface HostEventListener<T extends HostEventType> {
	(event: HostEvents[T]): void;
}
