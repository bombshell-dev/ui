import { createContext, LifecycleApi, type Node } from './core.ts';
import { Api } from './core/api.ts';
import { getElement, type HostElement, type HostElementChild } from './elements.ts';
import { HostApi, type Host } from './host.ts';

export class FocusApi extends Api {
	current: Node;
	private transitionVersion = 0;

	constructor(location: Node) {
		super(location);
		this.current = location;

		// Moves destroy nodes without passing through HostApi.removeChild.
		LifecycleApi.decorate(location, () => ({
			destroy(node) {
				const focus = FocusApi.at(this.node);
				const host = getHost(this.node);
				if (node !== host.root && contains(node, focus.current)) {
					focus.setFocus(host.root);
				}
				return super.destroy(node);
			},
		}));

		HostApi.decorate(location, () => ({
			removeChild(parent, removed) {
				if (!parent.node || (removed.type === 'element' && !removed.node)) {
					return super.removeChild(parent, removed);
				}
				const node = parent.node;
				const focus = FocusApi.at(node);
				const host = getHost(node);
				if (removed.type === 'element' && contains(removed.node!, focus.current)) {
					const tail = lastElementOf(removed);

					const after = forward({ start: tail });
					const before = forward({
						start: host.element,
						limit: removed,
					});

					const replacement = findFocus(concat(after, before)) ?? host.root;

					focus.setFocus(replacement);
				}

				return super.removeChild(parent, removed);
			},
		}));
	}

	setFocusable(focusable = true): void {
		const { node } = this;
		FocusableContext.set(node, focusable);

		const host = getHost(node);

		if (!focusable && this.current === node) {
			this.setFocus(host.root);
		} else if (this.current === host.root && focusable) {
			this.setFocus(node);
		}
	}

	setFocus(node: Node, options: { force?: boolean } = {}): void {
		if (!options.force && !isFocusable(node) && node !== getHost(node).root) {
			throw new UnfocusableElementError(node);
		}
		const previous = this.current;
		if (previous !== node) {
			this.current = node;
			const version = ++this.transitionVersion;
			getElement(previous).blurredCallback?.(previous);
			// A redirect away and back also supersedes this transition's notification.
			if (this.current === node && this.transitionVersion === version) {
				getElement(node).focusedCallback?.(node);
			}
		}
	}

	getFocus(): Node {
		return this.current;
	}

	canFocus(node: Node): boolean {
		return isFocusable(node);
	}

	advanceFocus(): void {
		const current = this.current;
		const element = getElement(current);
		const host = getHost(this.node);

		const downward = forward({ start: element });
		const fromTop = forward({ start: host.element, limit: element });

		const next = findFocus(concat(downward, fromTop));

		if (next) {
			this.setFocus(next);
		}
	}

	retreatFocus(): void {
		const current = this.current;
		const element = getElement(current);
		const host = getHost(this.node);

		const upward = reverse({ start: element });

		const fromBottom = reverse({
			start: host.element,
			limit: element,
		});

		const previous = findFocus(concat(upward, fromBottom));

		if (previous) {
			this.setFocus(previous);
		}
	}
}

export function installFocus(host: Host): void {
	try {
		FocusApi.at(host.root);
	} catch {
		FocusApi.init(host.root);
	}
}

export function setFocusable(node: Node, focusable = true): void {
	const root = HostApi.at(node).getHost().root;
	installFocus(HostApi.at(root).getHost());
	FocusApi.at(node).setFocusable(focusable);
}

export function setFocus(node: Node): void {
	FocusApi.at(node).setFocus(node);
}

export function getFocus(node: Node): Node {
	return FocusApi.at(node).getFocus();
}

function getHost(node: Node): Host {
	return HostApi.at(node).getHost();
}

const FocusableContext = createContext<boolean>('focusable', false);

function isFocusable(node: Node): boolean {
	return FocusableContext.hasOwn(node) && FocusableContext.expect(node);
}

interface Range {
	start: HostElementChild;
	limit?: HostElement;
}

function* forward(range: Range): Iterable<HostElement> {
	type Tier = {
		siblings: HostElementChild[];
		index: number;
	};
	const tiers: Tier[] = [
		{
			siblings: range.start.type === 'element' ? range.start.childNodes : [],
			index: 0,
		},
	];

	let current = range.start;
	while (current.parent) {
		const siblings = current.parent.childNodes;
		tiers.unshift({ siblings, index: siblings.indexOf(current) + 1 });
		current = current.parent;
	}

	while (tiers.length > 0) {
		const tier = tiers[tiers.length - 1]!;
		const child = tier.siblings[tier.index++];
		if (!child) {
			tiers.pop();
			continue;
		}
		if (child === range.limit) {
			break;
		}
		if (child.type === 'element') {
			if (child !== range.start) {
				yield child;
			}
			tiers.push({ siblings: child.childNodes, index: 0 });
		}
	}
}

function* reverse(range: Range): Iterable<HostElement> {
	interface Tier {
		siblings: HostElementChild[];
		index: number;
		owner?: HostElement;
	}

	const tiers: Tier[] = [];

	if (!range.start.parent) {
		// host.element acts as the position after the entire tree.
		if (range.start.type === 'element') {
			tiers.push({
				siblings: range.start.childNodes,
				index: range.start.childNodes.length - 1,
			});
		}
	} else {
		let current = range.start;

		while (current.parent) {
			const parent = current.parent;
			const siblings = parent.childNodes;

			tiers.unshift({
				siblings,
				index: siblings.indexOf(current) - 1,
				// Yield the parent after its preceding children, except for host.element.
				owner: parent.parent ? parent : undefined,
			});

			current = parent;
		}
	}

	while (tiers.length > 0) {
		const tier = tiers[tiers.length - 1]!;

		if (tier.index < 0) {
			tiers.pop();

			if (tier.owner) {
				if (tier.owner === range.limit) {
					break;
				}

				yield tier.owner;
			}

			continue;
		}

		const child = tier.siblings[tier.index--];

		if (child?.type === 'element') {
			tiers.push({
				siblings: child.childNodes,
				index: child.childNodes.length - 1,
				owner: child,
			});
		}
	}
}

function* concat<A>(...iterables: Iterable<A>[]): Generator<A> {
	for (const iterable of iterables) {
		yield* iterable;
	}
}

function findFocus(elements: Iterable<HostElement>): Node | undefined {
	for (const element of elements) {
		if (element.node && isFocusable(element.node)) {
			return element.node!;
		}
	}
}

function lastElementOf(element: HostElement): HostElement {
	const children = element.childNodes;
	let last: HostElement | undefined = void 0;
	for (let i = children.length - 1; i >= 0; i--) {
		const child = children[i];
		if (child && child.type === 'element') {
			last = child;
			break;
		}
	}
	return last ? lastElementOf(last) : element;
}

function contains(node: Node, descendant: Node): boolean {
	if (node === descendant) {
		return true;
	} else {
		for (const child of node.children) {
			if (contains(child, descendant)) {
				return true;
			}
		}
	}
	return false;
}

class UnfocusableElementError extends TypeError {
	readonly code = 'CLACK_UI_UNFOCUSABLE_ELEMENT';
	readonly node: Node;

	constructor(node: Node) {
		super('attempted to focus an unfocusable element');
		this.name = 'UnfocusableElementError';
		this.node = node;
	}
}
