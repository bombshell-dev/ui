import type { Element, Event } from '@clack/ui';
import type { ComponentChildren, Key, Ref } from 'preact';

export type EventHandler = (event: Event) => void;
export type AttributeValue = string | number | boolean | null | undefined;

/** Attributes supported by the unstyled Clack DOM, not browser HTML elements. */
export interface ElementProps {
	children?: ComponentChildren;
	key?: Key;
	ref?: Ref<Element>;
	id?: string;
	class?: string;
	title?: string;
	[attribute: `data-${string}`]: AttributeValue;
	[attribute: `aria-${string}`]: AttributeValue;
	[event: `on${string}`]: EventHandler | undefined;
	// These need APIs which are deliberately outside this initial integration.
	style?: never;
	dangerouslySetInnerHTML?: never;
}

/** Ordinary tags are generic Clack elements, without browser behavior or styling. */
export interface HostElements {
	[tagName: string]: ElementProps;
	// Preact reserves these names for browser APIs that Clack does not implement.
	svg: never;
	math: never;
	template: never;
}
