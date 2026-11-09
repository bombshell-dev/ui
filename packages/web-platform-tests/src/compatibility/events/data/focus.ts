import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['FocusEvent'] as const;
export { requiredGlobals as globals };
export const spec = 'https://w3c.github.io/uievents/#interface-focusevent';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('initializes relatedTarget as synthetic focus data', ({ document, globals }) => {
		const FocusEvent = globals('FocusEvent');
		const target = document.createElement('div');
		const event = new FocusEvent('focus', { relatedTarget: target });
		expect(event.relatedTarget).toBe(target);
		const defaults = new FocusEvent('blur');
		expect(defaults.relatedTarget).toBeNull();
		expect(event.isTrusted).toBe(false);
	});

	context.test('uses standard defaults for FocusEvent', (fixture) => {
		const Constructor = fixture.globals('FocusEvent') as unknown as typeof FocusEvent;
		const event = new Constructor('x');
		expect(event.type).toBe('x');
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
		expect(event.composed).toBe(false);
		expect(event.isTrusted).toBe(false);
		expect(event.relatedTarget).toBeNull();
	});

	context.test('preserves event constructor flags without implicit dispatch', (fixture) => {
		const Constructor = fixture.globals('FocusEvent') as unknown as typeof FocusEvent;
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
