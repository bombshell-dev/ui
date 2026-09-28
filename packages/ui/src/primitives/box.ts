import { close, open, text, type Op, type OpenElement } from '@bomb.sh/tty';
import { id } from '../core.ts';
import { definePrimitive, PrimitiveElement } from '../component.ts';
import { layout as layoutChildren } from '../layout.ts';

export type BoxProps = Omit<OpenElement, 'directive' | 'id'>;

declare module '@clack/ui/elements' {
	interface HostElements {
		box: BoxProps;
	}
}

/** A tty-backed layout container. */
export class BoxElement extends PrimitiveElement<BoxProps> {
	layout(): Op[] {
		const operations: Op[] = [open(id(this.node!), this.props)];
		let content = '';
		for (const child of this.element.children) {
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
}

export const Box = definePrimitive('box', BoxElement);
