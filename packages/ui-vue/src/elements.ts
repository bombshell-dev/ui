import type { HostElements as CoreHostElements } from '@clack/ui';
import type { HostElement } from '@clack/ui/elements';
import type { ComponentPublicInstance, Ref, VNodeChild, VNodeProps } from 'vue';

export type HostRef =
	| string
	| Ref<HostElement | null>
	| ((value: HostElement | ComponentPublicInstance | null, refs: Record<string, unknown>) => void);

type VueProperties<Properties> = {
	[Name in keyof Properties as Name extends string
		? Name extends `on${infer Type}`
			? `on${Capitalize<Type>}`
			: Name
		: Name]: Properties[Name];
} & Omit<VNodeProps, 'ref'> & {
		children?: VNodeChild;
		ref?: HostRef;
	};

export type HostElements = {
	[Name in keyof CoreHostElements]: VueProperties<CoreHostElements[Name]>;
};

export type BoxProps = HostElements['box'];
export type InputProps = HostElements['input'];
export type TextProps = HostElements['text'];
