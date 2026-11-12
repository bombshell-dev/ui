import { asciiLowercase } from './ascii.ts';
import type { Attr, Element } from './dom.ts';
import { validateAttributeName, validateAttributeNamespace } from './validation.ts';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

type AttributeNamespace = Pick<Attr, 'namespaceURI' | 'prefix'>;
type AttributeFactory = (localName: string, namespace: AttributeNamespace) => Attr;

/**
 * Holds Element attributes: https://dom.spec.whatwg.org/#interface-namednodemap
 *
 * Full NamedNodeMap Web IDL behavior (such as intercepting property deletion
 * and redefinition) is not supported
 */
export class NamedNodeMap {
	readonly [index: number]: Attr;
	readonly #ownerElement: Element;
	readonly #createAttribute: AttributeFactory;
	readonly #notify: () => void;
	readonly #attributes: Attr[] = [];
	#properties: string[] = [];

	constructor({
		ownerElement,
		createAttribute,
		notify,
	}: {
		ownerElement: Element;
		createAttribute: AttributeFactory;
		notify: () => void;
	}) {
		this.#ownerElement = ownerElement;
		this.#createAttribute = createAttribute;
		this.#notify = notify;
	}

	get length(): number {
		return this.#attributes.length;
	}

	item(index: number): Attr | null {
		return this.#attributes[index] ?? null;
	}

	getNamedItem(name: string): Attr | null {
		const normal = this.#normalizeName(name);
		return this.#attributes.find((attr) => attr.name === normal) ?? null;
	}

	getNamedItemNS(namespace: string | null, localName: string): Attr | null {
		const namespaceURI = namespace == null ? null : `${namespace}` || null;
		const name = `${localName}`;
		return (
			this.#attributes.find(
				(attr) => attr.namespaceURI === namespaceURI && attr.localName === name,
			) ?? null
		);
	}

	setNamedItem(attr: Attr): Attr | null {
		if (attr.ownerElement !== null && attr.ownerElement !== this.#ownerElement) {
			throw new DOMException(
				'Attribute is already attached to another element',
				'InUseAttributeError',
			);
		}
		const previous = this.getNamedItemNS(attr.namespaceURI, attr.localName);
		if (previous === attr) {
			return attr;
		}
		if (previous) {
			this.#attributes[this.#attributes.indexOf(previous)] = attr;
			previous.ownerElement = null;
		} else {
			this.#attributes.push(attr);
		}
		attr.ownerElement = this.#ownerElement;
		this.#changed();
		return previous;
	}

	setNamedItemNS(attr: Attr): Attr | null {
		return this.setNamedItem(attr);
	}

	removeNamedItem(name: string): Attr {
		const attr = this.getNamedItem(name);
		if (!attr) {
			throw new DOMException('Attribute is not attached to this element', 'NotFoundError');
		}
		return this.removeAttributeNode(attr);
	}

	removeAttributeNode(attr: Attr): Attr {
		const index = this.#attributes.indexOf(attr);
		if (index === -1) {
			throw new DOMException('Attribute is not attached to this element', 'NotFoundError');
		}
		this.#attributes.splice(index, 1);
		attr.ownerElement = null;
		this.#changed();
		return attr;
	}

	setAttribute(name: string, value: string): void {
		const normal = this.#normalizeName(name);
		const normalValue = `${value}`;
		validateAttributeName(normal);
		const attr = this.getNamedItem(normal);
		if (attr) {
			attr.value = normalValue;
		} else {
			const created = this.#createAttribute(normal, { namespaceURI: null, prefix: null });
			created.value = normalValue;
			this.setNamedItem(created);
		}
	}

	// oxlint-disable-next-line bombshell-dev/max-params -- Mirrors Element.setAttributeNS for delegation.
	setAttributeNS(namespace: string | null, qualifiedName: string, value: string): void {
		const namespaceURI = namespace == null ? null : `${namespace}` || null;
		const name = `${qualifiedName}`;
		const normalValue = `${value}`;
		const { prefix, localName } = validateAttributeNamespace(namespaceURI, name);
		const attr = this.getNamedItemNS(namespaceURI, localName);
		if (attr) {
			attr.value = normalValue;
		} else {
			const created = this.#createAttribute(localName, { namespaceURI, prefix });
			created.value = normalValue;
			this.setNamedItem(created);
		}
	}

	removeAttribute(name: string): void {
		const attr = this.getNamedItem(name);
		if (attr) {
			this.removeAttributeNode(attr);
		}
	}

	removeAttributeNS(namespace: string | null, localName: string): void {
		const attr = this.getNamedItemNS(namespace, localName);
		if (attr) {
			this.removeAttributeNode(attr);
		}
	}

	toggleAttribute(name: string, force?: boolean): boolean {
		const normal = this.#normalizeName(name);
		validateAttributeName(normal);
		const attr = this.getNamedItem(normal);
		if (attr) {
			if (force !== undefined && force) {
				return true;
			} else {
				this.removeAttributeNode(attr);
				return false;
			}
		}
		if (force !== undefined && !force) {
			return false;
		}
		this.setAttribute(normal, '');
		return true;
	}

	getAttributeNames(): string[] {
		return this.#attributes.map((attr) => attr.name);
	}

	#normalizeName(name: string): string {
		return this.#ownerElement.namespaceURI === HTML_NS ? asciiLowercase(`${name}`) : `${name}`;
	}

	#changed(): void {
		// Rebuild the indexed and named views when the ordered list changes.
		for (const key of this.#properties) Reflect.deleteProperty(this, key);
		this.#properties = [];
		for (const [index, attr] of this.#attributes.entries()) {
			const key = `${index}`;
			Object.defineProperty(this, key, { value: attr, enumerable: true, configurable: true });
			this.#properties.push(key);
		}
		for (const attr of this.#attributes) {
			const name = attr.name;
			if (name in this || this.#normalizeName(name) !== name || /^(0|[1-9][0-9]*)$/.test(name)) {
				continue;
			}
			Object.defineProperty(this, name, { value: attr, configurable: true });
			this.#properties.push(name);
		}
		this.#notify();
	}
}
