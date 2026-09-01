// oxlint-disable no-explicit-any
import type { Node } from './node.ts';

/**
 * The shape every api implementation must satisfy: each member is a function
 * whose first parameter is the {@link Node} it operates on.
 */
type Core = Record<string, (node: Node, ...args: any[]) => any>;

/** An implementation with its node argument already applied. */
export type Bound<A> = {
	[K in keyof A]: A[K] extends (node: Node, ...args: infer TArgs) => infer TReturn
		? (...args: TArgs) => TReturn
		: never;
};

export interface Api<A extends Core> {
	for(node: Node): Bound<A>;
	provide(node: Node, extend: (base: A) => A): () => void;
}

export function createApi<A extends Core>(core: A): Api<A> {
	const fields = Object.keys(core) as (keyof A)[];
	const provided = new WeakMap<Node, A>();
	const bound = new WeakMap<Node, Binding<A>>();

	// Bumped whenever an implementation is provided or removed, so that bindings
	// made before it resolve again on their next call.
	let version = 0;

	// TODO (jg): possibly just have a generic `inherited(node, getter)` we use
	// here and the context
	function inherited(node: Node): A {
		for (let n: Node | undefined = node; n; n = n.parent) {
			const impl = provided.get(n);
			if (impl) {
				return impl;
			}
		}
		return core;
	}

	// Re-resolve a binding whose implementation was superseded since it was made.
	function refresh(node: Node, binding: Binding<A>): Binding<A> {
		if (binding.version !== version) {
			binding.impl = inherited(node);
			binding.version = version;
		}
		return binding;
	}

	return {
		for(node) {
			const cached = bound.get(node);
			if (cached) {
				return refresh(node, cached).methods;
			}

			const binding: Binding<A> = { version, impl: inherited(node), methods: {} as Bound<A> };
			for (const key of fields) {
				binding.methods[key] = ((...args: any[]) => {
					return refresh(node, binding).impl[key](node, ...args);
				}) as Bound<A>[keyof A];
			}
			bound.set(node, binding);
			return binding.methods;
		},

		provide(node, extend) {
			const previous = provided.get(node);
			const impl = extend(inherited(node));
			provided.set(node, impl);
			version++;

			return () => {
				if (provided.get(node) !== impl) {
					return;
				}
				if (previous) {
					provided.set(node, previous);
				} else {
					provided.delete(node);
				}
				version++;
			};
		},
	};
}

interface Binding<A> {
	version: number;
	impl: A;
	methods: Bound<A>;
}
