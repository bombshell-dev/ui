import type { CompatibilityContext } from '../../context.ts';
import type { DOMEvent, DOMEventTarget } from '../../contracts/events.ts';

export const spec = 'https://w3c.github.io/uievents/#events-mouseevent-event-order';
export const input = ['mouse'] as const;
export const requires = [
	'events.dispatch.target',
	'events.dispatch.capture',
	'events.dispatch.bubbling',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'delivers down, up, and click through capture, target, and bubble',
		async (fixture) => {
			const { document } = fixture;
			const root = document.createElement('div');
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = 'Target';
			root.appendChild(button);
			fixture.connect(root);
			const calls: {
				type: string;
				target: DOMEventTarget | null;
				currentTarget: DOMEventTarget | null;
				phase: number;
				bubbles: boolean;
				cancelable: boolean;
			}[] = [];
			const record = (event: DOMEvent): void => {
				calls.push({
					type: event.type,
					target: event.target,
					currentTarget: event.currentTarget,
					phase: event.eventPhase,
					bubbles: event.bubbles,
					cancelable: event.cancelable,
				});
			};
			for (const type of ['mousedown', 'mouseup', 'click']) {
				root.addEventListener(type, record, true);
				button.addEventListener(type, record);
				root.addEventListener(type, record);
			}
			await fixture.input.click(button);
			expect(calls).toEqual(
				['mousedown', 'mouseup', 'click'].flatMap((type) =>
					[root, button, root].map((currentTarget, index) => ({
						type,
						target: button,
						currentTarget,
						phase: index + 1,
						bubbles: true,
						cancelable: true,
					})),
				),
			);
		},
	);

	context.test(
		'defers mouseup and click until the held primary button is released',
		async (fixture) => {
			const button = fixture.connect(fixture.document.createElement('button'));
			button.type = 'button';
			button.textContent = 'Hold';
			const calls: string[] = [];
			for (const type of ['mousedown', 'mouseup', 'click'])
				button.addEventListener(type, (event) => calls.push(event.type));
			await fixture.input.move(button);
			await fixture.input.down();
			expect(calls).toEqual(['mousedown']);
			await fixture.input.up();
			expect(calls).toEqual(['mousedown', 'mouseup', 'click']);
		},
	);

	context.test(
		'retargets mouse delivery when the pointer moves between sibling controls',
		async (fixture) => {
			const root = fixture.document.createElement('div');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = second.type = 'button';
			first.textContent = 'First';
			second.textContent = 'Second';
			root.append(first, second);
			fixture.connect(root);
			const targets: (DOMEventTarget | null)[] = [];
			root.addEventListener('click', (event) => targets.push(event.target));
			await fixture.input.click(first);
			await fixture.input.click(second);
			expect(targets).toEqual([first, second]);
		},
	);
}
