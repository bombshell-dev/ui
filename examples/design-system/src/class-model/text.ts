import { definePrimitive, type TextProps } from '@clack/ui';
import { text as ttyText, type Op } from '@bomb.sh/tty';
import { ClackElement } from './base.ts';

export class TextElement extends ClackElement<TextProps> {
	override layout(): Iterable<Op> {
		return [ttyText(this.element.textContent, this.props)];
	}
}

export const ClassText = definePrimitive('class-text', TextElement);
