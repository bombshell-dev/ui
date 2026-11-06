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
		yield this.#open(element);

		const stack = [element.childNodes[Symbol.iterator]()];
		try {
			let content = '';
			while (stack.length > 0) {
				const next = stack[stack.length - 1]!.next();
				if (next.done) {
					if (content !== '') {
						yield text(content);
						content = '';
					}
					stack.pop();
					yield close();
					continue;
				}
				const child = next.value;
				if (child instanceof Text) {
					content += child.data;
				} else if (child instanceof Element) {
					if (content !== '') {
						yield text(content);
						content = '';
					}
					yield this.#open(child);
					stack.push(child.childNodes[Symbol.iterator]());
				}
			}
		} finally {
			while (stack.length > 0) {
				stack.pop();
				yield close();
			}
		}
	}

	#open(element: Element): Op {
		let stableId = this.#stableIds.get(element);
		if (!stableId) {
			stableId = `${element.nodeName}: ${this.#lastIdNumber++}`;
			this.#stableIds.set(element, stableId);
		}
		return open(stableId);
	}
}
