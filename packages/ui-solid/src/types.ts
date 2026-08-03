import type { ElementChild, HostElement } from '@clack/ui/elements';

export type JSXElement =
	| ElementChild
	| readonly JSXElement[]
	| string
	| number
	| boolean
	| null
	| undefined;

export type HostRef = HostElement | ((element: HostElement) => void);
