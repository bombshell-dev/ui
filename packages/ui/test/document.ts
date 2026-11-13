/* oxlint-disable bombshell-dev/exported-function-async -- WPT document creation is synchronous. */
import { parse, defaultTreeAdapter as tree, type DefaultTreeAdapterTypes } from 'parse5';
import type { DOMDocumentOptions } from '@bomb.sh/web-platform-tests';
import { Document, type Element } from '../src/dom.ts';

const HTML_NS = 'http://www.w3.org/1999/xhtml';

class UnsupportedFixtureError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UnsupportedFixtureError';
	}
}

/** Parse test markup and materialize its element tree using the UI's own DOM. */
export function createDocument(options?: DOMDocumentOptions): Document {
	const document = new Document(() => {});
	if (!options) return document;
	if (options.contentType !== 'text/html') {
		throw new UnsupportedFixtureError(`Unsupported fixture MIME type: ${options.contentType}`);
	}
	if (options.fragment !== undefined) {
		throw new UnsupportedFixtureError('URL fragments are not supported by the UI fixture');
	}
	const parsed = parse(options.content);
	const root = parsed.childNodes.find(tree.isElementNode)!;
	if (!root.childNodes.some((node) => tree.isElementNode(node) && node.tagName === 'body')) {
		throw new UnsupportedFixtureError('Frameset documents are not supported by the UI fixture');
	}
	const body = document.body;
	while (document.documentElement.firstChild) document.documentElement.firstChild.remove();
	copyAttributes(root, document.documentElement);
	const pending = [{ source: root, target: document.documentElement }];
	while (pending.length > 0) {
		const { source, target } = pending.pop()!;
		for (const child of source.childNodes) {
			if (tree.isTextNode(child)) {
				target.appendChild(document.createTextNode(child.value));
			} else if (tree.isCommentNode(child)) {
				target.appendChild(document.createComment(child.data));
			} else if (tree.isElementNode(child)) {
				if ('content' in child || child.tagName === 'script') {
					throw new UnsupportedFixtureError(
						'Templates and scripts are not supported by the UI fixture',
					);
				}
				const element =
					source === root && child.tagName === 'body' && body
						? body
						: child.namespaceURI === HTML_NS
							? document.createElement(child.tagName)
							: document.createElementNS(child.namespaceURI, child.tagName);
				copyAttributes(child, element);
				target.appendChild(element);
				pending.push({ source: child, target: element });
			}
		}
	}
	return document;
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
