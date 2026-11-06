import type { DOMAttr, DOMElement, DOMNode } from './nodes.ts';
import type { DOMOptGroupElement, DOMOptionElement } from './elements.ts';

/** https://dom.spec.whatwg.org/#interface-nodelist */
export interface DOMNodeList<T extends DOMNode = DOMNode> extends Iterable<T> {
	readonly length: number;
	readonly [index: number]: T;
	item(index: number): T | null;
	entries(): IterableIterator<[number, T]>;
	keys(): IterableIterator<number>;
	values(): IterableIterator<T>;
	forEach(
		callback: (value: T, index: number, list: DOMNodeList<T>) => void,
		thisArg?: unknown,
	): void;
}

/** https://dom.spec.whatwg.org/#interface-htmlcollection */
export interface DOMHTMLCollection<T extends DOMElement = DOMElement> extends Iterable<T> {
	readonly length: number;
	readonly [index: number]: T;
	item(index: number): T | null;
	namedItem(name: string): T | null;
}

/** https://dom.spec.whatwg.org/#interface-namednodemap */
export interface DOMNamedNodeMap extends Iterable<DOMAttr> {
	readonly length: number;
	readonly [index: number]: DOMAttr;
	item(index: number): DOMAttr | null;
	getNamedItem(qualifiedName: string): DOMAttr | null;
	getNamedItemNS(namespace: string | null, localName: string): DOMAttr | null;
	setNamedItem(attr: DOMAttr): DOMAttr | null;
	setNamedItemNS(attr: DOMAttr): DOMAttr | null;
	removeNamedItem(qualifiedName: string): DOMAttr;
	removeNamedItemNS(namespace: string | null, localName: string): DOMAttr;
}

/** https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#radionodelist */
export interface DOMRadioNodeList extends DOMNodeList {
	value: string;
}

/** https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#htmlformcontrolscollection */
export interface DOMHTMLFormControlsCollection extends Iterable<DOMElement> {
	readonly length: number;
	readonly [index: number]: DOMElement;
	item(index: number): DOMElement | null;
	namedItem(name: string): DOMElement | DOMRadioNodeList | null;
}

/** https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#htmloptionscollection */
export interface DOMHTMLOptionsCollection extends Iterable<DOMOptionElement> {
	length: number;
	selectedIndex: number;
	// TypeScript cannot distinguish indexed getter and setter types. Null is
	// accepted by the standard indexed setter to remove an option; iteration and
	// item() retain their precise getter result types.
	[index: number]: DOMOptionElement | null;
	item(index: number): DOMOptionElement | null;
	namedItem(name: string): DOMOptionElement | null;
	add(element: DOMOptionElement | DOMOptGroupElement, before?: DOMElement | number | null): void;
	remove(index: number): void;
}
