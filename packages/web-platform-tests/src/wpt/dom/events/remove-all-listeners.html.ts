import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Removing all listeners and then adding a new one should work.',
		({ document, Event }) => {
			const type = 'foo';
			const target = document.createElement('div');

			let listener1CallCount = 0;
			let listener2CallCount = 0;
			let listener3CallCount = 0;
			function listener1(): void {
				listener1CallCount++;
				target.removeEventListener(type, listener1);
				target.removeEventListener(type, listener2);
				target.addEventListener(type, listener3);
			}
			function listener2(): void {
				listener2CallCount++;
			}
			function listener3(): void {
				listener3CallCount++;
			}

			target.addEventListener(type, listener1);
			target.addEventListener(type, listener2);

			// Dispatch the event. Only listener1 should be called because
			// it removes listener2. And listener3 is added when we've already
			// started iterating, so it shouldn't be called either.
			target.dispatchEvent(new Event(type));
			expect(listener1CallCount).toBe(1);
			expect(listener2CallCount).toBe(0);
			expect(listener3CallCount).toBe(0);

			// Now that only listener3 is set, dispatch another event. Only
			// listener3 should be called.
			target.dispatchEvent(new Event(type));
			expect(listener1CallCount).toBe(1);
			expect(listener2CallCount).toBe(0);
			expect(listener3CallCount).toBe(1);
		},
	);

	context.test('Nested usage of once listeners should work.', ({ document, Event, step }) => {
		const type = 'foo';
		const target = document.createElement('div');

		let listener1CallCount = 0;
		let listener2CallCount = 0;
		let listener3CallCount = 0;
		const listener1 = step(function (): void {
			listener1CallCount++;
			// Recursively dispatch another event from this listener.
			// This will only call listener2 because listener1 is a "once" listener.
			target.dispatchEvent(new Event(type));
			expect(listener1CallCount).toBe(1);
			expect(listener2CallCount).toBe(1);
			expect(listener3CallCount).toBe(0);

			// Now all listeners are removed - the two "once" listeners have already both
			// been called once. Add another listener.
			target.addEventListener(type, listener3);
		});
		function listener2(): void {
			listener2CallCount++;
		}
		function listener3(): void {
			listener3CallCount++;
		}

		// Add two "once" listeners.
		target.addEventListener(type, listener1, { once: true });
		target.addEventListener(type, listener2, { once: true });

		// Dispatch the event.
		target.dispatchEvent(new Event(type));

		// The listener call counts should still match what they were
		// at the end of listener1.
		expect(listener1CallCount).toBe(1);
		expect(listener2CallCount).toBe(1);
		expect(listener3CallCount).toBe(0);

		// Now that only listener3 is set, dispatch another event. Only
		// listener3 should be called.
		target.dispatchEvent(new Event(type));
		expect(listener1CallCount).toBe(1);
		expect(listener2CallCount).toBe(1);
		expect(listener3CallCount).toBe(1);
	});
}
