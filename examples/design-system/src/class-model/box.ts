import { definePrimitive, type BoxProps } from '@clack/ui';
import { close, open, type Op } from '@bomb.sh/tty';
import { ClackElement, elementId } from './base.ts';

export class BoxElement extends ClackElement<BoxProps> {
	override *layout(): Iterable<Op> {
		yield open(elementId(this.node!), this.props);
		yield* super.layout();
		yield close();
	}
}

export const ClassBox = definePrimitive('class-box', BoxElement);
