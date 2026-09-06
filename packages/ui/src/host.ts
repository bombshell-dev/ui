import { text } from '@bomb.sh/tty';
import { Node, createContext } from './core.ts';
import {
	setElement,
	type HostElementChild,
	type HostElement,
	type HostLiteral,
} from './elements.ts';
import { LayoutApi, layout } from './layout.ts';
import {
	addListener,
	dispatch,
	removeListener,
	type HostEvent,
	type HostEventType,
	type HostEventListener,
} from './events.ts';

/** Dispatched on an attached element before it leaves the tree, and on its ancestors. */
export interface ChildRemovedEvent extends HostEvent<'childremoved'> {}

declare module '@clack/ui/events' {
	interface HostEvents {
		childremoved: ChildRemovedEvent;
	}
}

/**
 * Set up an element as it is created: its attach and detach callbacks, its
 * exposed properties, and any listeners it needs.
 */
export type ElementDefinition = (element: HostElement) => void;

export interface Host {
	root: Node;
	element: HostElement;
	onRequestRender?: (node: Node) => void;
	defineElement(name: string, define: ElementDefinition): void;
	createElement(name: string): HostElement;
	createLiteral(content: string): HostLiteral;
	insertBefore(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void;
	removeChild(parent: HostElement, child: HostElementChild): void;
	setProperty(element: HostElement, name: string, value: unknown): void;
	setText(text: HostLiteral, content: string): void;
	addEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void;
	removeEventListener<T extends HostEventType>(
		element: HostElement,
		type: T,
		listener: HostEventListener<T>,
	): void;
}

export function createHost(): Host {
	const root = Node.createRoot();
	const element: HostElement = {
		type: 'element',
		name: 'root',
		node: root,
		parent: null,
		properties: {},
		children: [],
	};
	const definitions = new Map<string, ElementDefinition>();

	setElement(root, element);
	useRootLayout(root, element);

	const host: Host = {
		root,
		element,

		defineElement(name, define) {
			definitions.set(name, define);
		},

		createElement(name) {
			const created: HostElement = {
				type: 'element',
				name,
				node: null,
				parent: null,
				properties: {},
				children: [],
			};
			definitions.get(name)?.(created);
			return created;
		},

		createLiteral(content) {
			return { type: 'literal', content };
		},

		// oxlint-disable-next-line max-params
		insertBefore(parent, child, anchor) {
			const originalParentNode = child.parent?.node ?? null;

			if (child.parent !== parent && child.type === 'element') {
				detach(child);

				if (parent.node) {
					attach(parent, child);
				}
			}
			if (child.parent) {
				const currentIndex = child.parent.children.indexOf(child);
				child.parent.children.splice(currentIndex, 1);
			}
			const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
			parent.children.splice(index, 0, child);
			child.parent = parent;

			if (originalParentNode) {
				host.onRequestRender?.(originalParentNode);
			}
			if (parent.node && parent.node !== originalParentNode) {
				host.onRequestRender?.(parent.node);
			}
		},

		removeChild(parent, child) {
			if (child.parent === parent) {
				if (child.type === 'element' && child.node) {
					dispatch(child, { type: 'childremoved', target: child }, { bubbles: true });
				}

				child.parent = null;
				parent.children.splice(parent.children.indexOf(child), 1);
				if (child.type === 'element') {
					detach(child);
				}

				if (parent.node) {
					host.onRequestRender?.(parent.node);
				}
			}
		},

		// oxlint-disable-next-line max-params
		setProperty(target, name, value) {
			if (typeof value === 'undefined') {
				delete target.properties[name];
			} else {
				target.properties[name] = value;
			}

			if (target.node) {
				host.onRequestRender?.(target.node);
			}
		},

		setText(literal, content) {
			literal.content = content;

			if (literal.parent?.node) {
				host.onRequestRender?.(literal.parent.node);
			}
		},

		// oxlint-disable-next-line max-params
		addEventListener(target, type, listener) {
			addListener(target, type, listener);
		},

		// oxlint-disable-next-line max-params
		removeEventListener(target, type, listener) {
			removeListener(target, type, listener);
		},
	};

	HostContext.set(root, host);
	return host;
}

/** The host that owns `node`. */
export function getHost(node: Node): Host {
	return HostContext.expect(node);
}

const HostContext = createContext<Host>('host');

function attach(parent: HostElement, child: HostElement): void {
	child.node = parent.node!.createChild();
	setElement(child.node, child);
	child.node.ondestroy = (node) => {
		if (child.detach) {
			child.detach(node);
		}
		child.node = null;
	};

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
	child.node?.destroy();
}

function useRootLayout(root: Node, element: HostElement): void {
	LayoutApi.around(root, {
		*layout([node], next) {
			if (node !== root) {
				return yield* next(node);
			}
			let content = '';
			for (const child of element.children) {
				if (child.type === 'element') {
					if (content !== '') {
						yield text(content);
						content = '';
					}
					yield* layout(child.node!);
				} else {
					content += child.content;
				}
			}
			if (content !== '') {
				yield text(content);
			}
		},
	});
}
