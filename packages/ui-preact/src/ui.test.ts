import type { WriteStream } from 'node:tty';
import { createElement } from 'preact';
import { describe, expect, test } from 'vitest';
import { createPreactUI } from './ui.ts';

describe('createPreactUI', () => {
	test('renders Preact elements through an owned UI', async () => {
		const { output, writes } = captureOutput();
		const ui = await createPreactUI({ height: 1, inline: true, output, width: 20 });
		let writesBeforeDispose = 0;

		try {
			ui.render(createElement('text', {}, 'Hello from Preact'));

			expect(writes.join('')).toContain('Hello from Preact');
		} finally {
			writesBeforeDispose = writes.length;
			await ui.dispose();
		}

		expect(ui.host.element.children).toEqual([]);
		expect(writes).toHaveLength(writesBeforeDispose + 1);
	});
});

function captureOutput(): { output: WriteStream; writes: string[] } {
	const writes: string[] = [];
	const output = {
		columns: 80,
		rows: 24,
		write(chunk: string | Uint8Array): boolean {
			writes.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8'));
			return true;
		},
	} as unknown as WriteStream;

	return { output, writes };
}
