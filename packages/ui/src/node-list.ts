/* oxlint-disable bombshell-dev/no-generic-error -- Web IDL requires TypeError for missing arguments. */
import type { Element } from './dom.ts';

/**
 * A static snapshot of nodes, as returned by querySelectorAll.
 * Full Web IDL indexed-property deletion and redefinition are not supported.
 */
export class NodeList implements Iterable<Element> {
	readonly [index: number]: Element;
	#elements: Element[];

	constructor(nodes: Element[]) {
		this.#elements = nodes;
		for (const [index, node] of nodes.entries()) {
			Object.defineProperty(this, index, {
				value: node,
				writable: false,
				enumerable: true,
				configurable: true,
			});
		}
	}

	get length(): number {
		return this.#elements.length;
	}

	item(index: number): Element | null {
		if (arguments.length === 0) {
			throw new TypeError('item requires an index');
		}
		return this.#elements[index >>> 0] ?? null;
	}

	keys(): ArrayIterator<number> {
		return this.#elements.keys();
	}

	values(): ArrayIterator<Element> {
		return this.#elements.values();
	}

	entries(): ArrayIterator<[number, Element]> {
		return this.#elements.entries();
	}

	forEach(
		callback: (value: Element, index: number, list: NodeList) => void,
		thisArg?: unknown,
	): void {
		this.#elements.forEach((element, index) => {
			callback.call(thisArg, element, index, this);
		});
	}

	[Symbol.iterator](): ArrayIterator<Element> {
		return this.#elements[Symbol.iterator]();
	}
}
