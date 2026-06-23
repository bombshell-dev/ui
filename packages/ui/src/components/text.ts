import type { Text as TextOp } from "@bomb.sh/tty";

/**
 * User-facing props for text — a direct 1:1 with the `tty` `text` op (`color`,
 * `bg`, `wrap`, …). Friendlier shapes (color names, etc.) come in a later pass.
 */
export type TextProps = Omit<TextOp, 'directive' | 'content'>;

/** A text leaf in the canonical render tree. */
export interface TextNode {
	type: 'text';
	props: TextProps;
	content: string;
}

/** Build a text node. Content args are concatenated. */
export function text(props: TextProps, ...content: string[]): TextNode {
	return { type: 'text', props, content: content.join('') };
}

/** Map {@link TextProps} onto the props of a `tty` `text` op — a 1:1 passthrough for now. */
export function textPropsToOps(props: TextProps): Omit<TextOp, 'directive' | 'content'> {
	return props;
}
