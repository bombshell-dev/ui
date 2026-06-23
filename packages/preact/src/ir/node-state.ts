import { Document, Element, type Node } from './dom.ts';

// Tracks each instrumented element's id + captured props off-DOM (in a WeakMap),
// so `dom.ts` stays a pure Preact host.
interface NodeState {
	id: string;
	props: Record<string, unknown>;
}

const states = new WeakMap<Node, NodeState>();
let nextId = 0;

// Force Preact down the property path (`has` → `name in dom` is always true) so
// host props are captured as-is into the props bag, while its `__`-prefixed
// expandos and real Node members still assign normally.
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

// Preact creates host nodes via `ownerDocument`, so wrapping them here
// instruments the whole tree.
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
