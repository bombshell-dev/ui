import { describe, expect, it } from 'vitest';
import { createTestUI } from '../test/ui.ts';

describe('UI', () => {
	it('renders hello world in the terminal', async () => {
		await using ui = await createTestUI({ cols: 80, rows: 24 });
		const { terminal, document } = ui;

		document.documentElement.appendChild(document.createTextNode('hello world'));

		await expect.poll(() => terminal.screen, { timeout: 2000 }).toHaveText('hello world');
	});

	it('repaints when an existing text node changes', async () => {
		await using ui = await createTestUI({ cols: 12, rows: 2 });
		const { terminal, document } = ui;
		const text = document.createTextNode('before');
		document.documentElement.appendChild(text);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['before', '']);
		text.data = 'after';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['after', '']);
	});
});
