/** Source globs select files; arrays select original WPT names within each file. */
export type WPTSelectors = Readonly<Record<string, true | readonly (string | RegExp)[]>>;

export interface WPTConfig {
	/** Create a fresh implementation document for each upstream source file. */
	createDocument(): unknown;
	/** DOM constructors and other implementation bindings exposed to upstream scripts. */
	globals?: Record<string, unknown>;
	include?: WPTSelectors;
	exclude?: WPTSelectors;
	/** Maximum execution time per source file, in milliseconds. Defaults to 15 seconds. */
	timeout?: number;
}
