import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target', 'events.listeners.registration'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-listener-inner-invoke';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/dom/events/AddEventListenerOptions-once.any.js';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'removes a once listener before calling it, including nested dispatch',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			let calls = 0;
			target.addEventListener(
				'probe',
				() => {
					calls++;
					target.dispatchEvent(new Event('probe'));
				},
				{ once: true },
			);
			target.dispatchEvent(new Event('probe'));
			target.dispatchEvent(new Event('probe'));
			expect(calls).toBe(1);
		},
	);
	context.test(
		'does not replace an existing registration when once changes',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			let calls = 0;
			const listener = (): void => {
				calls++;
			};
			target.addEventListener('probe', listener);
			target.addEventListener('probe', listener, { once: true });
			target.dispatchEvent(new Event('probe'));
			target.dispatchEvent(new Event('probe'));
			expect(calls).toBe(2);
		},
	);

	context.test('removes once listeners before nested dispatch', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		let n = 0;
		const Event = fixture.globals('Event');
		e.addEventListener(
			'x',
			() => {
				n++;
				e.dispatchEvent(new Event('x') as unknown as Event);
			},
			{ once: true },
		);
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(n).toBe(1);
	});
}
