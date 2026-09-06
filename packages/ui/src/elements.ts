import { createContext, type Node } from './core.ts';

/**
 * Type container for elements and their properties
 */
export interface HostElements {}

export interface HostElement {
	parent: HostElement | null;
	readonly type: 'element';
	readonly name: string;
	readonly properties: Record<string, unknown>;
	readonly children: HostElementChild[];
	node: Node | null;
	attach?: (node: Node) => void;
	detach?: (node: Node) => void;
}

export interface HostLiteral {
	parent?: HostElement;
	type: 'literal';
	content: string;
}

export type HostElementChild = HostElement | HostLiteral;

/** The element `node` hosts. */
export function getElement(node: Node): HostElement {
	return ElementContext.expect(node);
}

/** Bind `element` to `node`, in both directions. */
export function setElement(node: Node, element: HostElement): void {
	element.node = node;
	ElementContext.set(node, element);
}

const ElementContext = createContext<HostElement>('element');
