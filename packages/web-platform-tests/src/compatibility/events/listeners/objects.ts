import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-listener-inner-invoke';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'calls handleEvent with the listener object as its receiver',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const receivers: unknown[] = [];
			const calls: string[] = [];
			const listener = {
				handleEvent() {
					receivers.push(this);
					calls.push('initial');
				},
			};
			target.addEventListener('probe', listener);
			target.dispatchEvent(new Event('probe'));
			listener.handleEvent = function () {
				receivers.push(this);
				calls.push('replacement');
			};
			target.dispatchEvent(new Event('probe'));
			expect(receivers.length).toBe(2);
			expect(receivers[0]).toBe(listener);
			expect(receivers[1]).toBe(listener);
			expect(calls).toEqual(['initial', 'replacement']);
			target.removeEventListener('probe', listener);
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual(['initial', 'replacement']);
		},
	);

	context.test(
		'looks up handleEvent at invocation and preserves the object receiver',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div'),
				seen: unknown[] = [];
			const listener = {
				handleEvent() {
					seen.push(this);
				},
			};
			e.addEventListener('x', listener);
			const Event = fixture.globals('Event');
			e.dispatchEvent(new Event('x') as unknown as Event);
			listener.handleEvent = function () {
				seen.push('changed', this);
			};
			e.dispatchEvent(new Event('x') as unknown as Event);
			expect(seen).toEqual([listener, 'changed', listener]);
			e.removeEventListener('x', listener);
			e.dispatchEvent(new Event('x') as unknown as Event);
			expect(seen.length).toBe(3);
		},
	);
}
