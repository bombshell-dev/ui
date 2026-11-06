import type { DOMDocumentFragment, DOMElement, DOMHTMLElement, DOMNode, DOMText } from './nodes.ts';

export interface DOMShadowRootInit {
	mode: 'open' | 'closed';
	delegatesFocus?: boolean;
	slotAssignment?: 'named' | 'manual';
	clonable?: boolean;
	serializable?: boolean;
}
export interface DOMHTMLSerializationOptions {
	serializableShadowRoots?: boolean;
	shadowRoots?: readonly DOMShadowRoot[];
}
export interface DOMShadowRoot extends DOMDocumentFragment {
	readonly host: DOMElement;
	readonly mode: 'open' | 'closed';
	readonly delegatesFocus: boolean;
	readonly slotAssignment: 'named' | 'manual';
	readonly clonable: boolean;
	readonly serializable: boolean;
	readonly activeElement: DOMElement | null;
	innerHTML: string;
	getHTML(options?: DOMHTMLSerializationOptions): string;
	setHTMLUnsafe(html: string): void;
}
export interface DOMSlotElement extends DOMHTMLElement {
	name: string;
	assignedNodes(options?: { flatten?: boolean }): DOMNode[];
	assignedElements(options?: { flatten?: boolean }): DOMElement[];
	assign(...nodes: (DOMElement | DOMText)[]): void;
}
export interface DOMTemplateElement extends DOMHTMLElement {
	readonly content: DOMDocumentFragment;
}
export interface DOMCustomElementConstructor {
	new (): DOMHTMLElement;
}
export interface DOMCustomElementRegistry {
	define(
		name: string,
		constructor: DOMCustomElementConstructor,
		options?: { extends?: string },
	): void;
	get(name: string): DOMCustomElementConstructor | undefined;
	whenDefined(name: string): Promise<DOMCustomElementConstructor>;
	upgrade(root: DOMNode): void;
}
