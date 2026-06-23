import { close, open, text as ttyText, type Op } from "@bomb.sh/tty";
import { type BoxNode, boxPropsToOps } from "../components/box.ts";
import { type TextNode, textPropsToOps } from "../components/text.ts";

/** A node in the render tree. Bindings map their host tree to these. */
export type Node = BoxNode | TextNode;

/** Flatten a node tree into the `Op[]` stream `Term.render` consumes. Box ids use `node.id`, else positional. */
export function nodesToOps(nodes: Node[]): Op[] {
	let auto = 0;
	const emit = (node: Node): Op[] => {
		if (node.type === 'text') {
			return [ttyText(node.content, textPropsToOps(node.props))];
		}
		const id = node.id ?? `b${auto++}`;
		return [open(id, boxPropsToOps(node.props)), ...node.children.flatMap(emit), close()];
	};
	return nodes.flatMap(emit);
}
