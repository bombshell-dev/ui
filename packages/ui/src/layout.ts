import { snapshot, type Op } from '@bomb.sh/tty';
import { createApi, createContext, type Node } from './core.ts';

export const LayoutApi = createApi('layout', {
	layout(_): Iterable<Op> {
		return [];
	},
});

export const { layout } = LayoutApi.methods;

interface LayoutCacheState {
	entries: WeakMap<Node, CachedLayout>;
}

interface CachedLayout {
	ops: Op[];
	snapshot: readonly [Op];
}

const LayoutCacheContext = createContext<LayoutCacheState>('layout-cache');

export function installLayoutCache(root: Node): void {
	LayoutCacheContext.set(root, { entries: new WeakMap() });
}

export function invalidateLayout(node: Node): void {
	const state = LayoutCacheContext.get(node);
	if (!state) return;

	for (let current: Node | undefined = node; current; current = current.parent) {
		state.entries.delete(current);
	}
}

export function layoutCached(node: Node, compute: () => Iterable<Op>): Iterable<Op> {
	const state = LayoutCacheContext.get(node);
	if (!state) return compute();

	const cached = state.entries.get(node);
	if (cached) return cached.snapshot;

	const computed = compute();
	const ops = Array.isArray(computed) ? computed : [...computed];
	state.entries.set(node, {
		ops,
		snapshot: [snapshot(ops)],
	});
	return ops;
}

export function getCachedLayout(node: Node): Op[] | undefined {
	return LayoutCacheContext.get(node)?.entries.get(node)?.ops;
}
