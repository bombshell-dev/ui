// oxlint-disable max-params bombshell-dev/max-params
import { createContext, type Context } from './context.ts';
import type { Node } from './node.ts';

export abstract class Api {
	/**
	 * Every api method is dispatched at a node in the tree.
	 */
	declare readonly node: Node;

	constructor(location: Node) {
		void location;
	}

	static init<T extends Api, Params extends unknown[]>(
		this: new (...params: [Node, ...Params]) => T,
		node: Node,
		...params: Params
	): T {
		const contexts = contextsFor(this);
		const value = new this(node, ...params);
		contexts.impl.set(node, value);
		recompile(this, node);
		return ensureHandle(this, node);
	}

	static at<T extends Api, Params extends unknown[]>(
		this: new (...params: Params) => T,
		node: Node,
	): T {
		const contexts = contextsFor(this);

		// Throw without allocating a handle.
		contexts.impl.expect(node);

		return ensureHandle(this, node);
	}

	static decorate<T extends Api, Params extends unknown[]>(
		this: new (...params: Params) => T,
		node: Node,
		factory: () => Decorator<T>,
	): void {
		const contexts = contextsFor(this);
		let state = contexts.decorators.hasOwn(node) ? contexts.decorators.get(node) : undefined;
		if (!state) {
			state = [];
			contexts.decorators.set(node, state);
		}
		state.push(factory);

		recompile(this, node);
	}
}
/**
 * A type that represents just the methods (no fields) of an Api object. That way, it can decorate it.
 */
export type Decorator<T extends Api> = ThisType<T> & {
	[M in keyof T as T[M] extends (...args: never[]) => unknown ? M : never]?: T[M];
};

function recompile<T extends Api, Params extends unknown[]>(
	constructor: new (...params: Params) => T,
	node: Node,
	stack?: Array<() => Decorator<T>>,
): void {
	const context = contextsFor(constructor);
	const local = context.decorators.hasOwn(node) ? context.decorators.expect(node) : [];
	const layers = stack
		? stack.concat(local)
		: lineageOf(node).flatMap((node) => {
				return context.decorators.hasOwn(node) ? context.decorators.expect(node) : [];
			});

	const impl = context.impl.get(node);

	if (impl && (context.impl.hasOwn(node) || local.length > 0)) {
		const head = layers.reduceRight<object>((next, factory) => {
			const layer = factory();
			Object.setPrototypeOf(layer, next);
			return layer;
		}, impl) as T;

		context.assembly.set(node, { head, implementation: impl });
	}

	//if this node has a handle checked out.
	const handle = context.handle.hasOwn(node) ? context.handle.expect(node) : undefined;

	if (handle) {
		const assembly = context.assembly.expect(node);
		handle.current.assembly = assembly;
	}

	for (const child of node.children) {
		recompile(constructor, child, layers);
	}
}

/**
 * A reference to an `Api` that never goes stale even if
 * implementations are swapped out or decorators are added. That way,
 * you can say `Api.at(node)` and you'll get the same object over and
 * over.
 */
interface Handle<T extends Api> {
	proxy: T;
	current: { assembly: Assembly<T> };
}

function createHandle<T extends Api, Params extends unknown[]>(
	constructor: new (...params: Params) => T,
	node: Node,
	assembly: Assembly<T>,
): Handle<T> {
	const current = { assembly };

	const handle: Handle<T> = {
		current,
		proxy: new Proxy(Object.create(constructor.prototype), {
			get(_, key) {
				if (key === 'node') {
					return node;
				}
				const { head, implementation } = current.assembly;
				if (typeof assembly.head[key as keyof T] === 'function') {
					return Reflect.get(head, key, handle.proxy);
				}
				return Reflect.get(implementation, key, handle.proxy);
			},
			set(_, key, value) {
				if (key === 'node') {
					return false;
				}
				const { implementation } = current.assembly;
				return Reflect.set(implementation, key, value, implementation);
			},
		}),
	};
	return handle;
}

function ensureHandle<T extends Api, Params extends unknown[]>(
	constructor: new (...params: Params) => T,
	node: Node,
): T {
	const contexts = contextsFor(constructor);
	let handle = contexts.handle.hasOwn(node) ? contexts.handle.expect(node) : undefined;

	if (!handle) {
		handle = createHandle(constructor, node, contexts.assembly.expect(node));
		contexts.handle.set(node, handle);
	}
	return handle.proxy;
}

function lineageOf(node: Node): Node[] {
	const lineage: Node[] = [node];
	for (let current: Node | undefined = node.parent; current; current = current.parent) {
		lineage.push(current);
	}
	return lineage.reverse();
}

let ids = 0;
const contexts = new WeakMap<object, Contexts<Api>>();

function contextsFor<T extends Api, Params extends unknown[]>(
	constructor: new (...params: Params) => T,
): Contexts<T> {
	let context = contexts.get(constructor) as Contexts<T>;
	if (!context) {
		context = {
			impl: createContext(`api::${constructor.name}::${ids++}::impl`),
			decorators: createContext(`api::${constructor.name}::${ids++}::decorators`),
			handle: createContext(`api::${constructor.name}::${ids++}::handle`),
			assembly: createContext(`api::${constructor.name}::${ids++}::assembly`),
		};
		contexts.set(constructor, context);
	}

	return context;
}

interface Contexts<T extends Api> {
	impl: Context<T>;
	decorators: Context<Array<() => Decorator<T>>>;
	handle: Context<Handle<T>>;
	assembly: Context<Assembly<T>>;
}

interface Assembly<T extends Api> {
	head: T;
	implementation: T;
}
