import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'returns false exactly when a cancelable event has been canceled',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			target.addEventListener('probe', (event) => {
				event.preventDefault();
			});
			const cancelable = new Event('probe', { cancelable: true });
			expect(target.dispatchEvent(cancelable)).toBe(false);
			expect(cancelable.defaultPrevented).toBe(true);
			const nonCancelable = new Event('probe');
			expect(target.dispatchEvent(nonCancelable)).toBe(true);
			expect(nonCancelable.defaultPrevented).toBe(false);
		},
	);
	context.test('retains cancellation when a canceled event is reused', ({ document, globals }) => {
		const Event = globals('Event');
		const target = document.createElement('div');
		const event = new Event('probe', { cancelable: true });
		event.preventDefault();
		expect(target.dispatchEvent(event)).toBe(false);
		expect(event.defaultPrevented).toBe(true);
	});

	context.test('noncancelable events ignore preventDefault and return true', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const Event = fixture.globals('Event'),
			event = new Event('x');
		e.addEventListener('x', (ev) => ev.preventDefault());
		expect(e.dispatchEvent(event as unknown as Event)).toBe(true);
		expect(event.defaultPrevented).toBe(false);
	});

	context.test('preserves canceled state on redispatch', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const Event = fixture.globals('Event'),
			event = new Event('x', { cancelable: true });
		event.preventDefault();
		expect(e.dispatchEvent(event as unknown as Event)).toBe(false);
		expect(event.defaultPrevented).toBe(true);
	});
}
