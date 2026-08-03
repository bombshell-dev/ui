// oxlint-disable max-params
import { text } from '@bomb.sh/tty';
import { type Node, lifecycle, LifecycleApi } from './core.ts';
import { Api } from './core/api.ts';
import {
	getElement,
	setElement,
	type HostElementChild,
	type HostElement,
	type HostLiteral,
} from './elements.ts';
import { LayoutApi } from './layout.ts';

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

export class HostApi extends Api implements Host {
	root: Node;
	element: HostElement;

	constructor(root: Node) {
		super(root);
		this.root = root;
		this.element = {
			type: 'element',
			name: 'root',
			node: root,
			parent: null,
			properties: {},
			children: [],
		};

		const { element } = this;

		setElement(root, this.element);

		LifecycleApi.decorate(root, () => ({
			destroy(node) {
				const element = getElement(node);
				if (element.detach) {
					element.detach(node);
				}
				element.node = null;
				return super.destroy(node);
			},
		}));

		LayoutApi.decorate(root, () => ({
			*layout() {
				if (this.node !== root) {
					return yield* super.layout();
				}
				let content = '';
				for (const child of element.children) {
					if (child.type === 'element') {
						if (content !== '') {
							yield text(content);
							content = '';
						}
						yield* LayoutApi.at(child.node!).layout();
					} else {
						content += child.content;
					}
				}
				if (content !== '') {
					yield text(content);
				}
			},
		}));
	}

	createElement(name: string): HostElement {
		return {
			type: 'element',
			name,
			node: null,
			parent: null,
			properties: {},
			children: [],
		};
	}

	createLiteral(content: string): HostLiteral {
		return { type: 'literal', content };
	}

	insertBefore(parent: HostElement, child: HostElementChild, anchor?: HostElementChild): void {
		if (child.parent !== parent) {
			if (child.type === 'element') {
				detach(child);

				if (parent.node) {
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
	}

	removeChild(parent: HostElement, child: HostElementChild): void {
		if (child.parent === parent) {
			child.parent = null;
			parent.children.splice(parent.children.indexOf(child), 1);
			if (child.type === 'element') {
				detach(child);
			}
		}
	}

	setProperty(element: HostElement, name: string, value: unknown): void {
		if (typeof value === 'undefined') {
			delete element.properties[name];
		} else {
			element.properties[name] = value;
		}
	}

	setText(text: HostLiteral, content: string): void {
		text.content = content;
	}

	getHost(): Host {
		return HostApi.at(this.root);
	}
}

export function createHost(): Host {
	return HostApi.init(lifecycle.create());
}

function attach(parent: HostElement, child: HostElement): void {
	child.node = lifecycle.create(parent.node!);
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
		LifecycleApi.at(child.node).destroy(child.node);
	}
}
