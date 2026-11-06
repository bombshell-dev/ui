import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-listener';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('deduplicates by callback identity and event type', ({ document, globals }) => {
		const Event = globals('Event');
		const target = document.createElement('div');
		let calls = 0;
		const listener = (): void => {
			calls++;
		};
		target.addEventListener('probe', listener);
		target.addEventListener('probe', listener);
		target.addEventListener('other', listener);
		target.addEventListener('probe', null);
		target.dispatchEvent(new Event('probe'));
		expect(calls).toBe(1);
		target.dispatchEvent(new Event('other'));
		expect(calls).toBe(2);
		target.removeEventListener('probe', listener);
		target.removeEventListener('probe', listener);
		target.removeEventListener('probe', null);
		target.dispatchEvent(new Event('probe'));
		expect(calls).toBe(2);
	});

	context.test('deduplicates by type, callback and capture independently of once', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		const calls: string[] = [];
		const callback = (): number => calls.push('x');
		e.addEventListener('x', callback);
		e.addEventListener('x', callback, { once: true });
		const Event = fixture.globals('Event');
		e.dispatchEvent(new Event('x') as unknown as Event);
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(calls).toEqual(['x', 'x']);
		e.removeEventListener('x', callback, { capture: true });
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(calls.length).toBe(3);
		e.removeEventListener('x', callback);
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(calls.length).toBe(3);
	});

	context.test('ignores null listeners and matches event type case sensitively', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		let n = 0;
		Reflect.apply(e.addEventListener, e, ['x', null]);
		e.addEventListener('X', () => n++);
		const Event = fixture.globals('Event');
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(n).toBe(0);
		e.dispatchEvent(new Event('X') as unknown as Event);
		expect(n).toBe(1);
	});
}
