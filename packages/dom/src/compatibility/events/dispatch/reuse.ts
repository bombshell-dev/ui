import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'updates target when an event is reused on another element',
		({ document, globals }) => {
			const Event = globals('Event');
			const first = document.createElement('div');
			const second = document.createElement('div');
			const event = new Event('probe');
			first.dispatchEvent(event);
			expect(event.target).toBe(first);
			second.dispatchEvent(event);
			expect(event.target).toBe(second);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(0);
			expect(event.composedPath()).toEqual([]);
		},
	);

	context.test('clears stopPropagation state for the next dispatch', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		let count = 0;
		const stop = (event: Event): void => event.stopPropagation();
		e.addEventListener('x', stop);
		p.addEventListener('x', () => count++);
		const Event = fixture.globals('Event'),
			event = new Event('x', { bubbles: true });
		e.dispatchEvent(event as unknown as Event);
		expect(count).toBe(0);
		e.removeEventListener('x', stop);
		e.dispatchEvent(event as unknown as Event);
		expect(count).toBe(1);
	});
}
