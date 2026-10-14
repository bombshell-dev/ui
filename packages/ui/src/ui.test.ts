import type { ReadStream, WriteStream } from 'node:tty';
import process from 'node:process';
import { PassThrough } from 'node:stream';
import { alternateBuffer, CSI, cursor, fixed, grow, mouseTracking, settings } from '@bomb.sh/tty';
import { describe, expect, test, vi } from 'vitest';
import { DispatchApi } from './dispatch.ts';
import { FocusApi } from './focus.ts';
import { RenderApi } from './render.ts';
import { createUI, type UI, type UIOptions } from './ui.ts';
import { HostApi } from './host.ts';
import { registerComponents } from './component.ts';
import { Box } from './primitives/box.ts';
import { Text } from './primitives/text.ts';
import { Input } from './elements/input.ts';
import { Button } from './elements/button.ts';
import { installBrowserFacade, installBrowserCompat } from './browser.ts';

describe('createUI', () => {
	test('does not select definitions or browser compatibility', async () => {
		const { output } = captureOutput();
		const document = Reflect.get(globalThis, 'document');
		const window = Reflect.get(globalThis, 'window');
		await using ui = await createUI({ input: {} as ReadStream, output });
		expect([...HostApi.at(ui.host.root).definitions]).toEqual([]);
		expect(ui.host).not.toHaveProperty('document');
		expect(ui.host.element).not.toHaveProperty('ownerDocument');
		expect(Reflect.get(globalThis, 'document')).toBe(document);
		expect(Reflect.get(globalThis, 'window')).toBe(window);
	});
	test('exposes the Host used to construct a raw UI', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;

		expect(ui.host.element).toMatchObject({
			name: 'root',
			node: ui.host.root,
		});
	});

	test('renders an attached text element to the configured output', async () => {
		const { ui: resource, writes } = await setup();
		await using ui = resource;
		const { host } = ui;
		const text = host.createElement('text');
		host.insertBefore(text, host.createLiteral('Hello, world!'));

		host.insertBefore(host.element, text);

		await vi.waitFor(() => expect(writes.join('')).toContain('Hello, world!'));
	});

	test('renders again when attached text changes', async () => {
		const { ui: resource, writes } = await setup();
		await using ui = resource;
		const { host } = ui;
		const text = host.createElement('text');
		const literal = host.createLiteral('before');
		host.insertBefore(text, literal);
		host.insertBefore(host.element, text);
		await vi.waitFor(() => expect(writes.join('')).toContain('before'));
		const previousWrites = writes.length;

		host.setText(literal, 'after');

		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(previousWrites));
	});

	test('continues rendering floating position transitions until they settle', async () => {
		const { ui: resource, writes } = await setup();
		await using ui = resource;
		const { host } = ui;
		const parent = host.createElement('box', {
			layout: { width: grow(), height: grow() },
		});
		const floating = host.createElement('box', {
			layout: { width: fixed(10), height: fixed(1) },
			floating: {
				attachTo: 'parent',
				attachPoints: { element: 'right-top', parent: 'right-top' },
				x: 30,
				y: 1,
			},
			transition: { duration: 0.08, properties: ['position'] },
		});
		host.insertBefore(floating, host.createLiteral('toast'));
		host.insertBefore(parent, floating);
		host.insertBefore(host.element, parent);
		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(1));
		const initialWrites = writes.length;

		host.setProperty(floating, 'floating', {
			attachTo: 'parent',
			attachPoints: { element: 'right-top', parent: 'right-top' },
			x: -1,
			y: 1,
		});

		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(initialWrites + 1));
		await vi.waitFor(() => expect(writes.slice(initialWrites).join('')).toContain('toast'));
	});

	test('exposes render and paint phases to decorators', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;
		const { host } = ui;
		const phases: string[] = [];

		RenderApi.decorate(host.root, () => ({
			render(frame, callback) {
				phases.push('render:start');
				try {
					return super.render(frame, callback);
				} finally {
					phases.push('render:end');
				}
			},
			paint(callback) {
				phases.push('paint:start');
				return super.paint(callback).finally(() => phases.push('paint:end'));
			},
		}));

		const text = host.createElement('text');
		host.insertBefore(text, host.createLiteral('profile me'));
		host.insertBefore(host.element, text);

		await vi.waitFor(() => expect(phases).toContain('paint:end'));
		expect(phases).toEqual(['render:start', 'render:end', 'paint:start', 'paint:end']);
	});

	test('composes keyboard input with focus and event dispatch', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;
		const { host } = ui;
		const input = host.createElement('input');
		host.insertBefore(host.element, input);

		const result = DispatchApi.at(host.root).dispatch({
			type: 'keydown',
			key: 'x',
			code: 'x',
			text: 'x',
		});

		expect(result).toEqual({ ok: true });
		expect(input.properties['value']).toBe('x');
	});

	test('composes keyboard focus navigation', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;
		const { host } = ui;
		const first = host.createElement('input');
		const second = host.createElement('input');
		host.insertBefore(host.element, first);
		host.insertBefore(host.element, second);

		DispatchApi.at(host.root).dispatch({
			type: 'keydown',
			key: 'Tab',
			code: 'Tab',
		});

		expect(FocusApi.at(host.root).getFocus()).toBe(second.node);
	});

	test('routes a terminal mouse click to the element under the pointer', async () => {
		const { output } = captureOutput();
		const input = new PassThrough() as PassThrough & ReadStream;
		input.setRawMode = () => {};
		await using ui = await createUI({ input, output });
		Button.register(ui.host);
		let presses = 0;
		const button = ui.host.createElement('button', {
			label: 'Save',
			onpress: () => presses++,
		});
		ui.host.insertBefore(ui.host.element, button);

		const main = ui.main();
		await new Promise<void>((resolve) => setTimeout(resolve, 10));
		input.write(Buffer.from('\u001b[<0;2;2M\u001b[<0;2;2m'));

		await vi.waitFor(() => expect(presses).toBe(1));
		input.write(Buffer.from('\u0003'));
		await main;
	});

	test('moves focus to an input on terminal mouse down', async () => {
		const { output } = captureOutput();
		const input = new PassThrough() as PassThrough & ReadStream;
		input.setRawMode = () => {};
		await using ui = await createUI({ input, output });
		Input.register(ui.host);
		const first = ui.host.createElement('input');
		const second = ui.host.createElement('input');
		ui.host.insertBefore(ui.host.element, first);
		ui.host.insertBefore(ui.host.element, second);
		const main = ui.main();
		await vi.waitFor(() => expect(ui.host.getBounds(second)?.height).toBeGreaterThan(0));
		const bounds = ui.host.getBounds(second)!;

		input.write(Buffer.from(`\u001b[<0;${Math.floor(bounds.x) + 1};${Math.floor(bounds.y) + 1}M`));

		await vi.waitFor(() => expect(FocusApi.at(ui.host.root).getFocus()).toBe(second.node));
		input.write(Buffer.from('\u0003'));
		await main;
	});

	test('adapts terminal pointer gestures only when browser compatibility is installed', async () => {
		const { output } = captureOutput();
		const input = new PassThrough() as PassThrough & ReadStream;
		input.setRawMode = () => {};
		await using ui = await createUI({ input, output });
		const restore = installBrowserCompat(ui.host, { elements: [Box] });
		const browser = installBrowserFacade(ui.host);
		const moves = vi.fn();
		const releases = vi.fn();
		browser.document.addEventListener('pointermove', moves);
		browser.document.addEventListener('pointerup', releases);
		const target = browser.document.createElement('box');
		target.setProperty('layout', { width: fixed(10), height: fixed(3) });
		target.addEventListener('pointerdown', (event) => target.setPointerCapture(event.pointerId));
		ui.host.element.append(target);
		const main = ui.main();
		try {
			await vi.waitFor(() => expect(target.getBoundingClientRect().height).toBeGreaterThan(0));
			input.write(Buffer.from('\u001b[<0;2;2M\u001b[<32;4;2M\u001b[<0;4;2m'));
			await vi.waitFor(() => expect(releases).toHaveBeenCalledOnce());
			expect(moves).toHaveBeenCalledOnce();
			expect(moves.mock.calls[0]![0].target).toBe(target);
		} finally {
			input.write(Buffer.from('\u0003'));
			await main;
			restore();
		}
	});

	test('uses the alternate buffer, tracks mouse input, and hides the cursor until disposal', async () => {
		const { ui, writes } = await setup();
		const terminal = settings(cursor(false), alternateBuffer(), mouseTracking());

		expect(writes).toEqual([decode(terminal.apply)]);

		{
			await using _resource = ui;
		}

		expect(writes).toEqual([decode(terminal.apply), decode(terminal.revert)]);
	});

	test('restores terminal modes when Node reports an uncaught exception', async () => {
		const { ui, writes } = await setup();
		const terminal = settings(cursor(false), alternateBuffer(), mouseTracking());

		process.emit('uncaughtExceptionMonitor', new Error('probe'), 'uncaughtException');

		expect(writes.at(-1)).toBe(decode(terminal.revert));
		await ui[Symbol.asyncDispose]();
		expect(writes.filter((write) => write === decode(terminal.revert))).toHaveLength(1);
	});

	test('redraws an inline UI relative to its anchor row', async () => {
		const { ui, writes } = await setup({ height: 3, inline: true, width: 20 });
		const { host } = ui;
		const text = host.createElement('text');
		const literal = host.createLiteral('before');
		host.insertBefore(text, literal);
		host.insertBefore(host.element, text);
		await vi.waitFor(() => expect(writes.join('')).toContain('before'));
		const writesAfterFirstFrame = writes.length;

		host.setText(literal, 'after');
		await vi.waitFor(() => expect(writes.slice(writesAfterFirstFrame).join('')).toContain('after'));

		const update = writes.slice(writesAfterFirstFrame).join('');
		expect(update.startsWith(`${decode(CSI('2A'))}${decode(CSI('1G'))}`)).toBe(true);
		expect(update).toContain('after');
		expect(update.endsWith('\n')).toBe(false);

		{
			await using _resource = ui;
		}

		expect(writes.at(-1)).toBe(`\r\n${decode(settings(cursor(false)).revert)}`);
	});

	test('does not render Host changes after disposal', async () => {
		const { ui, writes } = await setup({ height: 1, inline: true, width: 20 });
		const { host } = ui;
		const text = host.createElement('text');
		const literal = host.createLiteral('before');
		host.insertBefore(text, literal);
		host.insertBefore(host.element, text);
		{
			await using _resource = ui;
		}
		const writesAfterDispose = writes.length;

		host.setText(literal, 'after');

		expect(writes).toHaveLength(writesAfterDispose);
		expect(writes.join('')).not.toContain('after');
	});
});

async function setup(
	options: Pick<UIOptions, 'height' | 'inline' | 'width'> = {},
): Promise<{ ui: UI; writes: string[] }> {
	const { output, writes } = captureOutput();
	const input = {} as ReadStream;
	const ui = await createUI({ ...options, input, output });
	registerComponents(ui.host, [Box, Text, Input, Button]);
	return { ui, writes };
}

function captureOutput(): { output: WriteStream; writes: string[] } {
	const writes: string[] = [];
	const output = {
		columns: 80,
		rows: 24,
		write(chunk: string | Uint8Array, callback?: (error?: Error | null) => void): boolean {
			writes.push(typeof chunk === 'string' ? chunk : decode(chunk));
			callback?.();
			return true;
		},
	} as unknown as WriteStream;

	return { output, writes };
}

function decode(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString('utf8');
}
