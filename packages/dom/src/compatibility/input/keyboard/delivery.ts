import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
import type { DOMKeyboardEvent } from '../../contracts/events.ts';

export const spec = 'https://w3c.github.io/uievents/#events-keyboard-event-order';
export const input = ['keyboard'] as const;
export const requires = [
	'focus.transitions',
	'events.dispatch.bubbling',
	'events.dispatch.cancellation',
	'events.data.keyboard',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'delivers keydown and keyup to the focused element and bubbles both',
		async (fixture) => {
			const { document } = fixture;
			const parent = fixture.connect(document.createElement('div'));
			const target = document.createElement('input');
			parent.appendChild(target);
			const received: unknown[][] = [];
			for (const type of ['keydown', 'keyup']) {
				target.addEventListener(type, (event) => {
					const key = event as DOMKeyboardEvent;
					received.push([
						type,
						'target',
						key.key,
						key.target,
						key.bubbles,
						key.cancelable,
						key.composed,
					]);
				});
				parent.addEventListener(type, (event) => received.push([type, 'parent', event.target]));
			}
			target.focus();
			await fixture.input.press('ArrowLeft');
			expect(received).toEqual([
				['keydown', 'target', 'ArrowLeft', target, true, true, true],
				['keydown', 'parent', target],
				['keyup', 'target', 'ArrowLeft', target, true, true, true],
				['keyup', 'parent', target],
			]);
		},
	);

	context.test('targets keyup at the element focused after keydown', async (fixture) => {
		const { document } = fixture;
		const root = fixture.connect(document.createElement('div'));
		const first = document.createElement('input');
		const second = document.createElement('input');
		root.append(first, second);
		const received: unknown[][] = [];
		first.addEventListener('keydown', (event) => received.push([event.type, event.target]));
		first.addEventListener('keyup', (event) => received.push([event.type, event.target]));
		second.addEventListener('keyup', (event) => received.push([event.type, event.target]));
		first.focus();
		await fixture.input.keyDown('ArrowRight');
		second.focus();
		await fixture.input.keyUp('ArrowRight');
		expect(received).toEqual([
			['keydown', first],
			['keyup', second],
		]);
	});

	context.test('still delivers keyup after a canceled keydown', async (fixture) => {
		const { document } = fixture;
		const target = fixture.connect(document.createElement('input'));
		const received: unknown[][] = [];
		target.addEventListener('keydown', (event) => {
			event.preventDefault();
			received.push([event.type, event.defaultPrevented]);
		});
		target.addEventListener('keyup', (event) =>
			received.push([event.type, event.defaultPrevented]),
		);
		target.focus();
		await fixture.input.press('ArrowLeft');
		expect(received).toEqual([
			['keydown', true],
			['keyup', false],
		]);
	});

	context.test(
		'keyup reaches the newly focused target after an awaited keydown',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				a = document.createElement('input'),
				b = document.createElement('input');
			p.append(a, b);
			fixture.connect(p as unknown as DOMElementContract);
			const seen: unknown[] = [];
			a.addEventListener('keydown', (e) => seen.push(['down', e.target]));
			b.addEventListener('keyup', (e) => seen.push(['up', e.target]));
			a.focus();
			await fixture.input.keyDown('Shift');
			b.focus();
			await fixture.input.keyUp('Shift');
			expect(seen).toEqual([
				['down', a],
				['up', b],
			]);
		},
	);
}
