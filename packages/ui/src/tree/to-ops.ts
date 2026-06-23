import { close, open, text as ttyText, type Op } from "@bomb.sh/tty";
import { type BoxNode, boxPropsToOps } from "../components/box.ts";
import { type TextNode, textPropsToOps } from "../components/text.ts";

/** A node in the canonical render tree. Bindings map their host tree to these. */
export type Node = BoxNode | TextNode;

/**
 * Emit the `Op[]` stream `Term.render` consumes from a tree of {@link Node}s:
 * boxes become `open(…)` / `close()` pairs, text nodes a single `text(…)`.
 *
 * A box's id comes from `node.id` when a binding supplies a stable one (e.g.
 * Preact's per-element id, used for layout bounds + pointer hit-testing); it
 * falls back to a positional id otherwise.
 */
export function toOps(nodes: Node[]): Op[] {
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
