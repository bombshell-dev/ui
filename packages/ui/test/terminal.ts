import { PassThrough, Writable } from 'node:stream';
import { keyToAnsi, parseKey, type Region } from '@termless/core';
import {
	createTestTerminal as createTermlessTerminal,
	type SyncTestTerminalOptions,
} from '@termless/test';

export interface TestTerminal extends AsyncDisposable {
	input: PassThrough;
	output: Writable;
	readonly screen: Region;
	type(text: string): void;
	press(key: string): void;
}

/* oxlint-disable bombshell-dev/exported-function-async -- Mirrors Termless's synchronous fixture. */
/** A Termless terminal with application-facing streams for in-process UI tests. */
export function createTestTerminal(options: SyncTestTerminalOptions = {}): TestTerminal {
	const terminal = createTermlessTerminal(options);
	const input = new PassThrough();
	const output = new Writable({
		write(chunk: Buffer, _encoding, callback) {
			terminal.feed(chunk);
			callback();
		},
	});

	// Terminal replies travel back to the application through the same input stream.
	terminal.backend.onResponse = (bytes) => {
		input.write(bytes);
	};

	return {
		input,
		output,
		get screen() {
			return terminal.screen;
		},
		type(text) {
			input.write(text);
		},
		press(key) {
			const descriptor = parseKey(key);
			const encoded = terminal.backend.encodeKey(descriptor);
			input.write(encoded.length > 0 ? encoded : keyToAnsi(descriptor));
		},
		async [Symbol.asyncDispose]() {
			input.destroy();
			output.destroy();
			await terminal.close();
		},
	};
}
