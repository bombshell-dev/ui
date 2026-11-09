export function removeWhiteSpaceOnlyTextNodes(node: Node, Node: typeof globalThis.Node) {
	for (var i = 0; i < node.childNodes.length; i++) {
		var child = node.childNodes[i]!;
		if (child.nodeType === Node.TEXT_NODE && child.nodeValue!.trim().length == 0) {
			node.removeChild(child);
			i--;
		} else if (
			child.nodeType === Node.ELEMENT_NODE ||
			child.nodeType === Node.DOCUMENT_FRAGMENT_NODE
		) {
			removeWhiteSpaceOnlyTextNodes(child, Node);
		}
	}
	if ((node as Element).shadowRoot) {
		removeWhiteSpaceOnlyTextNodes((node as Element).shadowRoot!, Node);
	}
}

export function createTestTree<T>(document: Document, node: HTMLElement): T {
	let ids: Record<string, Element | ShadowRoot> = {};

	function attachShadowFromTemplate(template: HTMLTemplateElement) {
		let parent = template.parentNode as HTMLElement;
		parent.removeChild(template);
		let shadowRoot;
		if (template.getAttribute('data-slot-assignment') === 'manual') {
			shadowRoot = parent.attachShadow({
				mode: template.getAttribute('data-mode') as ShadowRootMode,
				slotAssignment: 'manual',
			});
		} else {
			shadowRoot = parent.attachShadow({
				mode: template.getAttribute('data-mode') as ShadowRootMode,
			});
		}
		let id = template.id;
		if (id) {
			(shadowRoot as ShadowRoot & { id: string }).id = id;
			ids[id] = shadowRoot;
		}
		shadowRoot.appendChild(document.importNode(template.content, true));
		return shadowRoot;
	}

	function walk(root: Element | (ShadowRoot & { id?: string })) {
		if (root.id) {
			ids[root.id] = root;
		}
		for (let e of Array.from(root.querySelectorAll('[id]'))) {
			ids[e.id] = e;
		}
		for (let e of Array.from(root.querySelectorAll('template'))) {
			walk(attachShadowFromTemplate(e));
		}
	}

	walk(node.cloneNode(true) as Element);
	return ids as T;
}
