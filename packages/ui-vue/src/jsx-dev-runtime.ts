import type { VNode, VNodeProps } from 'vue';
import type { HostElements } from './index.ts';

export { Fragment, jsxDEV } from 'vue/jsx-dev-runtime';

export declare namespace JSX {
	interface Element extends VNode {}
	interface ElementClass {
		$props: {};
	}
	interface ElementAttributesProperty {
		$props: {};
	}
	interface IntrinsicAttributes extends VNodeProps {}
	type IntrinsicElements = HostElements;
}
