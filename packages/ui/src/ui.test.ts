import type { ReadStream, WriteStream } from 'node:tty';
import { alternateBuffer, CSI, cursor, settings } from '@bomb.sh/tty';
import { describe, expect, test, vi } from 'vitest';
import { DispatchApi } from './dispatch.ts';
import { defineComponent } from './component.ts';
import { getFocus } from './focus.ts';
import { RenderApi } from './render.ts';
import { createUI, type UI, type UIOptions } from './ui.ts';

describe('createUI', () => {
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
		const text = host.createElement('text', {}, 'Hello, world!');
		host.element.append(text);

		await vi.waitFor(() => expect(writes.join('')).toContain('Hello, world!'));
	});

	test('renders the children of a shared custom component', async () => {
		const { ui: resource, writes } = await setup();
		await using ui = resource;
		const { host } = ui;
		const Greeting = defineComponent('greeting-card', (element) => {
			element.append(element.createElement('text', {}, 'Hello from a component'));
		});
		Greeting.register(host);

		host.element.append(Greeting.create(host));

		await vi.waitFor(() => expect(writes.join('')).toContain('Hello from a component'));
	});

	test('renders again when attached text changes', async () => {
		const { ui: resource, writes } = await setup();
		await using ui = resource;
		const { host } = ui;
		const literal = host.createLiteral('before');
		const text = host.createElement('text', {}, literal);
		host.element.append(text);
		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(0));
		const previousWrites = writes.length;

		host.setText(literal, 'after');

		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(previousWrites));
	});

	test('exposes render and paint phases to middleware', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;
		const { host } = ui;
		const phases: string[] = [];

		RenderApi.around(host.root, {
			render(args, next) {
				phases.push('render:start');
				try {
					return next(...args);
				} finally {
					phases.push('render:end');
				}
			},
			paint(args, next) {
				phases.push('paint:start');
				return next(...args).finally(() => phases.push('paint:end'));
			},
		});

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

		const result = DispatchApi.methods.dispatch(host.root, {
			type: 'keydown',
			key: 'x',
			code: 'x',
			text: 'x',
		});

		expect(result).toEqual({ ok: true, handled: true });
		expect(input.properties['value']).toBe('x');
	});

	test('renders and activates a button through focus and keyboard input', async () => {
		const { ui: resource, writes } = await setup();
		await using ui = resource;
		const { host } = ui;
		const button = host.createElement('button', { label: 'Save' });
		const pressed = vi.fn();
		button.addEventListener('press', pressed);
		host.element.append(button);

		await vi.waitFor(() => expect(writes.join('')).toContain('Save'));
		DispatchApi.methods.dispatch(host.root, {
			type: 'keydown',
			key: 'Enter',
			code: 'Enter',
		});

		expect(pressed).toHaveBeenCalledOnce();
	});

	test('composes keyboard focus navigation', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;
		const { host } = ui;
		const first = host.createElement('input');
		const second = host.createElement('input');
		host.insertBefore(host.element, first);
		host.insertBefore(host.element, second);

		DispatchApi.methods.dispatch(host.root, {
			type: 'keydown',
			key: 'Tab',
			code: 'Tab',
		});

		expect(getFocus(host.root)).toBe(second.node);
	});

	test('uses the alternate buffer and hides the cursor until the UI is disposed', async () => {
		const { ui, writes } = await setup();
		const terminal = settings(cursor(false), alternateBuffer());

		expect(writes).toEqual([decode(terminal.apply)]);

		{
			await using _resource = ui;
		}

		expect(writes).toEqual([decode(terminal.apply), decode(terminal.revert)]);
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

		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(writesAfterFirstFrame));
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
