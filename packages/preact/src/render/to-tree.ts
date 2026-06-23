import { box, text, type BoxProps, type TextProps, type Node } from '@clack/ui';
import { Element, Text, type Node as DomNode } from '../ir/dom.ts';
import { nodeId, nodeProps } from '../ir/node-state.ts';

/** Map Preact's committed fake DOM into the `@clack/ui` render tree (the container frame itself is dropped). */
export function domToTree(container: DomNode): Node[] {
	return [...container.childNodes].flatMap(toNodes);
}

function toNodes(node: DomNode): Node[] {
	if (node instanceof Text) {
		return [text({}, node.data)];
	}
	if (node instanceof Element) {
		if (node.localName === 'tui-text') {
			return [text(nodeProps(node) as TextProps, gatherText(node))];
		}
		const boxNode = box(nodeProps(node) as BoxProps, ...[...node.childNodes].flatMap(toNodes));
		boxNode.id = nodeId(node);
		return [boxNode];
	}
	return [];
}

function gatherText(node: Element): string {
	let out = '';
	for (const child of node.childNodes) {
		if (child instanceof Text) out += child.data;
	}
	return out;
}
