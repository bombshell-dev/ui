import type { ReactNode } from 'react';
import {
	type BoxProps,
	type RenderRoot,
	type RenderRootOptions,
	type TextProps,
	box,
	createRoot as createCoreRoot,
	text,
} from '@clack/ui';
import { LegacyRoot } from 'react-reconciler/constants.js';
import { type AnyInstance, type Container, reconciler } from './reconciler.ts';

export interface Root {
	/** Render `node` to the output, replacing the previous frame. Synchronous: bytes are written before this returns. */
	render(node: ReactNode): void;
	/** Tear down the react tree. The last frame is left on screen. */
	unmount(): void;
}

type Child = ReturnType<typeof box> | ReturnType<typeof text> | string;

function toChild(node: AnyInstance): Child {
	if ('text' in node) return node.text;
	if (node.type === 'tui-text') {
		return text(node.props as TextProps, ...node.children.map((c) => ('text' in c ? c.text : '')));
	}
	return box(node.props as BoxProps, ...node.children.map(toChild));
}

function flush(container: Container, core: RenderRoot): void {
	// ponytail: core `render()` with no args re-renders the previous frame, so an
	// empty tree (unmount) can't blank the screen — skip the write instead.
	if (container.children.length === 0) return;
	core.render(...container.children.map(toChild));
}

const noop = (): void => {};

/** Create a react render root bound to a tty terminal. Resolves once the terminal is ready. */
export async function createRoot(options?: Pick<RenderRootOptions, 'output'>): Promise<Root> {
	const core = await createCoreRoot(options);
	const container: Container = { children: [], onCommit: () => flush(container, core) };
	// Sync mode (LegacyRoot + updateContainerSync/flushSyncWork) is what Ink ships;
	// it keeps `render()` synchronous like core's RenderRoot and tests deterministic.
	const fiberRoot = reconciler.createContainer(
		container,
		LegacyRoot,
		null,
		false,
		null,
		'clack',
		noop,
		noop,
		noop,
		noop,
	);
	return {
		render(node) {
			reconciler.updateContainerSync(node, fiberRoot, null, null);
			reconciler.flushSyncWork();
		},
		unmount() {
			reconciler.updateContainerSync(null, fiberRoot, null, null);
			reconciler.flushSyncWork();
		},
	};
}
