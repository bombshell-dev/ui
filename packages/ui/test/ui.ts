import type { SyncTestTerminalOptions } from '@termless/test';
import { createUI, type UI } from '../src/ui.ts';
import { createTestTerminal, type TestTerminal } from './terminal.ts';

export interface TestUI extends AsyncDisposable {
	terminal: TestTerminal;
	document: UI['document'];
}

/** A running UI and its terminal, owned and disposed together. */
export async function createTestUI(options: SyncTestTerminalOptions = {}): Promise<TestUI> {
	const { cols = 80, rows = 24 } = options;
	const terminal = createTestTerminal({ ...options, cols, rows });
	const controller = new AbortController();

	try {
		const ui = await createUI({
			input: terminal.input,
			output: terminal.output,
			width: cols,
			height: rows,
			signal: controller.signal,
		});
		const running = ui.main();
		// Disposal awaits the original task and propagates any rendering failure.
		void running.catch(() => {});

		return {
			terminal,
			document: ui.document,
			async [Symbol.asyncDispose]() {
				controller.abort();
				try {
					await running;
				} finally {
					await terminal[Symbol.asyncDispose]();
				}
			},
		};
	} catch (error) {
		controller.abort();
		await terminal[Symbol.asyncDispose]();
		throw error;
	}
}
