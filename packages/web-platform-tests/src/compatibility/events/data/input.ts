import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['InputEvent'] as const;
export { requiredGlobals as globals };
export const spec = 'https://w3c.github.io/uievents/#interface-inputevent';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('initializes edit data independently of editing behavior', ({ globals }) => {
		const InputEvent = globals('InputEvent');
		const event = new InputEvent('beforeinput', {
			data: 'abc',
			inputType: 'insertText',
			isComposing: true,
			cancelable: true,
		});
		expect([event.data, event.inputType, event.isComposing, event.cancelable]).toEqual([
			'abc',
			'insertText',
			true,
			true,
		]);
		const defaults = new InputEvent('input');
		expect([defaults.data, defaults.inputType, defaults.isComposing]).toEqual([null, '', false]);
		expect(defaults.isTrusted).toBe(false);
	});

	context.test('uses standard defaults for InputEvent', (fixture) => {
		const Constructor = fixture.globals('InputEvent') as unknown as typeof InputEvent;
		const event = new Constructor('x');
		expect(event.type).toBe('x');
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
		expect(event.composed).toBe(false);
		expect(event.isTrusted).toBe(false);
		expect(event.data).toBeNull();
		expect(event.inputType).toBe('');
		expect(event.isComposing).toBe(false);
	});

	context.test('preserves event constructor flags without implicit dispatch', (fixture) => {
		const Constructor = fixture.globals('InputEvent') as unknown as typeof InputEvent;
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
