import type { WriteStream } from 'node:tty';
import { createElement } from 'react';
import { describe, expect, test } from 'vitest';
import { createReactUI } from './ui.ts';

describe('createReactUI', () => {
	test('renders React elements through an owned UI', async () => {
		const { output, writes } = captureOutput();
		const ui = await createReactUI({ height: 1, inline: true, output, width: 20 });
		let writesBeforeDispose = 0;

		try {
			ui.render(createElement('text', {}, 'Hello from React'));

			expect(writes.join('')).toContain('Hello from React');
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
