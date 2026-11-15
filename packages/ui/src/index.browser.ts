import { createXtermPlatform, type XtermTerminal } from './platform/xterm.ts';
import { startUI, type UI } from './ui.ts';

export type { UI } from './ui.ts';

export interface UIOptions {
	/** The xterm.js terminal to render into. Browsers have no default terminal. */
	output: XtermTerminal;
	signal?: AbortSignal;
}

/** Create a UI on an xterm.js terminal. */
export async function createUI(options: UIOptions): Promise<UI> {
	return startUI(createXtermPlatform(options.output), options.signal);
}
