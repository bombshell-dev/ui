/** Source globs select files; arrays select original WPT names within each file. */
export type WPTSelectors = Readonly<Record<string, true | readonly (string | RegExp)[]>>;

export interface WPTConfig {
	/** Create a fresh implementation document for each upstream source file. */
	createDocument(): unknown;
	/** DOM constructors and other implementation bindings exposed to upstream scripts. */
	globals?: Record<string, unknown>;
	include?: WPTSelectors;
	exclude?: WPTSelectors;
	/**
	 * Excluded cases that run for their shared state, but we don't wait for.
	 * Maps exact source paths to arrays of original case names.
	 */
	forceTimeout?: Readonly<Record<string, readonly string[]>>;
	/** Maximum execution time per source file, in milliseconds. Defaults to 15 seconds. */
	timeout?: number;
}

/** Invalid framework or feature selection. */
export class CompatibilityConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CompatibilityConfigurationError';
	}
}
