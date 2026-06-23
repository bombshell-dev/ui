import type { OpenElement } from "@bomb.sh/tty";
import type { Node } from "../tree/to-ops.ts";

/** Box props — a 1:1 passthrough to the tty `open` op for now (friendlier shapes later). */
export type BoxProps = Omit<OpenElement, 'directive' | 'id'>;

/** A box in the render tree; `id` is set by bindings that track element identity. */
export interface BoxNode {
	type: 'box';
	id?: string;
	props: BoxProps;
	children: Node[];
}

export function box(props: BoxProps, ...children: Node[]): BoxNode {
	return { type: 'box', props, children };
}

export function boxPropsToOps(props: BoxProps): Omit<OpenElement, 'directive' | 'id'> {
	return props;
}
