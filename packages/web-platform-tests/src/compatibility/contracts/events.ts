/** Standard event interfaces; feature selection never changes their required members. */
import type { DOMHTMLElement } from './nodes.ts';

export interface DOMEventInit {
	bubbles?: boolean;
	cancelable?: boolean;
	composed?: boolean;
}

export interface DOMEvent {
	readonly type: string;
	readonly bubbles: boolean;
	readonly cancelable: boolean;
	readonly composed: boolean;
	readonly target: DOMEventTarget | null;
	readonly currentTarget: DOMEventTarget | null;
	readonly eventPhase: number;
	readonly defaultPrevented: boolean;
	readonly isTrusted: boolean;
	readonly timeStamp: number;
	readonly NONE: 0;
	readonly CAPTURING_PHASE: 1;
	readonly AT_TARGET: 2;
	readonly BUBBLING_PHASE: 3;
	cancelBubble: boolean;
	returnValue: boolean;
	stopPropagation(): void;
	stopImmediatePropagation(): void;
	preventDefault(): void;
	composedPath(): DOMEventTarget[];
	initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
}

export interface DOMEventListener {
	(this: DOMEventTarget, event: DOMEvent): void;
}

export interface DOMEventListenerObject {
	handleEvent(event: DOMEvent): void;
}

export interface DOMListenerOptions {
	capture?: boolean;
	once?: boolean;
	passive?: boolean;
	signal?: AbortSignal;
}

export interface DOMEventTarget {
	addEventListener(
		type: string,
		callback: DOMEventListener | DOMEventListenerObject | null,
		options?: boolean | DOMListenerOptions,
	): void;
	removeEventListener(
		type: string,
		callback: DOMEventListener | DOMEventListenerObject | null,
		options?: boolean | { capture?: boolean },
	): void;
	dispatchEvent(event: DOMEvent): boolean;
}

export interface DOMEventConstructor {
	new (type: string, options?: DOMEventInit): DOMEvent;
}

export interface DOMEventTargetConstructor {
	new (): DOMEventTarget;
}

export interface DOMCustomEvent extends DOMEvent {
	readonly detail: unknown;
}

export interface DOMCustomEventConstructor {
	new (type: string, options?: DOMEventInit & { detail?: unknown }): DOMCustomEvent;
}

export interface DOMKeyboardEvent extends DOMEvent {
	readonly key: string;
	readonly code: string;
	readonly location: number;
	readonly repeat: boolean;
	readonly isComposing: boolean;
	readonly ctrlKey: boolean;
	readonly altKey: boolean;
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	getModifierState(key: string): boolean;
}

export interface DOMKeyboardEventConstructor {
	new (
		type: string,
		options?: DOMEventInit & {
			key?: string;
			code?: string;
			location?: number;
			repeat?: boolean;
			isComposing?: boolean;
			ctrlKey?: boolean;
			altKey?: boolean;
			shiftKey?: boolean;
			metaKey?: boolean;
		},
	): DOMKeyboardEvent;
}

export interface DOMMouseEvent extends DOMEvent {
	readonly button: number;
	readonly buttons: number;
	readonly clientX: number;
	readonly clientY: number;
	readonly screenX: number;
	readonly screenY: number;
	readonly ctrlKey: boolean;
	readonly altKey: boolean;
	readonly shiftKey: boolean;
	readonly metaKey: boolean;
	readonly relatedTarget: DOMEventTarget | null;
	getModifierState(key: string): boolean;
}

export interface DOMMouseEventConstructor {
	new (
		type: string,
		options?: DOMEventInit & {
			button?: number;
			buttons?: number;
			clientX?: number;
			clientY?: number;
			screenX?: number;
			screenY?: number;
			ctrlKey?: boolean;
			altKey?: boolean;
			shiftKey?: boolean;
			metaKey?: boolean;
			relatedTarget?: DOMEventTarget | null;
		},
	): DOMMouseEvent;
}

export interface DOMFocusEvent extends DOMEvent {
	readonly relatedTarget: DOMEventTarget | null;
}

export interface DOMToggleEvent extends DOMEvent {
	readonly oldState: string;
	readonly newState: string;
}

export interface DOMSubmitEvent extends DOMEvent {
	readonly submitter: DOMHTMLElement | null;
}

export interface DOMFocusEventConstructor {
	new (
		type: string,
		options?: DOMEventInit & { relatedTarget?: DOMEventTarget | null },
	): DOMFocusEvent;
}

export interface DOMInputEvent extends DOMEvent {
	readonly data: string | null;
	readonly inputType: string;
	readonly isComposing: boolean;
}

export interface DOMInputEventConstructor {
	new (
		type: string,
		options?: DOMEventInit & { data?: string | null; inputType?: string; isComposing?: boolean },
	): DOMInputEvent;
}
