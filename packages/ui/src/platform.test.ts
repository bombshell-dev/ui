import process from 'node:process';
import { Writable } from 'node:stream';
import { describe, expect, test, vi } from 'vitest';
import { createUI as createBrowserUI } from './index.browser.ts';
import { createUI } from './index.ts';
import { createNodePlatform } from './platform/node.ts';
import { createXtermPlatform, type XtermTerminal } from './platform/xterm.ts';
import type { Size } from './platform.ts';

describe('node platform', () => {
	test('reports the TTY size and follows resizes until aborted', () => {
		const output = tty(100, 30);
		const platform = createNodePlatform({ output, signal: AbortSignal.abort() });
		const events = createEvents();
		const controller = new AbortController();

		platform.listen(events, controller.signal);
		expect(platform.size()).toEqual({ width: 100, height: 30 });

		output.columns = 120;
		output.emit('resize');
		expect(events.resize).toHaveBeenLastCalledWith({ width: 120, height: 30 });

		controller.abort();
		output.emit('resize');
		expect(events.resize).toHaveBeenCalledTimes(1);
	});

	test('prefers explicit width and height over the TTY size', () => {
		const platform = createNodePlatform({ output: tty(100, 30), width: 40, height: 10 });
		expect(platform.size()).toEqual({ width: 40, height: 10 });
	});

	test('falls back to 80×24 when output is not a TTY', () => {
		const platform = createNodePlatform({ output: sink() });
		expect(platform.size()).toEqual({ width: 80, height: 24 });
	});

	test('interrupts on SIGINT only when the caller passed no signal', () => {
		const before = process.listenerCount('SIGINT');
		const controller = new AbortController();

		createNodePlatform({ signal: controller.signal }).listen(createEvents(), controller.signal);
		expect(process.listenerCount('SIGINT')).toBe(before);

		const events = createEvents();
		createNodePlatform({}).listen(events, controller.signal);
		process.emit('SIGINT', 'SIGINT');
		expect(events.interrupt).toHaveBeenCalledTimes(1);

		controller.abort();
		expect(process.listenerCount('SIGINT')).toBe(before);
	});

	test('createUI() without a signal stops on SIGINT', async () => {
		const ui = await createUI({ output: tty(10, 1) });
		const running = ui.main();
		await new Promise((resolve) => setImmediate(resolve));

		process.emit('SIGINT', 'SIGINT');
		await running;
		expect(ui.main()).toBe(running);
	});
});

describe('xterm platform', () => {
	test('writes bytes and follows resizes until aborted', async () => {
		const terminal = new FakeXterm(80, 24);
		const platform = createXtermPlatform(terminal);
		const events = createEvents();
		const controller = new AbortController();

		platform.listen(events, controller.signal);
		await platform.write(new Uint8Array([104, 105]));
		expect(terminal.written).toEqual([new Uint8Array([104, 105])]);

		terminal.resize(100, 40);
		expect(events.resize).toHaveBeenLastCalledWith({ width: 100, height: 40 });
		expect(platform.size()).toEqual({ width: 100, height: 40 });

		controller.abort();
		terminal.resize(10, 10);
		expect(events.resize).toHaveBeenCalledTimes(1);
	});

	test('the browser createUI() renders into the terminal until aborted', async () => {
		const terminal = new FakeXterm(20, 2);
		const controller = new AbortController();
		const ui = await createBrowserUI({ output: terminal, signal: controller.signal });
		const running = ui.main();

		ui.document.documentElement.appendChild(ui.document.createTextNode('hello'));
		await vi.waitFor(() => expect(terminal.text()).toContain('hello'));

		terminal.resize(30, 3);
		const frames = terminal.written.length;
		await vi.waitFor(() => expect(terminal.written.length).toBeGreaterThan(frames));

		controller.abort();
		await running;
		expect(terminal.listeners.size).toBe(0);
	});
});

function createEvents(): {
	resize: ReturnType<typeof vi.fn<(size: Size) => void>>;
	interrupt: ReturnType<typeof vi.fn<() => void>>;
} {
	return { resize: vi.fn<(size: Size) => void>(), interrupt: vi.fn<() => void>() };
}

function sink(): Writable {
	return new Writable({ write: (_chunk, _encoding, done) => done() });
}

function tty(columns: number, rows: number): Writable & { columns: number; rows: number } {
	return Object.assign(sink(), { columns, rows });
}

class FakeXterm implements XtermTerminal {
	cols: number;
	rows: number;
	written: Uint8Array[] = [];
	listeners = new Set<(size: { cols: number; rows: number }) => void>();

	constructor(cols: number, rows: number) {
		this.cols = cols;
		this.rows = rows;
	}

	write(data: Uint8Array, callback?: () => void): void {
		this.written.push(data);
		queueMicrotask(() => callback?.());
	}

	onResize(listener: (size: { cols: number; rows: number }) => void): { dispose(): void } {
		this.listeners.add(listener);
		return { dispose: () => this.listeners.delete(listener) };
	}

	resize(cols: number, rows: number): void {
		this.cols = cols;
		this.rows = rows;
		for (const listener of this.listeners) listener({ cols, rows });
	}

	text(): string {
		return this.written.map((bytes) => new TextDecoder().decode(bytes)).join('');
	}
}
