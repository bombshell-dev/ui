// oxlint-disable bombshell-dev/exported-function-async -- Solid renderer setup and Host roots are synchronous.
// oxlint-disable max-params -- Renderer option signatures are fixed by solid-js.
import type { Host } from '@clack/ui';
import type { ElementChild, HostElement, TextLiteral } from '@clack/ui/elements';
import type { HostEventListener, HostEventType } from '@clack/ui/events';
import { getOwner, type Owner } from 'solid-js';
import { createRenderer as createUniversalRenderer } from 'solid-js/universal';
import type { JSXElement } from './types.ts';

export {
	effect,
	memo,
	createComponent,
	createElement,
	createTextNode,
	insertNode,
	insert,
	spread,
	setProp,
	mergeProps,
	use,
};

export interface Root {
	readonly host: Host;
	/** Reconcile a Solid component tree into the Host. */
	render(code: () => JSXElement): void;
	/** Dispose the Solid owner and detach its Host subtree. */
	unmount(): void;
}

/** Create a Solid root which mutates an existing framework-neutral Host. */
export function createRoot(host: Host): Root {
	nodeHosts.set(host.element, host);
	let dispose: (() => void) | undefined;

	function unmount(): void {
		dispose?.();
		dispose = undefined;
		for (const child of host.element.children.slice()) {
			host.removeChild(host.element, child);
		}
	}

	return {
		host,
		render(code) {
			unmount();
			dispose = universal.render(() => {
				const owner = getOwner();
				if (!owner) throw new MissingSolidHostError(owner);
				ownerHosts.set(owner, host);
				return code() as unknown as ElementChild;
			}, host.element);
		},
		unmount,
	};
}

const universal = createUniversalRenderer<ElementChild>({
	createElement(name) {
		const host = currentHost();
		const element = host.createElement(name);
		nodeHosts.set(element, host);
		return element;
	},
	createTextNode(value) {
		const host = currentHost();
		const text = host.createText(String(value));
		nodeHosts.set(text, host);
		return text;
	},
	replaceText(node, value) {
		hostFor(node).setText(expectText(node, 'replaceText'), String(value));
	},
	isTextNode(node) {
		return node.type === 'literal';
	},
	setProperty(node, name, value, previous) {
		const host = hostFor(node);
		const element = expectElement(node, 'setProperty');
		const type = eventType(name);
		if (type) {
			const previousListener = eventListener(previous);
			const nextListener = eventListener(value);
			if (previousListener) host.removeEventListener(element, type, previousListener);
			if (nextListener) host.addEventListener(element, type, nextListener);
		} else {
			host.setProperty(element, name, value);
		}
	},
	insertNode(parent, node, anchor) {
		const host = hostFor(parent);
		nodeHosts.set(node, host);
		host.insertBefore(expectElement(parent, 'insertNode'), node, anchor);
	},
	removeNode(parent, node) {
		hostFor(parent).removeChild(expectElement(parent, 'removeNode'), node);
	},
	getParentNode(node) {
		return node.parent ?? undefined;
	},
	getFirstChild(node) {
		return node.type === 'element' ? node.children[0] : undefined;
	},
	getNextSibling(node) {
		const parent = node.parent;
		if (!parent) return undefined;
		const index = parent.children.indexOf(node);
		return parent.children[index + 1];
	},
});

const {
	effect,
	memo,
	createComponent,
	createElement,
	createTextNode,
	insertNode,
	insert,
	spread,
	setProp,
	mergeProps,
	use,
} = universal;

const ownerHosts = new WeakMap<Owner, Host>();
const nodeHosts = new WeakMap<ElementChild, Host>();

class MissingSolidHostError extends Error {
	readonly code = 'CLACK_SOLID_MISSING_HOST';
	readonly owner: Owner | null;

	constructor(owner: Owner | null) {
		super('Solid renderer operation does not belong to a Host root');
		this.name = 'MissingSolidHostError';
		this.owner = owner;
	}
}

class InvalidSolidHostNodeError extends Error {
	readonly code = 'CLACK_SOLID_INVALID_HOST_NODE';
	readonly operation: string;
	readonly node: ElementChild;

	constructor(operation: string, node: ElementChild) {
		super(`Solid renderer ${operation} received a ${node.type} node`);
		this.name = 'InvalidSolidHostNodeError';
		this.operation = operation;
		this.node = node;
	}
}

function currentHost(): Host {
	let owner = getOwner();
	const initialOwner = owner;
	while (owner) {
		const host = ownerHosts.get(owner);
		if (host) return host;
		owner = owner.owner;
	}
	throw new MissingSolidHostError(initialOwner);
}

function hostFor(node: ElementChild): Host {
	const host = nodeHosts.get(node);
	if (!host) throw new MissingSolidHostError(getOwner());
	return host;
}

function expectElement(node: ElementChild, operation: string): HostElement {
	if (node.type !== 'element') throw new InvalidSolidHostNodeError(operation, node);
	return node;
}

function expectText(node: ElementChild, operation: string): TextLiteral {
	if (node.type !== 'literal') throw new InvalidSolidHostNodeError(operation, node);
	return node;
}

function eventType(name: string): HostEventType | undefined {
	const first = name[2];
	if (!name.startsWith('on') || !first || first === first.toLowerCase()) return;
	return `${first.toLowerCase()}${name.slice(3)}` as HostEventType;
}

function eventListener(value: unknown): HostEventListener<HostEventType> | undefined {
	return typeof value === 'function' ? (value as HostEventListener<HostEventType>) : undefined;
}
