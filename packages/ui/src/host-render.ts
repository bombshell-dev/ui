// oxlint-disable max-params
import { RenderApi } from './render.ts';
import { type Host, HostApi } from './host.ts';
import { FocusApi } from './focus.ts';

export function useHostRenderer(host: Host): void {
	HostApi.decorate(host.root, () => ({
		insertBefore(parent, child, anchor) {
			const originalParentNode = child.parent?.node ?? null;

			super.insertBefore(parent, child, anchor);

			if (originalParentNode) {
				RenderApi.at(originalParentNode).request();
			}

			if (parent.node && parent.node !== originalParentNode) {
				RenderApi.at(parent.node).request();
			}
		},
		removeChild(parent, child) {
			super.removeChild(parent, child);

			if (parent.node) {
				RenderApi.at(parent.node).request();
			}
		},
		setProperty(element, name, value) {
			super.setProperty(element, name, value);

			if (element.node) {
				RenderApi.at(element.node).request();
			}
		},
		setText(text, content) {
			super.setText(text, content);

			if (text.parent && text.parent.node) {
				RenderApi.at(text.parent.node).request();
			}
		},
	}));

	FocusApi.decorate(host.root, () => ({
		setFocus(node, options) {
			const original = this.current;
			super.setFocus(node, options);
			if (original !== node) {
				RenderApi.at(node).request();
			}
		},
	}));
}
