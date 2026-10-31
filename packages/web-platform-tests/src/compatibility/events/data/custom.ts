import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['CustomEvent'] as const;
export { requiredGlobals as globals };
export const spec = 'https://dom.spec.whatwg.org/#interface-customevent';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('retains detail identity and defaults omitted detail to null', ({ globals }) => {
		const CustomEvent = globals('CustomEvent');
		const detail = { answer: 42 };
		const event = new CustomEvent('MixedCase', {
			detail,
			bubbles: true,
			cancelable: true,
			composed: true,
		});
		expect(event.type).toBe('MixedCase');
		expect(event.detail).toBe(detail);
		expect(event.bubbles).toBe(true);
		expect(event.cancelable).toBe(true);
		expect(event.composed).toBe(true);
		const defaults = new CustomEvent('probe');
		expect(defaults.detail).toBeNull();
	});

	context.test('uses standard defaults for CustomEvent', (fixture) => {
		const Constructor = fixture.globals('CustomEvent') as unknown as typeof CustomEvent;
		const event = new Constructor('x');
		expect(event.type).toBe('x');
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
		expect(event.composed).toBe(false);
		expect(event.isTrusted).toBe(false);
		expect(event.detail).toBeNull();
	});

	context.test('preserves event constructor flags without implicit dispatch', (fixture) => {
		const Constructor = fixture.globals('CustomEvent') as unknown as typeof CustomEvent;
		const event = new Constructor('x', { bubbles: true, cancelable: true, composed: true });
		expect(event.target).toBeNull();
		expect(event.currentTarget).toBeNull();
		expect(event.eventPhase).toBe(0);
		expect(event.bubbles).toBe(true);
		expect(event.cancelable).toBe(true);
		expect(event.composed).toBe(true);
		event.preventDefault();
		expect(event.defaultPrevented).toBe(true);
	});
}
