import { createApi, createContext, type Node } from './core.ts';
import type { Op } from '@bomb.sh/tty';
import type { HostEventListener, HostEventType } from './events.ts';
import type { KeyDown, KeyRepeat } from './keyboard.ts';

/**
 * Type container for elements and their properties
 */
export interface HostElements {}

export interface HostElement {
	parent: HostElement | null;
	readonly type: 'element';
	readonly name: string;
	readonly properties: Record<string, unknown>;
	readonly children: HostElementChild[];
	textContent: string;
	node: Node | null;
	attach?: (node: Node) => void;
	detach?: (node: Node) => void;
	focus?: (node: Node) => void;
	blur?: (node: Node) => void;
	propertyChanged?: (change: PropertyChange) => void;
	keydown?: (event: KeyDown) => boolean;
	keyrepeat?: (event: KeyRepeat) => boolean;
	layout?: (node: Node) => Iterable<Op> | undefined;
	createElement<Name extends string>(name: Name, ...children: HostElementChildInput[]): HostElement;
	createElement<Name extends string>(
		name: Name,
		properties: Record<string, unknown>,
		...children: HostElementChildInput[]
	): HostElement;
	append(...children: HostElementChildInput[]): void;
	prepend(...children: HostElementChildInput[]): void;
	replaceChildren(...children: HostElementChildInput[]): void;
	remove(): void;
	setProperty(name: string, value: unknown): void;
	addEventListener<T extends HostEventType>(type: T, listener: HostEventListener<T>): void;
	removeEventListener<T extends HostEventType>(type: T, listener: HostEventListener<T>): void;
}

export interface PropertyChange {
	name: string;
	previous: unknown;
	value: unknown;
}

export interface HostLiteral {
	parent?: HostElement;
	type: 'literal';
	content: string;
}

export type HostElementChild = HostElement | HostLiteral;

/** Values accepted by the convenience composition methods on a host element. */
export type HostElementChildInput =
	| HostElementChild
	| string
	| number
	| boolean
	| null
	| undefined
	| readonly HostElementChildInput[];

export const ElementApi = createApi('element', {
	getElement(node): HostElement {
		return ElementContext.expect(node);
	},

	setElement(node, element: HostElement): void {
		element.node = node;
		ElementContext.set(node, element);
	},
});

export const { getElement, setElement } = ElementApi.methods;

const ElementContext = createContext<HostElement>('element');
