import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event', 'AbortController'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#add-an-event-listener';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/dom/events/AddEventListenerOptions-signal.any.js';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'removes a listener when its signal aborts and ignores already-aborted signals',
		({ document, globals }) => {
			const Event = globals('Event');
			const AbortController = globals('AbortController');
			const target = document.createElement('div');
			const controller = new AbortController();
			let calls = 0;
			const listener = (): void => {
				calls++;
			};
			target.addEventListener('probe', listener, { signal: controller.signal });
			target.dispatchEvent(new Event('probe'));
			expect(calls).toBe(1);
			controller.abort();
			target.dispatchEvent(new Event('probe'));
			expect(calls).toBe(1);
			target.addEventListener('probe', listener, { signal: controller.signal });
			target.dispatchEvent(new Event('probe'));
			expect(calls).toBe(1);
		},
	);
	context.test(
		'aborting a signal removes listeners still waiting in the current invocation',
		({ document, globals }) => {
			const Event = globals('Event');
			const AbortController = globals('AbortController');
			const target = document.createElement('div');
			const controller = new AbortController();
			const calls: string[] = [];
			target.addEventListener('probe', () => {
				calls.push('first');
				controller.abort();
			});
			target.addEventListener(
				'probe',
				() => {
					calls.push('aborted');
				},
				{ signal: controller.signal },
			);
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['first']);
		},
	);
	context.test('validates a signal even when the callback is null', ({ document }) => {
		const target = document.createElement('div');
		expect(() => {
			// @ts-expect-error -- Verify Web IDL rejects null instead of an AbortSignal.
			target.addEventListener('probe', null, { signal: null });
		}).toThrow(expect.objectContaining({ name: 'TypeError' }));
	});

	context.test(
		'ignores already aborted signals and removes multiple listeners synchronously',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div');
			const AbortController = fixture.globals('AbortController'),
				Event = fixture.globals('Event');
			const controller = new AbortController();
			let n = 0;
			e.addEventListener('x', () => n++, { signal: controller.signal });
			e.addEventListener('y', () => n++, { signal: controller.signal });
			controller.abort();
			e.addEventListener('x', () => n++, { signal: controller.signal });
			e.dispatchEvent(new Event('x') as unknown as Event);
			e.dispatchEvent(new Event('y') as unknown as Event);
			expect(n).toBe(0);
		},
	);
}
