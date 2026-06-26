import { open as ttyOpen, type OpenElement, type Op, close as ttyClose } from "@bomb.sh/tty";
import type { Node } from "../render/createRoot.ts";

/** Box props — a 1:1 passthrough to the tty `open` op for now (friendlier shapes later). */
export type BoxProps = Omit<OpenElement, 'directive' | 'id'>;

export function box(props: BoxProps, ...children: Node[]): Op[] {
	return [ttyOpen('', boxPropsToOps(props)), ...children.flat(), ttyClose()];
}

function boxPropsToOps(props: BoxProps): Omit<OpenElement, 'directive' | 'id'> {
	return props;
}
