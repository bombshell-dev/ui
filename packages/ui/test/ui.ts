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

	try {
		const ui = await createUI({
			input: terminal.input,
			output: terminal.output,
			width: cols,
			height: rows,
		});
		void ui.main();

		return {
			terminal,
			document: ui.document,
			async [Symbol.asyncDispose]() {
				try {
					await ui[Symbol.asyncDispose]();
				} finally {
					await terminal[Symbol.asyncDispose]();
				}
			},
		};
	} catch (error) {
		await terminal[Symbol.asyncDispose]();
		throw error;
	}
}
