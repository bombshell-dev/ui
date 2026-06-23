import type { Text as TextOp } from "@bomb.sh/tty";

/** Text props — a 1:1 passthrough to the tty `text` op for now (friendlier shapes later). */
export type TextProps = Omit<TextOp, 'directive' | 'content'>;

/** A text leaf in the render tree. */
export interface TextNode {
	type: 'text';
	props: TextProps;
	content: string;
}

export function text(props: TextProps, ...content: string[]): TextNode {
	return { type: 'text', props, content: content.join('') };
}

export function textPropsToOps(props: TextProps): Omit<TextOp, 'directive' | 'content'> {
	return props;
}
