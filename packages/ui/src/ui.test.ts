import type { ReadStream, WriteStream } from 'node:tty';
import { alternateBuffer, CSI, cursor, settings } from '@bomb.sh/tty';
import { describe, expect, test, vi } from 'vitest';
import { getFocus } from './focus.ts';
import { createUI, handleInput, type UI, type UIOptions } from './ui.ts';

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
		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(0));
		const previousWrites = writes.length;

		host.setText(literal, 'after');

		await vi.waitFor(() => expect(writes.length).toBeGreaterThan(previousWrites));
	});

	test('composes keyboard input with focus and event dispatch', async () => {
		const { ui: resource } = await setup();
		await using ui = resource;
		const { host } = ui;
		const input = host.createElement('input');
		host.insertBefore(host.element, input);

		const result = handleInput(host, {
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

		handleInput(host, {
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
		const writesAfterFirstFrame = writes.length;

		host.setText(literal, 'after');

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
		write(chunk: string | Uint8Array): boolean {
			writes.push(typeof chunk === 'string' ? chunk : decode(chunk));
			return true;
		},
	} as unknown as WriteStream;

	return { output, writes };
}

function decode(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString('utf8');
}
