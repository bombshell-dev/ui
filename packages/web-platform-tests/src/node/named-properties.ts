const HTML_NS = 'http://www.w3.org/1999/xhtml';
const namedElements = new Set(['embed', 'form', 'img', 'object']);

class UnsupportedNamedAccessError extends Error {}

/** Resolve fixture names through the worker global without changing its realm. */
export function installNamedProperties(scope: object, document: Document): () => void {
	const prototype = Object.getPrototypeOf(scope);
	const namedProperties = Object.create(prototype) as object;
	Object.setPrototypeOf(
		scope,
		new Proxy(namedProperties, {
			get(target, key, receiver) {
				return Reflect.has(target, key)
					? Reflect.get(target, key, receiver)
					: namedElement(document, key);
			},
			has(target, key) {
				return Reflect.has(target, key) || namedElement(document, key) !== undefined;
			},
		}),
	);
	// Names are never own properties, so enumeration omits them and assignments
	// create ordinary globals that shadow subsequent named lookups.
	return () => Object.setPrototypeOf(scope, prototype);
}

function namedElement(document: Document, key: PropertyKey): Element | undefined {
	if (typeof key !== 'string' || key === '') {
		return undefined;
	}
	let match: Element | undefined;
	const pending: Node[] = Array.from(document.childNodes);
	while (pending.length > 0) {
		const node = pending.pop()!;
		pending.push(...node.childNodes);
		if (node.nodeType !== 1) {
			continue;
		}
		const element = node as Element;
		const isHTML = element.namespaceURI === HTML_NS;
		const nameMatches = isHTML && element.getAttributeNS(null, 'name') === key;
		if (nameMatches && (element.localName === 'iframe' || element.localName === 'frame')) {
			throw new UnsupportedNamedAccessError(
				`Window named access to child browsing contexts is not supported: ${JSON.stringify(key)}`,
			);
		}
		if (
			element.getAttributeNS(null, 'id') === key ||
			(nameMatches && namedElements.has(element.localName))
		) {
			if (match) {
				throw new UnsupportedNamedAccessError(
					`Window named access with multiple matching elements is not supported: ${JSON.stringify(key)}`,
				);
			}
			match = element;
		}
	}
	return match;
}
