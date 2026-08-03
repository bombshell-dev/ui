// oxlint-disable bombshell-dev/exported-function-async -- Preact root creation is synchronous.
import type { Host } from '@clack/ui';
import { type ComponentChild, render } from 'preact';
import { createContainer } from './facade.ts';

export interface Root {
	readonly host: Host;
	/** Reconcile `node` into the Host synchronously. */
	render(node: ComponentChild): void;
	/** Remove the Preact tree from the Host synchronously. */
	unmount(): void;
}

/** Create a Preact root which mutates an existing framework-neutral Host. */
export function createRoot(host: Host): Root {
	const container = createContainer(host) as unknown as Element;

	return {
		host,
		render(node) {
			render(node, container);
		},
		unmount() {
			render(null, container);
		},
	};
}
