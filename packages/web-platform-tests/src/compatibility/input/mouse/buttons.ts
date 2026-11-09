import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
import type { DOMEvent, DOMMouseEvent } from '../../contracts/events.ts';

export const spec = 'https://w3c.github.io/uievents/#dom-mouseevent-buttons';
export const input = ['mouse'] as const;
export const requires = ['input.mouse.delivery', 'events.data.mouse'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (const [button, mask] of [
		[0, 1],
		[1, 4],
		[2, 2],
	] as const) {
		context.test(
			`reports button ${button} with buttons mask ${mask} on press and zero on release`,
			async (fixture) => {
				const target = fixture.connect(fixture.document.createElement('button'));
				target.type = 'button';
				target.textContent = 'Buttons';
				target.addEventListener('contextmenu', (event) => event.preventDefault());
				target.addEventListener('auxclick', (event) => event.preventDefault());
				const calls: [string, number, number][] = [];
				for (const type of ['mousedown', 'mouseup']) {
					target.addEventListener(type, (event) => {
						const mouse = event as DOMMouseEvent;
						calls.push([mouse.type, mouse.button, mouse.buttons]);
					});
				}
				await fixture.input.move(target);
				await fixture.input.down(button);
				await fixture.input.up(button);
				expect(calls).toEqual([
					['mousedown', button, mask],
					['mouseup', button, 0],
				]);
			},
		);
	}

	context.test(
		'preserves other held buttons when a button is pressed or released',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('button'));
			target.type = 'button';
			target.textContent = 'Chord';
			target.addEventListener('contextmenu', (event) => event.preventDefault());
			target.addEventListener('auxclick', (event) => event.preventDefault());
			const states: [string, number, number][] = [];
			for (const type of ['mousedown', 'mouseup']) {
				target.addEventListener(type, (event) => {
					const mouse = event as DOMMouseEvent;
					states.push([mouse.type, mouse.button, mouse.buttons]);
				});
			}
			await fixture.input.move(target);
			await fixture.input.down(0);
			await fixture.input.down(2);
			await fixture.input.up(0);
			await fixture.input.up(2);
			expect(states).toEqual([
				['mousedown', 0, 1],
				['mousedown', 2, 3],
				['mouseup', 0, 2],
				['mouseup', 2, 0],
			]);
		},
	);

	context.test(
		'reports held and released buttons during movement to another element',
		async (fixture) => {
			const root = fixture.document.createElement('div');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = second.type = 'button';
			first.textContent = 'Start';
			second.textContent = 'Destination';
			root.append(first, second);
			fixture.connect(root);
			// Suppress selection/drag defaults while observing the mouse button state.
			first.addEventListener('mousedown', (event) => event.preventDefault());
			const moves: DOMMouseEvent[] = [];
			const record = (event: DOMEvent): void => {
				moves.push(event as DOMMouseEvent);
			};
			first.addEventListener('mousemove', record);
			second.addEventListener('mousemove', record);
			await fixture.input.move(first);
			moves.length = 0;
			await fixture.input.down();
			await fixture.input.move(second);
			expect(moves.length).toBeGreaterThan(0);
			expect(moves.at(-1)?.target).toBe(second);
			expect(moves.at(-1)?.buttons).toBe(1);
			await fixture.input.up();
			moves.length = 0;
			await fixture.input.move(first);
			expect(moves.length).toBeGreaterThan(0);
			expect(moves.at(-1)?.target).toBe(first);
			expect(moves.at(-1)?.buttons).toBe(0);
		},
	);

	context.test(
		'does not turn auxiliary or secondary button clicks into primary click events',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('button'));
			target.type = 'button';
			target.textContent = 'Auxiliary';
			target.addEventListener('contextmenu', (event) => event.preventDefault());
			target.addEventListener('auxclick', (event) => event.preventDefault());
			let clicks = 0;
			target.addEventListener('click', () => clicks++);
			await fixture.input.click(target, 1);
			await fixture.input.click(target, 2);
			expect(clicks).toBe(0);
			await fixture.input.click(target, 0);
			expect(clicks).toBe(1);
		},
	);

	context.test(
		'canceling auxiliary activation does not produce a primary click',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('button');
			fixture.connect(e as unknown as DOMElementContract);
			const clicks: number[] = [],
				aux: number[] = [];
			e.addEventListener('click', (event) => clicks.push(event.button));
			e.addEventListener('auxclick', (event) => {
				aux.push(event.button);
				event.preventDefault();
			});
			await fixture.input.click(e as unknown as DOMElementContract, 1);
			expect(clicks).toEqual([]);
			expect(aux).toEqual([1]);
		},
	);
}
