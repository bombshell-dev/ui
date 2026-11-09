import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'stops remaining listeners on the current invocation target',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const calls: string[] = [];
			target.addEventListener('probe', (event) => {
				calls.push('first');
				event.stopImmediatePropagation();
			});
			target.addEventListener('probe', () => {
				calls.push('second');
			});
			const event = new Event('probe');
			target.dispatchEvent(event);
			target.dispatchEvent(event);
			expect(calls).toEqual(['first', 'first']);
		},
	);
	context.test(
		'stops both the remaining target capture listeners and the target non-capture invocation',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const calls: string[] = [];
			target.addEventListener(
				'probe',
				(event) => {
					calls.push('first');
					event.stopImmediatePropagation();
				},
				true,
			);
			target.addEventListener(
				'probe',
				() => {
					calls.push('second');
				},
				true,
			);
			target.addEventListener('probe', () => {
				calls.push('non-capture');
			});
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['first']);
		},
		['events.dispatch.capture'],
	);
}
