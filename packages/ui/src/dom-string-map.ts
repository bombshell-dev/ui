import type { Attr, Element } from './dom.ts';
import { validateAttributeName } from './validation.ts';

/**
 * A live view of an element's data-* attributes.
 * https://developer.mozilla.org/en-US/docs/Web/API/DOMStringMap
 */
export class DOMStringMap {
	[name: string]: string | undefined;

	constructor(element: Element) {
		const map: DOMStringMap = new Proxy(this, {
			get(target, key, receiver) {
				if (typeof key === 'string') {
					const attribute = getNamedAttributes(element).get(key);
					if (attribute) {
						return attribute.value;
					}
				}
				return Reflect.get(target, key, receiver);
			},

			has(target, key) {
				return (
					(typeof key === 'string' && getNamedAttributes(element).has(key)) ||
					Reflect.has(target, key)
				);
			},

			set(target, key, value, receiver) {
				if (typeof key === 'string' && receiver === map) {
					setNamedValue(element, { name: key, value });
					return true;
				}
				return Reflect.set(target, key, value, receiver);
			},

			deleteProperty(target, key) {
				if (typeof key === 'string') {
					const attribute = getNamedAttributes(element).get(key);
					if (attribute) element.removeAttributeNode(attribute);
					return true;
				}
				return Reflect.deleteProperty(target, key);
			},

			ownKeys(target) {
				return [...getNamedAttributes(element).keys(), ...Reflect.ownKeys(target)];
			},

			getOwnPropertyDescriptor(target, key) {
				if (typeof key === 'string') {
					const attribute = getNamedAttributes(element).get(key);
					if (attribute) {
						return {
							value: attribute.value,
							writable: true,
							enumerable: true,
							configurable: true,
						};
					}
				}
				return Reflect.getOwnPropertyDescriptor(target, key);
			},

			defineProperty(target, key, descriptor) {
				if (typeof key === 'symbol') {
					return Reflect.defineProperty(target, key, descriptor);
				}
				if (!('value' in descriptor || 'writable' in descriptor)) {
					return false;
				}

				// A Proxy cannot expose a virtual, non-configurable property. Unlike
				// native DOMStringMap, reject this request before changing attributes.
				if (descriptor.configurable === false) return false;
				setNamedValue(element, { name: key, value: descriptor.value });
				return true;
			},

			// Attribute changes can always introduce new properties.
			preventExtensions() {
				return false;
			},
		});
		return map;
	}
}

Object.defineProperty(DOMStringMap.prototype, Symbol.toStringTag, {
	value: 'DOMStringMap',
	configurable: true,
});

function getNamedAttributes(element: Element): Map<string, Attr> {
	const named = new Map<string, Attr>();
	const attributes = element.attributes;
	for (let index = 0; index < attributes.length; index++) {
		const attribute = attributes[index]!;

		if (!attribute.name.startsWith('data-')) {
			continue;
		}

		const suffix = attribute.name.slice(5);
		if (/[A-Z]/.test(suffix)) {
			continue;
		}

		const name = suffix.replace(/-[a-z]/g, (match) => match[1]!.toUpperCase());

		if (!named.has(name)) {
			named.set(name, attribute);
		}
	}
	return named;
}

function setNamedValue(element: Element, { name, value }: { name: string; value: unknown }): void {
	// Web IDL converts the value before the named setter validates the key.
	const stringValue = `${value}`;
	if (/-[a-z]/.test(name)) {
		throw new DOMException(
			'Dataset names cannot contain a dash followed by a lowercase letter',
			'SyntaxError',
		);
	}
	const attributeName = `data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
	validateAttributeName(attributeName);
	const attribute = element.getAttributeNodeNS(null, attributeName);
	if (attribute) {
		attribute.value = stringValue;
	} else {
		// Dataset writes use the null namespace. Creating an Attr directly also
		// permits colons in names without treating them as namespace prefixes.
		const created = element.ownerDocument.createAttribute(attributeName);
		created.value = stringValue;
		element.setAttributeNodeNS(created);
	}
}
