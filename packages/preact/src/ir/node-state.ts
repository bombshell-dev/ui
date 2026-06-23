import { Document, Element, type Node } from './dom.ts';

/**
 * Sidecar that instruments the minimal DOM in `dom.ts` with the two things the
 * tty walker needs — a stable element id and a captured props bag — without
 * adding either to the DOM itself. State lives in a `WeakMap` keyed by the
 * element, so `dom.ts` stays a pure Preact host.
 */
interface NodeState {
	id: string;
	props: Record<string, unknown>;
}

const states = new WeakMap<Node, NodeState>();
let nextId = 0;

/**
 * Diverts the framework's host-prop writes into the off-DOM props bag.
 *
 * Preact assigns a prop via `dom[name] = value` only when `name in dom`,
 * otherwise it stringifies through `setAttribute`. The `has` trap reports every
 * name as present to force the property path, and the `set` trap captures those
 * writes — while leaving Preact's own `__`-prefixed expandos (e.g. `__k`, `__e`)
 * and real {@link Node} members to assign normally.
 */
const handler: ProxyHandler<Element> = {
	has() {
		return true;
	},
	set(target, key, value, receiver) {
		if (typeof key === 'string' && key[0] !== '_' && !(key in target)) {
			const state = states.get(receiver);
			if (state) {
				state.props[key] = value;
				return true;
			}
		}
		return Reflect.set(target, key, value, receiver);
	},
};

/**
 * A {@link Document} whose elements are wrapped so their id + props are tracked
 * in the sidecar. Preact creates host nodes through `ownerDocument`, so wrapping
 * here is enough to instrument the whole tree.
 */
class InstrumentedDocument extends Document {
	override createElementNS(namespaceURI: string | null, localName: string): Element {
		const element = super.createElementNS(namespaceURI, localName);
		const proxy = new Proxy(element, handler);
		states.set(proxy, { id: `e${nextId++}`, props: {} });
		return proxy;
	}
}

/** Create a fresh document whose elements are instrumented for the tty walker. */
export function createDocument(): Document {
	return new InstrumentedDocument();
}

/** Stable id for an instrumented element, or `''` for anything else (e.g. text). */
export function nodeId(node: Node): string {
	return states.get(node)?.id ?? '';
}

/** Captured host props for an instrumented element, or an empty record otherwise. */
export function nodeProps(node: Node): Record<string, unknown> {
	return states.get(node)?.props ?? {};
}
