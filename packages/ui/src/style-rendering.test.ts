import { describe, expect, it } from 'vitest';
import { createTestUI } from '../test/ui.ts';
import type { UI } from './ui.ts';

const green = { r: 0, g: 205, b: 0 };
const blue = { r: 0, g: 0, b: 238 };

describe('style rendering', () => {
	it('defaults div to a row with no gap or padding, and repaints when direction changes', async () => {
		await using ui = await createTestUI({ cols: 12, rows: 4 });
		const { document, terminal } = ui;
		const row = document.createElement('div');
		row.appendChild(label(document, 'A'));
		row.appendChild(label(document, 'B'));
		document.body.appendChild(row);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['AB', '', '', '']);

		row.style.flexDirection = 'column';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['A', 'B', '', '']);

		row.style.flexDirection = '';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['AB', '', '', '']);
	});

	it('lets a span become a flex container', async () => {
		await using ui = await createTestUI({ cols: 12, rows: 4 });
		const { document, terminal } = ui;
		const column = document.createElement('span');
		column.style.display = 'flex';
		column.style.flexDirection = 'column';
		column.style.gap = '1px';
		column.appendChild(label(document, 'A'));
		column.appendChild(label(document, 'B'));
		document.body.appendChild(column);
		document.body.appendChild(label(document, 'C'));

		await expect.poll(() => terminal.screen.getLines()).toEqual(['AC', '', 'B', '']);
	});

	it('lets a div become one inline text item', async () => {
		await using ui = await createTestUI({ cols: 12, rows: 4 });
		const { document, terminal } = ui;
		document.body.style.flexDirection = 'column';
		document.body.style.gap = '1px';
		const flow = document.createElement('div');
		flow.style.display = 'inline';
		// These declarations apply to flex containers, not inline text.
		flow.style.flexDirection = 'column';
		flow.style.gap = '3px';
		flow.appendChild(document.createTextNode('A'));
		flow.appendChild(label(document, 'B'));
		document.body.appendChild(flow);
		document.body.appendChild(label(document, 'C'));

		await expect.poll(() => terminal.screen.getLines()).toEqual(['AB', '', 'C', '']);
	});

	it('uses gap and individual padding as whole terminal cells without inheriting them', async () => {
		await using ui = await createTestUI({ cols: 12, rows: 5 });
		const { document, terminal } = ui;
		document.body.style.flexDirection = 'column';
		const row = document.createElement('div');
		const padded = document.createElement('div');
		padded.style.gap = '2px';
		padded.style.paddingTop = '1px';
		padded.style.paddingRight = '3px';
		padded.style.paddingBottom = '1px';
		padded.style.paddingLeft = '2px';
		const inner = document.createElement('div');
		inner.appendChild(label(document, 'A'));
		inner.appendChild(label(document, 'B'));
		padded.appendChild(inner);
		padded.appendChild(label(document, 'C'));
		row.appendChild(padded);
		row.appendChild(label(document, 'R'));
		document.body.appendChild(row);
		document.body.appendChild(label(document, 'D'));

		// R observes right padding; D observes bottom padding and the row's height.
		await expect
			.poll(() => terminal.screen.getLines())
			.toEqual(['          R', '  AB  C', '', 'D', '']);
	});

	it.each([
		['borderTopWidth', ['─', 'X', '']],
		['borderRightWidth', ['X│', '', '']],
		['borderBottomWidth', ['X', '─', '']],
		['borderLeftWidth', ['│X', '', '']],
	] as const)('draws only the side selected by %s', async (side, lines) => {
		await using ui = await createTestUI({ cols: 8, rows: 3 });
		const { document, terminal } = ui;
		const box = document.createElement('div');
		box.style.borderStyle = 'solid';
		box.style.borderColor = 'rgb(0 0 238)';
		box.style.borderTopWidth = '0px';
		box.style.borderRightWidth = '0px';
		box.style.borderBottomWidth = '0px';
		box.style.borderLeftWidth = '0px';
		box.style[side] = '1px';
		box.appendChild(document.createTextNode('X'));
		document.body.appendChild(box);

		await expect.poll(() => terminal.screen.getLines()).toEqual(lines);
	});

	it('requires solid to show a border and retains its widths while hidden', async () => {
		await using ui = await createTestUI({ cols: 8, rows: 4 });
		const { document, terminal } = ui;
		const box = document.createElement('div');
		box.style.borderColor = 'rgb(0 0 238)';
		box.style.borderTopWidth = '1px';
		box.style.borderRightWidth = '1px';
		box.style.borderBottomWidth = '1px';
		box.style.borderLeftWidth = '1px';
		box.appendChild(document.createTextNode('X'));
		document.body.appendChild(box);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['X', '', '', '']);

		box.style.borderStyle = 'solid';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['┌─┐', '│X│', '└─┘', '']);

		box.style.borderStyle = 'none';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['X', '', '', '']);
		expect(box.style.borderTopWidth).toBe('1px');
		expect(box.style.borderRightWidth).toBe('1px');
		expect(box.style.borderBottomWidth).toBe('1px');
		expect(box.style.borderLeftWidth).toBe('1px');

		box.style.borderStyle = 'solid';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['┌─┐', '│X│', '└─┘', '']);
	});

	it('resolves the default border width to one cell outside the padding', async () => {
		await using ui = await createTestUI({ cols: 8, rows: 6 });
		const { document, terminal } = ui;
		const box = document.createElement('div');
		box.style.borderStyle = 'solid';
		box.style.borderColor = 'rgb(0 0 238)';
		box.style.paddingTop = '1px';
		box.style.paddingRight = '1px';
		box.style.paddingBottom = '1px';
		box.style.paddingLeft = '1px';
		box.appendChild(document.createTextNode('X'));
		document.body.appendChild(box);

		await expect
			.poll(() => terminal.screen.getLines())
			.toEqual(['┌───┐', '│   │', '│ X │', '│   │', '└───┘', '']);
		// Resolved defaults do not become authored inline declarations.
		expect(box.style.borderTopWidth).toBe('');
	});

	it('inherits color, preserves overrides, and repaints descendants when declarations change or clear', async () => {
		await using ui = await createTestUI({ cols: 8, rows: 2 });
		const { document, terminal } = ui;
		document.body.style.color = 'rgb(229 229 229)';
		const parent = document.createElement('div');
		parent.style.color = 'rgb(0 205 0)';
		const inherited = label(document, 'A');
		const overridden = label(document, 'B');
		overridden.style.color = 'rgb(0 0 0)';
		parent.appendChild(inherited);
		parent.appendChild(overridden);
		document.body.appendChild(parent);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['AB', '']);
		await expect.poll(() => terminal.getCell(0, 0).fg).toMatchObject(green);
		expect(terminal.getCell(0, 1).fg).toMatchObject({ r: 0, g: 0, b: 0 });
		expect(inherited.style.color).toBe('');

		parent.style.color = 'rgb(0 0 238)';
		await expect.poll(() => terminal.getCell(0, 0).fg).toMatchObject(blue);
		expect(terminal.getCell(0, 1).fg).toMatchObject({ r: 0, g: 0, b: 0 });

		overridden.style.color = '';
		await expect.poll(() => terminal.getCell(0, 1).fg).toMatchObject(blue);

		parent.style.color = '';
		await expect.poll(() => terminal.getCell(0, 0).fg).toMatchObject({ r: 229, g: 229, b: 229 });
		expect(terminal.getCell(0, 1).fg).toMatchObject({ r: 229, g: 229, b: 229 });

		document.body.style.color = '';
		await expect.poll(() => terminal.getCell(0, 0).fg).toBeNull();
		expect(terminal.getCell(0, 1).fg).toBeNull();
	});

	it.each([
		['green', { r: 0, g: 128, b: 0 }],
		['#00cd00', green],
		['hsl(240 100% 50%)', { r: 0, g: 0, b: 255 }],
	] as const)('converts %s to a terminal text color', async (color, expected) => {
		await using ui = await createTestUI({ cols: 8, rows: 2 });
		const { document, terminal } = ui;
		const text = label(document, 'X');
		text.style.color = color;
		document.body.appendChild(text);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['X', '']);
		expect(terminal.getCell(0, 0).fg).toMatchObject(expected);
	});

	it('resolves default and explicit currentColor borders from inherited text color', async () => {
		await using ui = await createTestUI({ cols: 8, rows: 4 });
		const { document, terminal } = ui;
		document.body.style.color = 'rgb(0 205 0)';
		const box = document.createElement('div');
		box.style.borderStyle = 'solid';
		box.appendChild(document.createTextNode('X'));
		document.body.appendChild(box);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['┌─┐', '│X│', '└─┘', '']);
		expect(terminal.getCell(0, 0).fg).toMatchObject(green);
		expect(terminal.getCell(1, 1).fg).toMatchObject(green);

		box.style.borderColor = 'rgb(0 0 238)';
		await expect.poll(() => terminal.getCell(0, 0).fg).toMatchObject(blue);
		expect(terminal.getCell(1, 1).fg).toMatchObject(green);

		box.style.borderColor = 'currentColor';
		await expect.poll(() => terminal.getCell(0, 0).fg).toMatchObject(green);

		document.body.style.color = 'rgb(0 0 238)';
		await expect.poll(() => terminal.getCell(0, 0).fg).toMatchObject(blue);
		expect(terminal.getCell(1, 1).fg).toMatchObject(blue);
	});

	it('concatenates adjacent text nodes verbatim without inserting gaps inside a span', async () => {
		await using ui = await createTestUI({ cols: 32, rows: 2 });
		const { document, terminal } = ui;
		document.body.style.gap = '2px';
		const flow = document.createElement('span');
		flow.appendChild(document.createTextNode('  Hello '));
		flow.appendChild(document.createTextNode('   world  '));
		flow.appendChild(document.createTextNode('!'));
		document.body.appendChild(flow);
		document.body.appendChild(label(document, '|'));

		await expect.poll(() => terminal.screen.getLines()).toEqual(['  Hello    world  !  |', '']);
	});

	it('wraps nested spans with equal resolved styles as one text flow', async () => {
		await using ui = await createTestUI({ cols: 10, rows: 5 });
		const { document, terminal } = ui;
		document.body.style.flexDirection = 'column';
		document.body.style.gap = '1px';
		document.body.style.color = 'rgb(0 205 0)';
		const flow = document.createElement('span');
		flow.appendChild(document.createTextNode('one '));
		const nested = label(document, 'two three');
		// Different declaration spelling, same resolved color as its parent.
		nested.style.color = 'rgb(0, 205, 0)';
		flow.appendChild(nested);
		flow.appendChild(document.createTextNode(' four'));
		document.body.appendChild(flow);
		document.body.appendChild(label(document, '!'));

		await expect
			.poll(() => terminal.screen.getLines())
			.toEqual(['one two', 'three four', '', '!', '']);
		expect(terminal.getCell(1, 0).fg).toMatchObject(green);
	});

	it.each(['span', 'div'] as const)(
		'collects text from a nested %s using the outer inline color',
		async (tagName) => {
			await using ui = await createTestUI({ cols: 20, rows: 2 });
			const { document, terminal } = ui;
			const flow = document.createElement('span');
			flow.style.color = 'rgb(0 205 0)';
			flow.appendChild(document.createTextNode('Hello '));
			const nested = document.createElement(tagName);
			nested.style.color = 'rgb(0 0 238)';
			nested.appendChild(document.createTextNode('world'));
			flow.appendChild(nested);
			flow.appendChild(document.createTextNode('!'));
			document.body.appendChild(flow);

			await expect.poll(() => terminal.screen.getLines()).toEqual(['Hello world!', '']);
			for (let column = 0; column < 'Hello world!'.length; column++) {
				expect(terminal.getCell(0, column).fg).toMatchObject(green);
			}
		},
	);

	it('preserves border space and keeps rendering when the border color is terminal-default', async () => {
		await using ui = await createTestUI({ cols: 8, rows: 4 });
		const { document, terminal } = ui;
		const box = document.createElement('div');
		box.style.borderStyle = 'solid';
		box.appendChild(document.createTextNode('X'));
		document.body.appendChild(box);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['', ' X', '', '']);
		expect(terminal.getCell(1, 1).fg).toBeNull();

		box.style.borderColor = 'rgb(0 0 238)';
		await expect.poll(() => terminal.screen.getLines()).toEqual(['┌─┐', '│X│', '└─┘', '']);
		expect(terminal.getCell(0, 0).fg).toMatchObject(blue);

		box.style.borderColor = '';
		document.body.appendChild(label(document, '!'));
		await expect.poll(() => terminal.screen.getLines()).toEqual(['   !', ' X', '', '']);
	});

	it('allows terminal-default foreground when every border side has zero width', async () => {
		await using ui = await createTestUI({ cols: 8, rows: 2 });
		const { document, terminal } = ui;
		const box = document.createElement('div');
		box.style.borderStyle = 'solid';
		box.style.borderTopWidth = '0px';
		box.style.borderRightWidth = '0px';
		box.style.borderBottomWidth = '0px';
		box.style.borderLeftWidth = '0px';
		box.appendChild(document.createTextNode('X'));
		document.body.appendChild(box);

		await expect.poll(() => terminal.screen.getLines()).toEqual(['X', '']);
		expect(terminal.getCell(0, 0).fg).toBeNull();
	});
});

function label(document: UI['document'], content: string): UI['document']['documentElement'] {
	const element = document.createElement('span');
	element.appendChild(document.createTextNode(content));
	return element;
}
