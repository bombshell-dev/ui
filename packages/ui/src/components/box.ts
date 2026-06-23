import type { OpenElement } from "@bomb.sh/tty";
import type { Node } from "../tree/to-ops.ts";

/**
 * User-facing props for a box — a direct 1:1 with the `tty` `open` op (`layout`,
 * `bg`, `border`, `cornerRadius`, `clip`, `floating`). Friendlier prop shapes
 * (padding shorthands, sizing keywords, color names) come in a later pass.
 */
export type BoxProps = Omit<OpenElement, 'directive' | 'id'>;

/** A box in the canonical render tree. `id` is supplied by bindings that track stable element identity. */
export interface BoxNode {
	type: 'box';
	id?: string;
	props: BoxProps;
	children: Node[];
}

/** Build a box node. Framework-free: compose with `text` and render via `toOps`. */
export function box(props: BoxProps, ...children: Node[]): BoxNode {
	return { type: 'box', props, children };
}

/** Map {@link BoxProps} onto the props of a `tty` `open` op — a 1:1 passthrough for now. */
export function boxPropsToOps(props: BoxProps): Omit<OpenElement, 'directive' | 'id'> {
	return props;
}
