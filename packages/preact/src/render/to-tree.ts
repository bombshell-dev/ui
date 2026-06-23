import { box, text, type BoxProps, type TextProps, type Node } from '@clack/ui';
import { Element, Text, type Node as DomNode } from '../ir/dom.ts';
import { nodeId, nodeProps } from '../ir/node-state.ts';

/**
 * Map Preact's committed fake-DOM tree into the canonical `@clack/ui` render
 * tree. `container`'s children become the top-level nodes; the container frame
 * itself is not emitted.
 *
 * `tui-text` is a text leaf — its child `Text` node is gathered into content,
 * not descended into. Box nodes carry the sidecar's stable id so tty layout
 * bounds + pointer hit-testing stay consistent across renders.
 */
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
