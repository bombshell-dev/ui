// oxlint-disable bombshell-dev/exported-function-async -- Vue root creation is synchronous.
import { HostApi, type Host } from '@clack/ui';
import type { HostElement } from '@clack/ui/elements';
import { markRaw, type VNode } from 'vue';
import { createHostRenderer } from './renderer.ts';

export interface Root {
	readonly element: HostElement;
	readonly host: Host;
	/** Reconcile `node` into the Host synchronously. */
	render(node: VNode): void;
	/** Remove the Vue tree from the Host synchronously. */
	unmount(): void;
}

/** Create a Vue root which reconciles into an attached Host element. */
export function createRoot(element: HostElement): Root {
	const host = HostApi.at(element.node!).getHost();
	const container = markRaw(element);
	const renderer = createHostRenderer(host);

	return {
		element,
		host,
		render(node) {
			renderer.render(node, container);
		},
		unmount() {
			renderer.render(null, container);
		},
	};
}
