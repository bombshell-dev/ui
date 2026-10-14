import { snapshot, type Op } from '@bomb.sh/tty';
import { Api } from './core/api.ts';
import type { Node } from './core/node.ts';
import { getElement } from './elements.ts';

export class LayoutApi extends Api {
	*layout(): Iterable<Op> {}
}

let layoutCacheEnabled = true;
let activeLayoutProfile: LayoutProfile | undefined;

export function layout(node: Node): Iterable<Op> {
	const profile = activeLayoutProfile;
	if (getElement(node).name === 'root') {
		if (profile) profile.rootCalls++;
		return [...LayoutApi.at(node).layout()];
	}
	if (!layoutCacheEnabled) {
		if (profile) profile.cacheBypasses++;
		const ops = [...LayoutApi.at(node).layout()];
		if (profile) profile.rawOpsGenerated += ops.length;
		return ops;
	}
	const cached = layoutCache.get(node);
	if (cached) {
		if (profile) {
			profile.cacheHits++;
			profile.snapshotOpsReused += cached.snapshot.length;
			for (const op of cached.snapshot) {
				if (op.directive === 5) profile.snapshotBytesReused += op.data.length;
			}
		}
		return cached.snapshot;
	}

	if (profile) profile.cacheMisses++;
	const ops = [...LayoutApi.at(node).layout()];
	if (profile) profile.rawOpsGenerated += ops.length;
	const snapshotOps = [snapshot(ops)];
	if (profile) {
		profile.snapshotsCreated++;
		profile.snapshotInputOps += ops.length;
		const packed = snapshotOps[0];
		if (packed?.directive === 5) profile.snapshotBytesCreated += packed.data.length;
	}
	layoutCache.set(node, { ops, snapshot: snapshotOps });
	return ops;
}

export interface LayoutProfile {
	rootCalls: number;
	cacheHits: number;
	cacheMisses: number;
	cacheBypasses: number;
	rawOpsGenerated: number;
	snapshotsCreated: number;
	snapshotInputOps: number;
	snapshotBytesCreated: number;
	snapshotOpsReused: number;
	snapshotBytesReused: number;
}

export function profileLayout<T>(callback: () => T): { value: T; profile: LayoutProfile } {
	const previous = activeLayoutProfile;
	const profile: LayoutProfile = {
		rootCalls: 0,
		cacheHits: 0,
		cacheMisses: 0,
		cacheBypasses: 0,
		rawOpsGenerated: 0,
		snapshotsCreated: 0,
		snapshotInputOps: 0,
		snapshotBytesCreated: 0,
		snapshotOpsReused: 0,
		snapshotBytesReused: 0,
	};
	activeLayoutProfile = profile;
	try {
		return { value: callback(), profile };
	} finally {
		activeLayoutProfile = previous;
	}
}

/** Run a synchronous layout without reading or populating packed snapshots. */
export function withoutLayoutCache<T>(callback: () => T): T {
	const previous = layoutCacheEnabled;
	layoutCacheEnabled = false;
	try {
		return callback();
	} finally {
		layoutCacheEnabled = previous;
	}
}

interface CachedLayout {
	ops: Op[];
	snapshot: Op[];
}

const layoutCache = new WeakMap<Node, CachedLayout>();

export function invalidateLayout(node: Node): void {
	if (!layoutCacheEnabled) return;
	for (let current: Node | undefined = node; current; current = current.parent) {
		layoutCache.delete(current);
	}
}

export function getCachedLayout(node: Node): Op[] | undefined {
	return layoutCache.get(node)?.ops;
}
