import type { JSX as PreactJSX } from 'preact/jsx-runtime';
import type { HostElements } from './elements.ts';

export { Fragment, jsx, jsxs } from 'preact/jsx-runtime';

export declare namespace JSX {
	type Element = PreactJSX.Element;
	type ElementType = string | Exclude<PreactJSX.ElementType, string>;
	type ElementClass = PreactJSX.ElementClass;
	type ElementAttributesProperty = PreactJSX.ElementAttributesProperty;
	type ElementChildrenAttribute = PreactJSX.ElementChildrenAttribute;
	type IntrinsicAttributes = PreactJSX.IntrinsicAttributes;
	type LibraryManagedAttributes<Component, Props> = PreactJSX.LibraryManagedAttributes<
		Component,
		Props
	>;
	interface IntrinsicElements extends HostElements {}
}
