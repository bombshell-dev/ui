import type { VNode, ContainerNode } from 'preact';
import type { WriteStream } from 'node:tty';
import { render as _render, options } from 'preact';
import { RenderRoot, toOps } from '@clack/ui';
import { createDocument } from '../ir/node-state.ts';
import { domToTree } from './to-tree.ts';

// Preact 11 beta still references a global `document` inside `render()`
// (https://github.com/preactjs/preact/pull/5119). Define it so the access
// doesn't throw; our container is never strictly equal to it.
if (!('document' in globalThis)) {
	(globalThis as { document?: unknown }).document = undefined;
}

export interface Root {
	/** Diff `vnode` into this root; the tty frame re-renders on the next tick. */
	render(vnode: VNode): void;
	/** Tear down the tree and stop tracking this root. */
	unmount(): void;
}

/**
 * Create a render root bound to a `tty` terminal. Resolves once the terminal is
 * ready, so the first {@link Root.render} paints on the next microtask.
 *
 * Preact owns reactivity and diffing; we only translate its committed host tree
 * into `tty` ops and ask the terminal to re-render.
 */
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

// --- update hook: coalesce Preact's per-diff callbacks into one tty flush ---
//
// We hook the public `options.diffed` rather than the internal `_commit`: the
// internal hook is mangled in Preact's published build (`options.__c`), so
// assigning `options._commit` is a no-op against the dist. `diffed` is public,
// unmangled, and fires per-vnode (post-order) — `scheduleFlush` collapses that
// burst into a single render on the next microtask, once the tree is committed.

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
