import { parse, defaultTreeAdapter as tree, type DefaultTreeAdapterTypes } from 'parse5';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

class UnsupportedFixtureError extends Error {}

/** Materialize the parsed document through the consumer's DOM. Scripts remain inert. */
export function populateDocument(subject: unknown, html: string): void {
	const document = subject as Document;
	const parsed = parse(html);
	while (document.firstChild) {
		document.removeChild(document.firstChild);
	}
	const pending: { source: DefaultTreeAdapterTypes.ParentNode; target: Node }[] = [
		{ source: parsed, target: document },
	];
	while (pending.length > 0) {
		const { source, target } = pending.pop()!;
		for (const child of source.childNodes) {
			if (tree.isTextNode(child)) {
				target.appendChild(document.createTextNode(child.value));
			} else if (tree.isCommentNode(child)) {
				target.appendChild(document.createComment(child.data));
			} else if (tree.isDocumentTypeNode(child)) {
				target.appendChild(
					document.implementation.createDocumentType(child.name, child.publicId, child.systemId),
				);
			} else if (tree.isElementNode(child)) {
				if (child.namespaceURI === HTML_NS && child.tagName === 'frameset') {
					throw new UnsupportedFixtureError('Frameset fixtures are not supported');
				}
				if ('content' in child) {
					throw new UnsupportedFixtureError('Template fixtures are not supported');
				}
				const element =
					child.namespaceURI === HTML_NS
						? document.createElement(child.tagName)
						: document.createElementNS(child.namespaceURI, child.tagName);
				copyAttributes(child, element);
				target.appendChild(element);
				pending.push({ source: child, target: element });
			}
		}
	}
}

function copyAttributes(source: DefaultTreeAdapterTypes.Element, target: Element): void {
	for (const attribute of source.attrs) {
		const name = attribute.prefix ? `${attribute.prefix}:${attribute.name}` : attribute.name;
		if (attribute.namespace) {
			target.setAttributeNS(attribute.namespace, name, attribute.value);
		} else {
			target.setAttribute(name, attribute.value);
		}
	}
}
