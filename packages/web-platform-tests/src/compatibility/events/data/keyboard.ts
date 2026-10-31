import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['KeyboardEvent'] as const;
export { requiredGlobals as globals };
export const spec = 'https://w3c.github.io/uievents/#interface-keyboardevent';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'initializes keyboard data and modifier queries without trusted input',
		({ globals }) => {
			const KeyboardEvent = globals('KeyboardEvent');
			const event = new KeyboardEvent('keydown', {
				key: 'A',
				code: 'KeyA',
				location: 1,
				repeat: true,
				isComposing: true,
				ctrlKey: true,
				altKey: false,
				shiftKey: true,
				metaKey: false,
			});
			expect([event.key, event.code, event.location, event.repeat, event.isComposing]).toEqual([
				'A',
				'KeyA',
				1,
				true,
				true,
			]);
			expect([event.ctrlKey, event.altKey, event.shiftKey, event.metaKey]).toEqual([
				true,
				false,
				true,
				false,
			]);
			expect(
				['Control', 'Alt', 'Shift', 'Meta', 'Unrecognized'].map((name) =>
					event.getModifierState(name),
				),
			).toEqual([true, false, true, false, false]);
			expect(event.isTrusted).toBe(false);
			const defaults = new KeyboardEvent('keyup');
			expect([
				defaults.key,
				defaults.code,
				defaults.location,
				defaults.repeat,
				defaults.isComposing,
			]).toEqual(['', '', 0, false, false]);
		},
	);

	context.test('uses standard defaults for KeyboardEvent', (fixture) => {
		const Constructor = fixture.globals('KeyboardEvent') as unknown as typeof KeyboardEvent;
		const event = new Constructor('x');
		expect(event.type).toBe('x');
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
		expect(event.composed).toBe(false);
		expect(event.isTrusted).toBe(false);
		expect(event.key).toBe('');
		expect(event.code).toBe('');
		expect(event.location).toBe(0);
		expect(event.repeat).toBe(false);
		expect(event.ctrlKey).toBe(false);
		expect(event.getModifierState('Shift')).toBe(false);
	});

	context.test('preserves event constructor flags without implicit dispatch', (fixture) => {
		const Constructor = fixture.globals('KeyboardEvent') as unknown as typeof KeyboardEvent;
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
