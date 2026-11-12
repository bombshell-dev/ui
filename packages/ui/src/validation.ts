const XML_NS = 'http://www.w3.org/XML/1998/namespace';
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/';

export function validateElementName(localName: string): void {
	if (
		!/^(?:[A-Za-z][^\0\t\n\f\r\u0020/>]*|[:_\u0080-\u{10FFFF}][A-Za-z0-9_.:\-\u0080-\u{10FFFF}]*)$/u.test(
			localName,
		)
	) {
		throw new DOMException('Invalid element name', 'InvalidCharacterError');
	}
}

export function validateElementNamespace(
	namespaceURI: string | null,
	qualifiedName: string,
): { prefix: string | null; localName: string } {
	return validateNamespace(namespaceURI, { qualifiedName, validateLocalName: validateElementName });
}

export function validateAttributeName(localName: string): void {
	if (!/^[^\0\t\n\f\r\u0020/=>]+$/u.test(localName)) {
		throw new DOMException('Invalid attribute name', 'InvalidCharacterError');
	}
}

export function validateAttributeNamespace(
	namespaceURI: string | null,
	qualifiedName: string,
): { prefix: string | null; localName: string } {
	return validateNamespace(namespaceURI, {
		qualifiedName,
		validateLocalName: validateAttributeName,
	});
}

function validateNamespace(
	namespaceURI: string | null,
	{
		qualifiedName,
		validateLocalName,
	}: { qualifiedName: string; validateLocalName: (localName: string) => void },
): { prefix: string | null; localName: string } {
	const colonIndex = qualifiedName.indexOf(':');
	const prefix = colonIndex < 0 ? null : qualifiedName.slice(0, colonIndex);
	const localName = colonIndex < 0 ? qualifiedName : qualifiedName.slice(colonIndex + 1);

	if (prefix !== null && !/^[^\0\t\n\f\r\u0020/>]+$/u.test(prefix)) {
		throw new DOMException('Invalid namespace prefix', 'InvalidCharacterError');
	}
	validateLocalName(localName);
	if (
		(prefix !== null && namespaceURI === null) ||
		(prefix === 'xml' && namespaceURI !== XML_NS) ||
		((qualifiedName === 'xmlns' || prefix === 'xmlns') && namespaceURI !== XMLNS_NS) ||
		(namespaceURI === XMLNS_NS && qualifiedName !== 'xmlns' && prefix !== 'xmlns')
	) {
		throw new DOMException('Invalid namespace for qualified name', 'NamespaceError');
	}
	return { prefix, localName };
}
