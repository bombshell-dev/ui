import type { WriteStream } from 'node:tty';
import { describe, expect, test } from 'vitest';
import { Text, createComponent } from './index.ts';
import { createSolidUI } from './ui.ts';

describe('createSolidUI', () => {
	test('renders Solid elements through an owned UI', async () => {
		const { output, writes } = captureOutput();
		const ui = await createSolidUI({ height: 1, inline: true, output, width: 20 });
		let writesBeforeDispose = 0;

		try {
			ui.render(() => createComponent(Text, { children: 'Hello from Solid' }));

			expect(writes.join('')).toContain('Hello from Solid');
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
