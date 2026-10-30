import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'rejects redispatch of the active event but permits a distinct nested event',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			const other = document.createElement('div');
			const outer = new Event('outer');
			const nested = new Event('nested');
			const calls: string[] = [];
			target.addEventListener('outer', (event) => {
				expect(() => other.dispatchEvent(event)).toThrow(
					expect.objectContaining({ name: 'InvalidStateError' }),
				);
				other.dispatchEvent(nested);
				expect(event.currentTarget).toBe(target);
				expect(event.eventPhase).toBe(2);
				calls.push('outer');
			});
			other.addEventListener('nested', () => {
				calls.push('nested');
			});
			target.dispatchEvent(outer);
			expect(calls).toEqual(['nested', 'outer']);
			expect(other.dispatchEvent(outer)).toBe(true);
		},
	);

	context.test('permits nested dispatch of a different event with independent state', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const Event = fixture.globals('Event');
		const seen: string[] = [];
		e.addEventListener('inner', () => seen.push('inner'));
		e.addEventListener('outer', () => {
			seen.push('before');
			e.dispatchEvent(new Event('inner') as unknown as Event);
			seen.push('after');
		});
		e.dispatchEvent(new Event('outer') as unknown as Event);
		expect(seen).toEqual(['before', 'inner', 'after']);
	});
}
