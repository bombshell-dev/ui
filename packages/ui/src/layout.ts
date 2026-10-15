import { close, open, text, type Op } from '@bomb.sh/tty';
import { Element, Text } from './dom.ts';

export class Layout {
	#lastIdNumber = 0;
	#stableIds = new WeakMap<Element, string>();
	#root: Element;

	constructor(root: Element) {
		this.#root = root;
	}

	/** Serialize an element to TTY Ops. */
	*layout(element: Element = this.#root): IterableIterator<Op> {
		let stableId = this.#stableIds.get(element);
		if (!stableId) {
			stableId = `${element.nodeName}: ${this.#lastIdNumber++}`;
			this.#stableIds.set(element, stableId);
		}
		yield open(stableId);

		try {
			let content = '';
			for (const child of element.childNodes) {
				if (child instanceof Text) {
					content += child.data;
				} else if (child instanceof Element) {
					if (content !== '') {
						yield text(content);
						content = '';
					}
					yield* this.layout(child);
				}
			}
			if (content !== '') {
				yield text(content);
			}
		} finally {
			yield close();
		}
	}
}
