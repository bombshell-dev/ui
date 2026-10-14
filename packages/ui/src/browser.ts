import type { Host } from './host.ts';
import type { Registration } from './component.ts';
import { installBrowserFacade } from './browser-facade.ts';
import { installDOMGlobals } from './dom.ts';
import { installStandardElements } from './standard-elements.ts';

export { BrowserFacade, installBrowserFacade } from './browser-facade.ts';
export { installDOMGlobals } from './dom.ts';
export * from './browser-types.ts';

export interface BrowserCompatOptions {
	/** Omit for the standard collection; pass an empty list for the facade alone. */
	elements?: readonly Registration[];
	/** Set false to keep the facade local to this Host. */
	globals?: boolean;
}

/** Install an explicit browser profile. Cleanup releases globals, not Host definitions. */
export function installBrowserCompat(host: Host, options: BrowserCompatOptions = {}): () => void {
	const restore = options.globals === false ? () => {} : installDOMGlobals(host);
	try {
		installBrowserFacade(host);
		installStandardElements(host, options.elements);
		return restore;
	} catch (error) {
		restore();
		throw error;
	}
}
