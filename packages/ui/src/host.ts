// oxlint-disable max-params
import { type Node, create, createApi, createContext, destroy, LifecycleApi } from './core.ts';
import {
	getElement,
	setElement,
	type HostElementChild,
	type HostElement,
	type HostLiteral,
} from './elements.ts';

export interface Host {
	root: Node;
	element: HostElement;
	createElement(type: string): HostElement;
	createLiteral(content: string): HostLiteral;
	insertBefore(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void;
	removeChild(parent: HostElement, child: HostElementChild): void;
	setProperty(element: HostElement, name: string, value: unknown): void;
	setText(text: HostLiteral, content: string): void;
}

export function createHost(): Host {
	const root = create();
	const element: HostElement = {
		type: 'element',
		name: 'root',
		node: root,
		parent: null,
		properties: {},
		children: [],
	};

	setElement(root, element);

	LifecycleApi.around(root, {
		destroy([node], next) {
			const element = getElement(node);
			if (element.detach) {
				element.detach(node);
			}
			element.node = null;
			return next(node);
		},
	});

	const host: Host = {
		root,
		element,
		createElement(type) {
			return HostApi.methods.createElement(root, type);
		},
		createLiteral(content) {
			return HostApi.methods.createLiteral(root, content);
		},
		insertBefore(parent, child, anchor) {
			return HostApi.methods.insertBefore(root, parent, child, anchor);
		},
		removeChild(parent, child) {
			return HostApi.methods.removeChild(root, parent, child);
		},
		setProperty(element, name, value) {
			return HostApi.methods.setProperty(root, element, name, value);
		},
		setText(text, value) {
			return HostApi.methods.setText(root, text, value);
		},
	};

	HostContext.set(root, host);
	return host;
}

export const HostApi = createApi('host', {
	createElement(node, name: string): HostElement {
		return {
			type: 'element',
			name,
			node: null,
			parent: null,
			properties: {},
			children: [],
		};
	},
	createLiteral(node, content: string): HostLiteral {
		return { type: 'literal', content };
	},
	insertBefore(
		node,
		parent: HostElement,
		child: HostElementChild,
		anchor?: HostElementChild,
	): void {
		if (child.parent !== parent) {
			if (child.type === 'element') {
				detach(child);

				if (isAttached(parent)) {
					attach(parent, child);
				}
			}
		}
		if (child.parent) {
			const currentIndex = child.parent.children.indexOf(child);
			child.parent.children.splice(currentIndex, 1);
		}
		const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
		parent.children.splice(index, 0, child);
		child.parent = parent;
	},
	removeChild(root, parent: HostElement, child: HostElementChild): void {
		if (child.parent === parent) {
			child.parent = null;
			parent.children.splice(parent.children.indexOf(child), 1);
			if (child.type === 'element') {
				detach(child);
			}
		}
	},
	setProperty(node, element: HostElement, name: string, value: unknown): void {
		if (typeof value === 'undefined') {
			delete element.properties[name];
		} else {
			element.properties[name] = value;
		}
	},

	setText(node, text: HostLiteral, content: string): void {
		text.content = content;
	},

	getHost(node): Host {
		return HostContext.expect(node);
	},
});

const HostContext = createContext<Host>('host');

function isAttached(element: HostElement): boolean {
	return !!element.node;
}

function attach(parent: HostElement, child: HostElement): void {
	child.node = create(parent.node!);
	setElement(child.node, child);

	if (child.attach) {
		child.attach(child.node);
	}
	for (const grandchild of child.children) {
		if (grandchild.type === 'element') {
			attach(child, grandchild);
		}
	}
}

function detach(child: HostElement): void {
	if (child.node) {
		destroy(child.node);
	}
}
