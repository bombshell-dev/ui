import { PassThrough, Writable } from 'node:stream';
import { alternateBuffer, cursor, settings } from '@bomb.sh/tty';
import { describe, expect, test } from 'vitest';
import { createUI } from './ui.ts';

const terminalSettings = settings(cursor(false), alternateBuffer());
const apply = Buffer.from(terminalSettings.apply).toString('utf8');
const restore = Buffer.from(terminalSettings.revert).toString('utf8');

describe('UI lifecycle', () => {
	test('restores terminal settings when main was never called', async () => {
		using io = setup();
		const { writes } = io;
		{
			await using _ui = await createUI(io);
			expect(writes).toEqual([apply]);
		}

		expect(writes).toEqual([apply, restore]);
	});

	test('repeated main calls return the same running task', async () => {
		using io = setup();
		const { writes } = io;
		{
			await using resource = await createUI(io);
			expect(resource.main()).toBe(resource.main());
		}

		expect(writes).toEqual([apply, restore]);
	});

	test('disposal waits for a second output write before restoring the terminal', async () => {
		const output = Promise.withResolvers<void>();
		let frames = 0;
		using io = setup((chunk, complete) => {
			if (chunk === apply || chunk === restore) {
				complete();
			} else if (++frames === 2) {
				void output.promise.then(() => complete());
			} else {
				complete();
			}
		});
		const { writes } = io;
		const ui = await createUI(io);
		let disposing: Promise<void> | undefined;

		try {
			void ui.main();
			const { document } = ui;
			document.documentElement.appendChild(document.createTextNode('first'));
			await nextTurn();
			expect(frames).toBe(1);

			document.documentElement.appendChild(document.createTextNode(' second'));
			await nextTurn();
			expect(frames).toBe(2);

			disposing = Promise.resolve(ui[Symbol.asyncDispose]());
			let settled = false;
			void disposing.then(
				() => {
					settled = true;
				},
				() => {
					settled = true;
				},
			);
			await nextTurn();
			expect(settled).toBe(false);
			expect(writes).not.toContain(restore);

			output.resolve();
			await disposing;
			expect(writes.at(-1)).toBe(restore);
			expect(frames).toBe(2);
		} finally {
			output.resolve();
			await (disposing ?? ui[Symbol.asyncDispose]());
		}
	});

	test('disposal propagates a render failure after restoring terminal settings', async () => {
		using io = setup();
		const { writes } = io;
		const ui = await createUI(io);
		const failure = new TestRenderError();
		const text = ui.document.createTextNode('unreadable');
		Object.defineProperty(text, 'data', {
			get() {
				throw failure;
			},
		});
		let disposing: Promise<void> | undefined;

		try {
			const failed = expect(ui.main()).rejects.toBe(failure);
			ui.document.documentElement.appendChild(text);
			await failed;

			disposing = Promise.resolve(ui[Symbol.asyncDispose]());
			await expect(disposing).rejects.toBe(failure);
			expect(writes).toEqual([apply, restore]);
		} finally {
			// Manually own the expected failure; never dispose the resource twice.
			if (!disposing) {
				await Promise.resolve(ui[Symbol.asyncDispose]()).catch(() => {});
			}
		}
	});
});

type CompleteWrite = (error?: Error | null) => void;

interface TestIO extends Disposable {
	input: PassThrough;
	output: Writable;
	width: number;
	height: number;
	writes: string[];
}

function setup(onWrite?: (chunk: string, complete: CompleteWrite) => void): TestIO {
	const writes: string[] = [];
	const input = new PassThrough();
	const output = new Writable({
		write(bytes: Buffer, _encoding, complete) {
			const chunk = bytes.toString('utf8');
			writes.push(chunk);
			if (onWrite) {
				onWrite(chunk, complete);
			} else {
				complete();
			}
		},
	});
	return {
		input,
		output,
		width: 80,
		height: 24,
		writes,
		[Symbol.dispose]() {
			input.destroy();
			output.destroy();
		},
	};
}

function nextTurn(): Promise<void> {
	return new Promise((resolve) => setImmediate(resolve));
}

class TestRenderError extends Error {
	readonly code = 'CLACK_UI_TEST_RENDER_FAILURE';

	constructor() {
		super('render failed');
		this.name = 'TestRenderError';
	}
}
