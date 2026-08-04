import { createContext, type Node } from './core.ts';
import { Api } from './core/api.ts';
import { getElement, type HostElement, type HostElementChild } from './elements.ts';
import { HostApi, type Host } from './host.ts';

export class FocusApi extends Api {
	current: Node;

	constructor(location: Node) {
		super(location);
		this.current = location;

		HostApi.decorate(location, () => ({
			removeChild(parent, removed) {
				const node = parent.node!;
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

	setFocusable(): void {
		const { node } = this;
		FocusableContext.set(node, true);

		const host = getHost(node);

		if (this.current === host.root) {
			this.current = node;
		}
	}

	setFocus(node: Node): void {
		if (!isFocusable(node) && node !== getHost(node).root) {
			throw new UnfocusableElementError(node);
		}
		this.current = node;
	}

	getFocus(): Node {
		return this.current;
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
			siblings: range.start.type === 'element' ? range.start.children : [],
			index: 0,
		},
	];

	let current = range.start;
	while (current.parent) {
		const siblings = current.parent.children;
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
			tiers.push({ siblings: child.children, index: 0 });
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
				siblings: range.start.children,
				index: range.start.children.length - 1,
			});
		}
	} else {
		let current = range.start;

		while (current.parent) {
			const parent = current.parent;
			const siblings = parent.children;

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
				siblings: child.children,
				index: child.children.length - 1,
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
		if (isFocusable(element.node!)) {
			return element.node!;
		}
	}
}

function lastElementOf(element: HostElement): HostElement {
	const { children } = element;
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
