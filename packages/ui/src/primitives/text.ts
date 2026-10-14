import { text as ttyText, type Op, type Text as TtyText } from '@bomb.sh/tty';
import { definePrimitive, PrimitiveElement } from '../component.ts';

export type TextProps = Omit<TtyText, 'directive' | 'content'>;

declare module '@clack/ui/elements' {
	interface HostElements {
		text: TextProps;
	}
}

/** A tty-backed text leaf. */
export class TextElement extends PrimitiveElement<TextProps> {
	layout(): Op[] {
		let content = '';
		for (const child of this.element.childNodes) {
			if (child.type === 'literal') {
				content += child.content;
			}
		}
		return [ttyText(content, this.props)];
	}
}

export const Text = definePrimitive('text', TextElement);
