import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
import type { DOMKeyboardEvent } from '../../contracts/events.ts';

export const spec = 'https://w3c.github.io/uievents/#keys-modifiers';
export const input = ['keyboard'] as const;
export const requires = ['input.keyboard.delivery'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('holds Shift across another key press and clears it on release', async (fixture) => {
		const target = fixture.connect(fixture.document.createElement('input'));
		const received: unknown[][] = [];
		for (const type of ['keydown', 'keyup']) {
			target.addEventListener(type, (event) => {
				const key = event as DOMKeyboardEvent;
				received.push([key.type, key.key, key.shiftKey, key.getModifierState('Shift')]);
			});
		}
		target.focus();
		await fixture.input.keyDown('Shift');
		await fixture.input.press('ArrowRight');
		await fixture.input.keyUp('Shift');
		await fixture.input.press('ArrowRight');
		expect(received).toEqual([
			['keydown', 'Shift', true, true],
			['keydown', 'ArrowRight', true, true],
			['keyup', 'ArrowRight', true, true],
			['keyup', 'Shift', false, false],
			['keydown', 'ArrowRight', false, false],
			['keyup', 'ArrowRight', false, false],
		]);
	});

	context.test('preserves held modifiers when focus moves between controls', async (fixture) => {
		const root = fixture.connect(fixture.document.createElement('div'));
		const first = fixture.document.createElement('input');
		const second = fixture.document.createElement('input');
		root.append(first, second);
		const received: boolean[][] = [];
		second.addEventListener('keydown', (event) => {
			const key = event as DOMKeyboardEvent;
			received.push([key.shiftKey, key.ctrlKey, key.altKey, key.metaKey]);
		});
		first.focus();
		await fixture.input.keyDown('Shift');
		second.focus();
		await fixture.input.press('ArrowLeft');
		await fixture.input.keyUp('Shift');
		expect(received).toEqual([[true, false, false, false]]);
	});

	context.test(
		'Control remains held across independent key presses until release',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('input');
			fixture.connect(e as unknown as DOMElementContract);
			e.focus();
			const seen: unknown[] = [];
			e.addEventListener('keydown', (event) => {
				if (event.key === 'x' || event.key === 'y') {
					event.preventDefault();
					seen.push([event.key, event.ctrlKey, event.shiftKey]);
				}
			});
			await fixture.input.keyDown('Control');
			await fixture.input.press('x');
			await fixture.input.press('y');
			await fixture.input.keyUp('Control');
			await fixture.input.press('x');
			expect(seen).toEqual([
				['x', true, false],
				['y', true, false],
				['x', false, false],
			]);
		},
	);
}
