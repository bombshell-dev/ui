import type { Element } from './dom.ts';

const sources = new WeakMap<HTMLCollection, () => Element[]>();

export class HTMLCollection implements Iterable<Element> {
	readonly [index: number]: Element;

	constructor(elements: () => Element[]) {
		sources.set(this, elements);
		const collection = new Proxy(this, {
			get(target, key, receiver) {
				if (isArrayIndex(key)) {
					return elements()[Number(key)] ?? Reflect.get(target, key, receiver);
				}
				if (typeof key === 'string' && !(key in target)) {
					return namedElement(elements(), key) ?? undefined;
				}
				return Reflect.get(target, key, receiver);
			},
			has(target, key) {
				if (isArrayIndex(key) && Number(key) < elements().length) {
					return true;
				}
				return Reflect.has(target, key);
			},
			getOwnPropertyDescriptor(target, key) {
				if (isArrayIndex(key)) {
					const element = elements()[Number(key)];
					if (element !== undefined) {
						return { value: element, writable: false, enumerable: true, configurable: true };
					}
				}
				return Reflect.getOwnPropertyDescriptor(target, key);
			},
			ownKeys(target) {
				const indices = elements().map((_, index) => `${index}`);
				return [...indices, ...Reflect.ownKeys(target)];
			},
			set(target, key, value, receiver) {
				if (isArrayIndex(key) && Number(key) < elements().length) {
					return false;
				}
				return Reflect.set(target, key, value, receiver);
			},
			defineProperty(target, key, descriptor) {
				if (isArrayIndex(key)) {
					return false;
				}
				return Reflect.defineProperty(target, key, descriptor);
			},
			deleteProperty(target, key) {
				if (isArrayIndex(key)) {
					return Number(key) >= elements().length;
				}
				return Reflect.deleteProperty(target, key);
			},
			preventExtensions() {
				// Live indices must remain able to appear and disappear.
				return false;
			},
		});
		sources.set(collection, elements);
		return collection;
	}

	get length(): number {
		return sources.get(this)!().length;
	}

	item(index: number): Element | null {
		return sources.get(this)!()[index >>> 0] ?? null;
	}

	namedItem(name: string): Element | null {
		const key = `${name}`;
		return namedElement(sources.get(this)!(), key);
	}

	*[Symbol.iterator](): IterableIterator<Element> {
		for (let index = 0; index < this.length; index++) {
			yield this.item(index)!;
		}
	}
}

function isArrayIndex(key: PropertyKey): key is string {
	return typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key) && Number(key) < 2 ** 32 - 1;
}

function namedElement(elements: Element[], name: string): Element | null {
	if (name === '') {
		return null;
	}
	return (
		elements.find(
			(element) =>
				element.id === name ||
				(element.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
					element.getAttribute('name') === name),
		) ?? null
	);
}
