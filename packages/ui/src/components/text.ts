import { text as ttyText, type Op, type Text as TextOp } from "@bomb.sh/tty";

/** Text props — a 1:1 passthrough to the tty `text` op for now (friendlier shapes later). */
export type TextProps = Omit<TextOp, 'directive' | 'content'>;

export function text(props: TextProps, ...content: string[]): Op {
	return ttyText(content.join(''), textPropsToOps(props));
}

function textPropsToOps(props: TextProps): Omit<TextOp, 'directive' | 'content'> {
	return props;
}
