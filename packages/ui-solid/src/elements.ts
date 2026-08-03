import type { HostElements as CoreHostElements } from '@clack/ui';
import type { HostRef, JSXElement } from './types.ts';

type SolidProperties<Properties> = {
	[Name in keyof Properties as Name extends string
		? Name extends `on${infer Type}`
			? `on${Capitalize<Type>}`
			: Name
		: Name]: Properties[Name];
} & {
	children?: JSXElement;
	ref?: HostRef;
};

export type HostElements = {
	[Name in keyof CoreHostElements]: SolidProperties<CoreHostElements[Name]>;
};

export type BoxProps = HostElements['box'];
export type InputProps = HostElements['input'];
export type TextProps = HostElements['text'];
