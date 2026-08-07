import type * as React from 'react';
import type { HostElements } from './index.ts';

export { Fragment, jsxDEV } from 'react/jsx-dev-runtime';

export declare namespace JSX {
	type ElementType = React.JSX.ElementType;
	interface Element extends React.JSX.Element {}
	interface ElementClass extends React.JSX.ElementClass {}
	interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
	interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
	type LibraryManagedAttributes<Component, Props> = React.JSX.LibraryManagedAttributes<
		Component,
		Props
	>;
	interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
	interface IntrinsicClassAttributes<Instance> extends React.JSX
		.IntrinsicClassAttributes<Instance> {}
	interface IntrinsicElements extends HostElements {}
}
