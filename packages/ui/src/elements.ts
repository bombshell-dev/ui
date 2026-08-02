import { createApi, createContext, type Node } from '@bomb.sh/tree';

/**
 * Type container for elements and their properties
 */
export interface HostElements {}

export interface HostElement {
	parent: HostElement | null;
	readonly type: 'element';
	readonly name: string;
	readonly properties: Record<string, unknown>;
	readonly children: ElementChild[];
	node: Node | null;
	attach?: (node: Node) => void;
	detach?: (node: Node) => void;
}

export interface TextLiteral {
	parent?: HostElement;
	type: 'literal';
	content: string;
}

export type ElementChild = HostElement | TextLiteral;

export const ElementApi = createApi('element', {
	getElement(node): HostElement {
		return ElementContext.expect(node);
	},

	setElement(node, element: HostElement): void {
		element.node = node;
		ElementContext.set(node, element);
	},
});

export const { getElement, setElement } = ElementApi.methods;

const ElementContext = createContext<HostElement>('element');
