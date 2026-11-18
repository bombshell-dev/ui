import type { Options } from 'css-select';
import { compile as compileSelector, selectAll, selectOne } from 'css-select';
import { Element, Node } from './dom.ts';

type Adapter = NonNullable<Options<Node, Element>['adapter']>;

const adapter: Adapter = {
	isTag(node): node is Element {
		return node instanceof Element;
	},

	getAttributeValue(element, name): string | undefined {
		return element.getAttributeNS(null, name) ?? undefined;
	},

	getChildren(node): Node[] {
		return [...node.childNodes];
	},

	getName(element): string {
		return element.localName;
	},

	getParent(node): Node | null {
		return node.parentNode;
	},

	getSiblings(node): Node[] {
		return node.parentNode ? [...node.parentNode.childNodes] : [node];
	},

	getText(node): string {
		const parts: string[] = [];
		const stack = [node];
		while (stack.length > 0) {
			const current = stack.pop()!;
			if (current.nodeType === Node.TEXT_NODE) {
				parts.push(current.nodeValue ?? '');
			}
			for (let index = current.childNodes.length - 1; index >= 0; index--) {
				stack.push(current.childNodes[index]!);
			}
		}
		return parts.join('');
	},

	hasAttrib(element, name): boolean {
		return element.hasAttributeNS(null, name);
	},

	removeSubsets(nodes): Node[] {
		const candidates = new Set(nodes);
		return [...candidates].filter((node) => {
			for (let parent = node.parentNode; parent; parent = parent.parentNode) {
				if (candidates.has(parent)) {
					return false;
				}
			}
			return true;
		});
	},
};

export function compile(selector: string): (node: Node) => boolean {
	try {
		return compileSelector(selector, { adapter });
	} catch (error) {
		throw new DOMException(
			error instanceof Error ? error.message : 'Invalid selector',
			'SyntaxError',
		);
	}
}

export function querySelector(nodes: Node[], selector: string): Element | null {
	const query = compile(selector);
	return selectOne(query, nodes, { adapter });
}

export function querySelectorAll(nodes: Node[], selector: string): Element[] {
	const query = compile(selector);
	return selectAll(query, nodes, { adapter });
}
