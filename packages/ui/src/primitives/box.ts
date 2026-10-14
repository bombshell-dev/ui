import { close, open, text, type Op, type OpenElement } from '@bomb.sh/tty';
import { id, type Node } from '../core.ts';
import { definePrimitive, PrimitiveElement } from '../component.ts';
import { layout as layoutChildren } from '../layout.ts';
import type { HostElement } from '../elements.ts';

export type BoxProps = Omit<OpenElement, 'directive' | 'id'>;

declare module '@clack/ui/elements' {
	interface HostElements {
		box: BoxProps;
	}
}

/** A tty-backed layout container. */
export class BoxElement extends PrimitiveElement<BoxProps> {
	layout(): Op[] {
		return boxLayout(this.element, this.node!, this.props);
	}
}

export function boxLayout(element: HostElement, nodeId: Node, props: BoxProps): Op[] {
	const { id: _htmlId, ...openProps } = props as BoxProps & { id?: string };
	const operations: Op[] = [open(id(nodeId), openProps)];
	let content = '';
	for (const child of element.childNodes) {
		if (child.type === 'element') {
			if (content !== '') {
				operations.push(text(content));
				content = '';
			}
			for (const operation of layoutChildren(child.node!)) {
				operations.push(operation);
			}
		} else {
			content += child.content;
		}
	}
	if (content !== '') {
		operations.push(text(content));
	}
	operations.push(close());
	return operations;
}

export const Box = definePrimitive('box', BoxElement);
