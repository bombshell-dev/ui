/* oxlint-disable bombshell-dev/exported-function-async -- React root creation is synchronous. */
import { HostApi, type Host } from '@clack/ui';
import type { HostElement } from '@clack/ui/elements';
import type { ReactNode } from 'react';
import { LegacyRoot } from 'react-reconciler/constants.js';
import { registerHostCommit, type Container, reconciler } from './reconciler.ts';

export interface RootOptions {
	/** Called once after React commits a set of Host mutations. */
	onCommit?: (host: Host) => void;
	/** Called when React cannot render or recover a subtree. */
	onError?: (error: unknown) => void;
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
	const host = HostApi.at(element.node!).getHost();
	const onError = options.onError ?? ((error: unknown) => console.error(error));
	const container: Container = {
		element,
		host,
		onCommit: () => options.onCommit?.(host),
	};
	registerHostCommit(host, container.onCommit);
	const fiberRoot = reconciler.createContainer(
		container,
		LegacyRoot,
		null,
		false,
		null,
		'clack',
		onError,
		onError,
		onError,
		noop,
		null,
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
