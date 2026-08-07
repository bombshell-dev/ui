import type { HostElements } from './index.ts';
import type { JSXElement } from './types.ts';

export declare namespace JSX {
	type Element = JSXElement;
	interface ElementChildrenAttribute {
		children: unknown;
	}
	interface IntrinsicElements extends HostElements {}
}
