import { requestRender } from './render.ts';
import { type Host, HostApi } from './host.ts';
import { FocusApi, getFocus } from './focus.ts';

export function installHostRenderer(host: Host): void {
	HostApi.around(host.root, {
		insertBefore([node, parent, child, anchor], next) {
			const originalParentNode = child.parent?.node ?? null;

			next(node, parent, child, anchor);

			if (originalParentNode) {
				requestRender(originalParentNode, 'structure');
			}

			if (parent.node && parent.node !== originalParentNode) {
				requestRender(parent.node, 'structure');
			}
		},
		removeChild([root, parent, child], next) {
			next(root, parent, child);

			if (parent.node) {
				requestRender(parent.node, 'structure');
			}
		},
		setProperty([root, element, name, value], next) {
			const previous = element.properties[name];
			next(root, element, name, value);

			if (element.node && !Object.is(previous, element.properties[name])) {
				requestRender(element.node, 'property');
			}
		},
		setText([root, text, content], next) {
			const previous = text.content;
			next(root, text, content);

			if (previous !== text.content && text.parent && text.parent.node) {
				requestRender(text.parent.node, 'text');
			}
		},
	});

	FocusApi.around(host.root, {
		setFocus([node], next) {
			const original = getFocus(node);
			next(node);
			if (original !== node) {
				requestRender(node, 'focus');
			}
		},
	});
}
