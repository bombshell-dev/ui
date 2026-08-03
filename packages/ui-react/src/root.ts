/* oxlint-disable bombshell-dev/exported-function-async -- React root creation is synchronous. */
import type { Host } from '@clack/ui';
import type { ReactNode } from 'react';
import { LegacyRoot } from 'react-reconciler/constants.js';
import { type Container, reconciler } from './reconciler.ts';

export interface RootOptions {
	/** Called once after React commits a set of Host mutations. */
	onCommit?: (host: Host) => void;
}

export interface Root {
	readonly host: Host;
	/** Reconcile `node` into the Host synchronously. */
	render(node: ReactNode): void;
	/** Remove the React tree from the Host synchronously. */
	unmount(): void;
}

/** Create a React root which mutates an existing framework-neutral Host. */
export function createRoot(host: Host, options: RootOptions = {}): Root {
	const container: Container = {
		host,
		onCommit: () => options.onCommit?.(host),
	};
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
		host,
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

const noop = (): void => {};
