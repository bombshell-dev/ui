import type { HostElement, HostElementChild } from '@clack/ui/elements';

export type JSXElement =
	| HostElementChild
	| readonly JSXElement[]
	| string
	| number
	| boolean
	| null
	| undefined;

export type HostRef = HostElement | ((element: HostElement) => void);
