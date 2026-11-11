import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Passing an AbortSignal to addEventListener options should allow removing a listener',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener('test', handler, { signal: controller.signal });
			et.dispatchEvent(new Event('test'));
			expect(count, 'Adding a signal still adds a listener').toBe(1);
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was not added with the once flag').toBe(2);
			controller.abort();
			et.dispatchEvent(new Event('test'));
			expect(count, 'Aborting on the controller removes the listener').toBe(2);
			et.addEventListener('test', handler, { signal: controller.signal });
			et.dispatchEvent(new Event('test'));
			expect(count, 'Passing an aborted signal never adds the handler').toBe(2);
		},
	);
	context.test(
		'Passing an AbortSignal to addEventListener does not prevent removeEventListener',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener('test', handler, { signal: controller.signal });
			et.removeEventListener('test', handler);
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Passing an AbortSignal to addEventListener works with the once flag',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener('test', handler, { signal: controller.signal, once: true });
			controller.abort();
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Removing a once listener works with a passed signal',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener('test', handler, { signal: controller.signal, once: true });
			et.removeEventListener('test', handler);
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Passing an AbortSignal to multiple listeners',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener('first', handler, { signal: controller.signal, once: true });
			et.addEventListener('second', handler, { signal: controller.signal, once: true });
			controller.abort();
			et.dispatchEvent(new Event('first'));
			et.dispatchEvent(new Event('second'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Passing an AbortSignal to addEventListener works with the capture flag',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener('test', handler, { signal: controller.signal, capture: true });
			controller.abort();
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Aborting from a listener does not call future listeners',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener(
				'test',
				() => {
					controller.abort();
				},
				{ signal: controller.signal },
			);
			et.addEventListener('test', handler, { signal: controller.signal });
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Adding then aborting a listener in another listener does not call it',
		({ EventTarget, Event, AbortController }) => {
			let count = 0;
			function handler() {
				count++;
			}
			const et = new EventTarget();
			const controller = new AbortController();
			et.addEventListener(
				'test',
				() => {
					et.addEventListener('test', handler, { signal: controller.signal });
					controller.abort();
				},
				{ signal: controller.signal },
			);
			et.dispatchEvent(new Event('test'));
			expect(count, 'The listener was still removed').toBe(0);
		},
	);
	context.test(
		'Aborting from a nested listener should remove it',
		({ EventTarget, Event, AbortController }) => {
			const et = new EventTarget();
			const ac = new AbortController();
			let count = 0;
			et.addEventListener(
				'foo',
				() => {
					et.addEventListener(
						'foo',
						() => {
							count++;
							if (count > 5) ac.abort();
							et.dispatchEvent(new Event('foo'));
						},
						{ signal: ac.signal },
					);
					et.dispatchEvent(new Event('foo'));
				},
				{ once: true },
			);
			et.dispatchEvent(new Event('foo'));
		},
	);
	context.test('Passing null as the signal should throw', ({ EventTarget, TypeError }) => {
		const et = new EventTarget();
		expect(() => {
			et.addEventListener('foo', () => {}, { signal: null as unknown as AbortSignal });
		}).toThrow(expect.objectContaining({ constructor: TypeError }));
	});
	context.test(
		'Passing null as the signal should throw (listener is also null)',
		({ EventTarget, TypeError }) => {
			const et = new EventTarget();
			expect(() => {
				et.addEventListener('foo', null, { signal: null as unknown as AbortSignal });
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
	);
}
