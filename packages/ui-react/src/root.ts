/* oxlint-disable bombshell-dev/exported-function-async -- React root creation is synchronous. */
import { HostApi, type Host } from '@clack/ui';
import type { HostElement } from '@clack/ui/elements';
import type { ReactNode } from 'react';
import { LegacyRoot } from 'react-reconciler/constants.js';
import { type Container, reconciler } from './reconciler.ts';

export interface RootOptions {
	/** Called once after React commits a set of Host mutations. */
	onCommit?: (host: Host) => void;
}

export interface Root {
	readonly element: HostElement;
	readonly host: Host;
	/** Reconcile `node` into the Host synchronously. */
	render(node: ReactNode): void;
	/** Remove the React tree from the Host synchronously. */
	unmount(): void;
}

/** Create a React root which reconciles into an attached Host element. */
export function createRoot(element: HostElement, options: RootOptions = {}): Root {
	const host = HostApi.methods.getHost(element.node!);
	const container: Container = {
		element,
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
		element,
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
