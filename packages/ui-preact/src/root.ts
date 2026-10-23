import type { Element } from '@clack/ui';
import { render, type ComponentChild } from 'preact';

export interface Root extends Disposable {
	readonly element: Element;
	/** Reconcile into this element, leaving its siblings alone. */
	render(node: ComponentChild): void;
	/** Remove the rendered tree. The root can be rendered into again. */
	unmount(): void;
}

// oxlint-disable-next-line bombshell-dev/exported-function-async -- Preact rendering is synchronous.
/** Mount Preact into any Clack element, including a detached element. */
export function createRoot(element: Element): Root {
	return {
		element,
		render(node) {
			render(node, element);
		},
		unmount() {
			render(null, element);
		},
		[Symbol.dispose]() {
			this.unmount();
		},
	};
}
