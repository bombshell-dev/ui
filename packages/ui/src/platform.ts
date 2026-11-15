/** Terminal dimensions in cells. */
export interface Size {
	width: number;
	height: number;
}

/** Host events a UI reacts to while it runs. */
export interface PlatformEvents {
	/** The terminal changed size. */
	resize(size: Size): void;
	/** The host asked the program to stop, such as SIGINT. */
	interrupt(): void;
}

/**
 * Everything a UI needs from its host that isn't portable JavaScript.
 *
 * Bindings for each host live in one place so the rest of the UI stays
 * runtime-agnostic. Each package entry point picks the binding for its runtime
 * through export conditions and builds it from `createUI()` options.
 */
export interface Platform {
	/** Current terminal size. */
	size(): Size;
	/** Write bytes to the terminal; resolves once the host has accepted them. */
	write(bytes: Uint8Array): Promise<void>;
	/** Deliver host events to `events` until `signal` aborts. */
	listen(events: PlatformEvents, signal: AbortSignal): void;
}
