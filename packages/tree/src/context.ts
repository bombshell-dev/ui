import type { Node } from './node.ts';
/**
 * A `Context` defines a value which is in effect for a given {@link Node}.
 *
 * Unless a context value is set for a particular node, it will inherit its
 * value from that node's parent.
 */
export interface Context<T> {
	/**
	 * A unique identifier for this context.
	 */
	name: string;
	/**
	 * The value returned by this context when it is not present on a node.
	 */
	defaultValue?: T;

	set(node: Node, value: T): void;
	get(node: Node): T | undefined;
	expect(node: Node): T;
	hasOwn(node: Node): boolean;
}

/**
 * Create a new {@link Context}.
 *
 * @param name - the unique name to give this context.
 * @param defaultValue - the value used when the context is not present on a node.
 * @returns the new context
 */
export function createContext<T>(name: string, defaultValue?: T): Context<T> {
	function get(node: Node): T | undefined {
		const value = node.contexts[name] as T | undefined;
		return value === undefined ? defaultValue : value;
	}
	return {
		name,
		defaultValue,
		get,
		set: (node, value) => {
			node.contexts[name] = value;
		},
		expect: (node) => {
			const value = get(node);
			if (value === undefined) {
				throw new MissingContextError(name);
			} else {
				return value;
			}
		},
		hasOwn: (node) => Object.hasOwn(node.contexts, name),
	};
}

export class MissingContextError extends Error {
	constructor(name: string) {
		super(`no value set for context "${name}"`);
		this.name = 'MissingContextError';
	}
}
