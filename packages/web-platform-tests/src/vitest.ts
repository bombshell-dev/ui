/* oxlint-disable bombshell-dev/exported-function-async -- Vitest plugin creation is synchronous. */
import type { Plugin } from 'vitest/config';

/** Serializable name filter passed from Vitest configuration to test workers. */
export interface WPTNamePattern {
	source: string;
	flags: string;
}

declare module 'vitest' {
	interface ProvidedContext {
		wptTestNamePattern: WPTNamePattern | null;
	}
}

/** Pass Vitest's resolved name filter to WPT before test registration. */
export function wptNameFilter(): Plugin {
	return {
		name: 'wpt-name-filter',
		configureVitest({ vitest, project }) {
			// Watch mode needs the full catalogue to discover cases when its filter changes.
			const pattern = vitest.config.watch ? undefined : vitest.getGlobalTestNamePattern();
			project.provide(
				'wptTestNamePattern',
				pattern ? { source: pattern.source, flags: pattern.flags } : null,
			);
		},
	};
}
