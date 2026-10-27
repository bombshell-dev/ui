import { describe, expect, it } from 'vitest';
import { createTestUI } from '../../../packages/ui/test/ui.ts';
import { createApp } from './app.ts';

const panel = [
	'┌──────────────────────┐',
	'│ @clack/ui            │',
	'│                      │',
	'│ status  ● ready      │',
	'│ version 0.0.0        │',
	'│ render  @bomb.sh/tty │',
	'└──────────────────────┘',
];

describe('basic example', () => {
	it('renders the original panel with styled labels and inherited value colors', async () => {
		await using ui = await createTestUI({ cols: 32, rows: 9 });
		const { document, terminal } = ui;
		document.documentElement.appendChild(createApp(document));

		await expect
			.poll(() => terminal.screen.getLines().map((line) => line.trimEnd()), { timeout: 2000 })
			.toEqual([...panel, '', '']);

		const runs = [
			{ row: 1, col: 2, content: '@clack/ui', color: { r: 0, g: 255, b: 255 } },
			{ row: 3, col: 2, content: 'status ', color: { r: 128, g: 128, b: 128 } },
			{ row: 3, col: 10, content: '● ready', color: { r: 0, g: 128, b: 0 } },
			{ row: 4, col: 2, content: 'version', color: { r: 128, g: 128, b: 128 } },
			{ row: 4, col: 10, content: '0.0.0', color: { r: 255, g: 255, b: 255 } },
			{ row: 5, col: 2, content: 'render ', color: { r: 128, g: 128, b: 128 } },
			{ row: 5, col: 10, content: '@bomb.sh/tty', color: { r: 255, g: 255, b: 255 } },
		];
		for (const run of runs) {
			for (const [offset, char] of [...run.content].entries()) {
				const cell = terminal.getCell(run.row, run.col + offset);
				expect(cell.char).toBe(char);
				expect(cell.fg).toMatchObject(run.color);
			}
		}

		for (const [row, line] of panel.entries()) {
			for (const [col, char] of [...line].entries()) {
				if ('┌┐└┘─│'.includes(char)) {
					expect(terminal.getCell(row, col).fg).toMatchObject({ r: 0, g: 0, b: 255 });
				}
			}
		}
	});
});
