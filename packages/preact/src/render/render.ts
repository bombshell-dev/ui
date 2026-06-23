import type { VNode, ContainerNode } from 'preact';
import type { WriteStream } from 'node:tty';
import { render as _render, options } from 'preact';
import { RenderRoot, toOps } from '@clack/ui';
import { createDocument } from '../ir/node-state.ts';
import { domToTree } from './to-tree.ts';

// Preact 11 beta reads a global `document` in `render()` (preactjs/preact#5119);
// define it so the access doesn't throw — our container is never equal to it.
if (!('document' in globalThis)) {
	(globalThis as { document?: unknown }).document = undefined;
}

export interface Root {
	/** Diff `vnode` into this root; the tty frame re-renders on the next tick. */
	render(vnode: VNode): void;
	/** Tear down the tree and stop tracking this root. */
	unmount(): void;
}

/** Create a render root bound to a tty terminal. Preact owns diffing; we translate its committed tree to ops and re-render. */
export async function createRoot(output: WriteStream = process.stdout): Promise<Root> {
	const document = createDocument();
	const container = document.body;
	const root = new RenderRoot(() => toOps(domToTree(container)), { output });
	await root.ready();

	activeRoots.add(root);

	return {
		render(vnode) {
			_render(vnode, container as unknown as ContainerNode);
		},
		unmount() {
			_render(null, container as unknown as ContainerNode);
			activeRoots.delete(root);
		},
	};
}

// Coalesce Preact's per-vnode `diffed` callbacks into one flush. We hook the
// public `diffed` (not internal `_commit`, which is mangled to `__c` in the
// published build) and collapse the burst via `scheduleFlush`.
const activeRoots = new Set<RenderRoot>();
const dirty = new Set<RenderRoot>();
let scheduled = false;

const previousDiffed = options.diffed;
options.diffed = (vnode) => {
	previousDiffed?.(vnode);
	// TODO: dispatch by committed container once multiple roots are in play.
	// For now every active root is marked dirty — a full re-render is
	// idempotent, just not minimal.
	for (const root of activeRoots) dirty.add(root);
	scheduleFlush();
};

function scheduleFlush(): void {
	if (scheduled) return;
	scheduled = true;
	queueMicrotask(() => {
		scheduled = false;
		const pending = [...dirty];
		dirty.clear();
		for (const root of pending) void root.requestUpdate();
	});
}
