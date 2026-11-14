import { once } from 'node:events';
import { PassThrough, Writable } from 'node:stream';
import { alternateBuffer, cursor, settings } from '@bomb.sh/tty';
import { describe, expect, test, vi } from 'vitest';
import { createUI } from './ui.ts';

const terminalSettings = settings(cursor(false), alternateBuffer());
const apply = Buffer.from(terminalSettings.apply).toString('utf8');
const restore = Buffer.from(terminalSettings.revert).toString('utf8');

describe('UI lifecycle', () => {
	test('does not change terminal settings when main was never called', async () => {
		using io = setup();
		const controller = new AbortController();
		await createUI({ ...io, signal: controller.signal });
		expect(io.writes).toEqual([]);

		controller.abort();
		await nextTurn();
		expect(io.writes).toEqual([]);
	});

	test('does not start when the signal is already aborted', async () => {
		using io = setup();
		const controller = new AbortController();
		controller.abort();
		const ui = await createUI({ ...io, signal: controller.signal });
		ui.document.documentElement.appendChild(ui.document.createTextNode('unused'));

		await ui.main();
		await ui.main();
		expect(io.writes).toEqual([]);
	});

	test('repeated main calls return the same running task', async () => {
		using io = setup();
		const { writes } = io;
		const controller = new AbortController();
		const ui = await createUI({ ...io, signal: controller.signal });
		const running = ui.main();
		try {
			expect(ui.main()).toBe(running);
			controller.abort();
			expect(ui.main()).toBe(running);
		} finally {
			controller.abort();
			await running;
		}

		expect(ui.main()).toBe(running);
		expect(writes).toEqual([apply, restore]);
	});

	test('main waits for pending output and terminal restoration after abort', async () => {
		const output = Promise.withResolvers<void>();
		const restoration = Promise.withResolvers<void>();
		let frames = 0;
		using io = setup((chunk, complete) => {
			if (chunk === apply) {
				complete();
			} else if (chunk === restore) {
				void restoration.promise.then(() => complete());
			} else if (++frames === 2) {
				void output.promise.then(() => complete());
			} else {
				complete();
			}
		});
		const { writes } = io;
		const controller = new AbortController();
		const ui = await createUI({ ...io, signal: controller.signal });
		const running = ui.main();
		let settled = false;
		void running.then(
			() => {
				settled = true;
			},
			() => {
				settled = true;
			},
		);

		try {
			const { document } = ui;
			document.documentElement.appendChild(document.createTextNode('first'));
			await nextTurn();
			expect(frames).toBe(1);

			document.documentElement.appendChild(document.createTextNode(' second'));
			await nextTurn();
			expect(frames).toBe(2);

			controller.abort();
			expect(ui.main()).toBe(running);
			await nextTurn();
			expect(settled).toBe(false);
			expect(writes).not.toContain(restore);

			output.resolve();
			await nextTurn();
			expect(writes.at(-1)).toBe(restore);
			expect(settled).toBe(false);

			restoration.resolve();
			await running;
			expect(ui.main()).toBe(running);
			expect(frames).toBe(2);
		} finally {
			controller.abort();
			output.resolve();
			restoration.resolve();
			await running;
		}
	});

	test('main propagates a render failure after restoring terminal settings', async () => {
		using io = setup();
		const { writes } = io;
		const controller = new AbortController();
		const ui = await createUI({ ...io, signal: controller.signal });
		const failure = new TestRenderError();
		const text = ui.document.createTextNode('unreadable');
		Object.defineProperty(text, 'data', {
			get() {
				throw failure;
			},
		});
		const running = ui.main();

		try {
			const failed = expect(running).rejects.toBe(failure);
			ui.document.documentElement.appendChild(text);
			await failed;

			controller.abort();
			expect(ui.main()).toBe(running);
			await expect(ui.main()).rejects.toBe(failure);
			expect(writes).toEqual([apply, restore]);
		} finally {
			controller.abort();
			await running.catch(() => {});
		}
	});

	test('rejects setup failure without attempting terminal restoration', async () => {
		const failure = new Error('setup failed');
		using io = setup((_chunk, complete) => complete(failure));
		const controller = new AbortController();
		const ui = await createUI({ ...io, signal: controller.signal });
		const write = vi.spyOn(io.output, 'write');
		const outputError = once(io.output, 'error');
		const running = ui.main();

		try {
			await expect(running).rejects.toBe(failure);
			await expect(outputError).resolves.toEqual([failure]);
			expect(write).toHaveBeenCalledTimes(1);
			expect(io.writes).toEqual([apply]);
		} finally {
			controller.abort();
			write.mockRestore();
			await running.catch(() => {});
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
