import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'delivers a synthetic event to the target with the correct receiver and cleans up state',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const event = new Event('MixedCase');
			const seen: unknown[] = [];
			target.addEventListener('MixedCase', function (received) {
				seen.push(received, this, received.target, received.currentTarget, received.eventPhase);
			});
			expect(event.target).toBeNull();
			expect(target.dispatchEvent(event)).toBe(true);
			expect(seen.length).toBe(5);
			expect(seen[0]).toBe(event);
			expect(seen[1]).toBe(target);
			expect(seen[2]).toBe(target);
			expect(seen[3]).toBe(target);
			expect(seen[4]).toBe(2);
			expect(event.target).toBe(target);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(0);
			expect(event.composedPath()).toEqual([]);
			expect(event.isTrusted).toBe(false);
		},
	);
	context.test('does not lowercase event names', ({ document, globals }) => {
		const target = document.createElement('div');
		let count = 0;
		target.addEventListener('MixedCase', () => {
			count++;
		});
		const Event = globals('Event');
		target.dispatchEvent(new Event('mixedcase'));
		expect(count).toBe(0);
		target.dispatchEvent(new Event('MixedCase'));
		expect(count).toBe(1);
	});

	context.test(
		'clears currentTarget and phase after dispatch while retaining target',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div');
			const Event = fixture.globals('Event'),
				event = new Event('x');
			let phase = 0;
			const receivers: unknown[] = [];
			e.addEventListener('x', function (this: HTMLElement, ev) {
				phase = ev.eventPhase;
				receivers.push(this);
			});
			e.dispatchEvent(event as unknown as Event);
			expect(phase).toBe(2);
			expect(receivers).toEqual([e]);
			expect(event.target).toBe(e);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(0);
			expect(event.composedPath()).toEqual([]);
		},
	);
}
