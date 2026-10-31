import type { CompatibilityContext } from '../../context.ts';
import type { DOMEvent, DOMEventTarget, DOMMouseEvent } from '../../contracts/events.ts';

export const spec = 'https://w3c.github.io/uievents/#events-mouseevent-event-order';
export const input = ['mouse'] as const;
export const requires = [
	'input.mouse.delivery',
	'events.data.mouse',
	'events.dispatch.capture',
	'events.dispatch.bubbling',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'moving between siblings leaves the old target before entering the new one',
		async (fixture) => {
			const root = fixture.document.createElement('div');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = second.type = 'button';
			first.textContent = 'First';
			second.textContent = 'Second';
			root.append(first, second);
			fixture.connect(root);
			await fixture.input.move(first);
			const calls: [string, DOMEventTarget | null, DOMEventTarget | null][] = [];
			const record = (event: DOMEvent): void => {
				const mouse = event as DOMMouseEvent;
				calls.push([mouse.type, mouse.target, mouse.relatedTarget]);
			};
			for (const target of [first, second])
				for (const type of ['mouseout', 'mouseleave', 'mouseover', 'mouseenter'])
					target.addEventListener(type, record);
			await fixture.input.move(second);
			expect(calls).toEqual([
				['mouseout', first, second],
				['mouseleave', first, second],
				['mouseover', second, first],
				['mouseenter', second, first],
			]);
		},
	);

	context.test(
		'over and out bubble while enter and leave are captured without bubbling',
		async (fixture) => {
			const root = fixture.document.createElement('div');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = second.type = 'button';
			first.textContent = 'First';
			second.textContent = 'Second';
			root.append(first, second);
			fixture.connect(root);
			await fixture.input.move(first);
			const calls: [string, string, boolean, DOMEventTarget | null][] = [];
			for (const type of ['mouseout', 'mouseleave', 'mouseover', 'mouseenter']) {
				root.addEventListener(
					type,
					(event) => {
						calls.push(['capture', event.type, event.bubbles, event.target]);
					},
					true,
				);
				root.addEventListener(type, (event) => {
					calls.push(['bubble', event.type, event.bubbles, event.target]);
				});
			}
			await fixture.input.move(second);
			expect(calls).toEqual([
				['capture', 'mouseout', true, first],
				['bubble', 'mouseout', true, first],
				['capture', 'mouseleave', false, first],
				['capture', 'mouseover', true, second],
				['bubble', 'mouseover', true, second],
				['capture', 'mouseenter', false, second],
			]);
		},
	);

	context.test(
		'movement within a common ancestor does not leave or reenter that ancestor',
		async (fixture) => {
			const root = fixture.document.createElement('div');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = second.type = 'button';
			first.textContent = 'First';
			second.textContent = 'Second';
			root.append(first, second);
			fixture.connect(root);
			await fixture.input.move(first);
			const rootTransitions: string[] = [];
			const childTransitions: string[] = [];
			for (const type of ['mouseenter', 'mouseleave']) {
				root.addEventListener(type, (event) => rootTransitions.push(event.type));
				first.addEventListener(type, (event) => childTransitions.push(`first:${event.type}`));
				second.addEventListener(type, (event) => childTransitions.push(`second:${event.type}`));
			}
			await fixture.input.move(second);
			await fixture.input.move(first);
			expect(rootTransitions).toEqual([]);
			expect(childTransitions).toEqual([
				'first:mouseleave',
				'second:mouseenter',
				'second:mouseleave',
				'first:mouseenter',
			]);
		},
	);
}
