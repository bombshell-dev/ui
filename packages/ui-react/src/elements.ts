import type { HostElements as CoreHostElements } from '@clack/ui';
import type { HostElement } from '@clack/ui/elements';
import type { Key, ReactNode, Ref } from 'react';

type ReactProperties<Properties> = {
	[Name in keyof Properties as Name extends string
		? Name extends `on${infer Type}`
			? `on${Capitalize<Type>}`
			: Name
		: Name]: Properties[Name];
} & {
	children?: ReactNode;
	key?: Key | null;
	ref?: Ref<HostElement>;
};

export type HostElements = {
	[Name in keyof CoreHostElements]: ReactProperties<CoreHostElements[Name]>;
};

export type BoxProps = HostElements['box'];
export type InputProps = HostElements['input'];
export type TextProps = HostElements['text'];
