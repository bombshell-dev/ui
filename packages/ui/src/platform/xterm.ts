import type { Platform } from '../platform.ts';

/** The slice of xterm.js's `Terminal` this binding uses. */
export interface XtermTerminal {
	readonly cols: number;
	readonly rows: number;
	write(data: Uint8Array, callback?: () => void): void;
	onResize(listener: (size: { cols: number; rows: number }) => void): { dispose(): void };
}

/** Bind a UI to an xterm.js terminal. Browsers have no process signals to interrupt it. */
export function createXtermPlatform(terminal: XtermTerminal): Platform {
	return {
		size: () => ({ width: terminal.cols, height: terminal.rows }),
		write(bytes) {
			const result = Promise.withResolvers<void>();
			terminal.write(bytes, () => result.resolve());
			return result.promise;
		},
		listen(events, signal) {
			const subscription = terminal.onResize(({ cols, rows }) =>
				events.resize({ width: cols, height: rows }),
			);
			signal.addEventListener('abort', () => subscription.dispose(), { once: true });
		},
	};
}
