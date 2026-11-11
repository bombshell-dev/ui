import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('Once listener should be invoked only once', ({ EventTarget, Event }) => {
		let invoked_once = false;
		let invoked_normal = false;
		function handler_once() {
			invoked_once = true;
		}
		function handler_normal() {
			invoked_normal = true;
		}

		const et = new EventTarget();
		et.addEventListener('test', handler_once, { once: true });
		et.addEventListener('test', handler_normal);
		et.dispatchEvent(new Event('test'));
		expect(invoked_once, 'Once handler should be invoked').toBe(true);
		expect(invoked_normal, 'Normal handler should be invoked').toBe(true);

		invoked_once = false;
		invoked_normal = false;
		et.dispatchEvent(new Event('test'));
		expect(invoked_once, "Once handler shouldn't be invoked again").toBe(false);
		expect(invoked_normal, 'Normal handler should be invoked again').toBe(true);
		et.removeEventListener('test', handler_normal);
	});
	context.test(
		'Once listener should be invoked only once even if the event is nested',
		({ EventTarget, Event }) => {
			const et = new EventTarget();
			let invoked_count = 0;
			function handler() {
				invoked_count++;
				if (invoked_count == 1) et.dispatchEvent(new Event('test'));
			}
			et.addEventListener('test', handler, { once: true });
			et.dispatchEvent(new Event('test'));
			expect(invoked_count, 'Once handler should only be invoked once').toBe(1);

			invoked_count = 0;
			function handler2() {
				invoked_count++;
				if (invoked_count == 1) et.addEventListener('test', handler2, { once: true });
				if (invoked_count <= 2) et.dispatchEvent(new Event('test'));
			}
			et.addEventListener('test', handler2, { once: true });
			et.dispatchEvent(new Event('test'));
			expect(invoked_count, 'Once handler should only be invoked once after each adding').toBe(2);
		},
	);
	context.test(
		'Once listener should be added / removed like normal listeners',
		({ EventTarget, Event }) => {
			let invoked_count = 0;
			function handler() {
				invoked_count++;
			}

			const et = new EventTarget();

			et.addEventListener('test', handler, { once: true });
			et.addEventListener('test', handler);
			et.dispatchEvent(new Event('test'));
			expect(invoked_count, 'The handler should only be added once').toBe(1);

			invoked_count = 0;
			et.dispatchEvent(new Event('test'));
			expect(invoked_count, 'The handler was added as a once listener').toBe(0);

			invoked_count = 0;
			et.addEventListener('test', handler, { once: true });
			et.removeEventListener('test', handler);
			et.dispatchEvent(new Event('test'));
			expect(invoked_count, 'The handler should have been removed').toBe(0);
		},
	);
	context.test(
		'Multiple once listeners should be invoked even if the stopImmediatePropagation is set',
		({ EventTarget, Event }) => {
			const et = new EventTarget();

			let invoked_count = 0;

			for (let n = 4; n > 0; n--) {
				et.addEventListener(
					'test',
					(e) => {
						invoked_count++;
						e.stopImmediatePropagation();
					},
					{ once: true },
				);
			}

			for (let n = 4; n > 0; n--) {
				et.dispatchEvent(new Event('test'));
			}

			expect(invoked_count, 'The listeners should be invoked').toBe(4);
		},
	);
}
