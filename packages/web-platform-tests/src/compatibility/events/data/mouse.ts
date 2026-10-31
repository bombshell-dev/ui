import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['MouseEvent'] as const;
export { requiredGlobals as globals };
export const spec = 'https://w3c.github.io/uievents/#interface-mouseevent';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'initializes mouse buttons, coordinates, modifiers, and relatedTarget',
		({ document, globals }) => {
			const MouseEvent = globals('MouseEvent');
			const relatedTarget = document.createElement('div');
			const event = new MouseEvent('mousedown', {
				button: 2,
				buttons: 3,
				clientX: 12,
				clientY: 13,
				screenX: 20,
				screenY: 21,
				ctrlKey: true,
				shiftKey: true,
				relatedTarget,
			});
			expect([
				event.button,
				event.buttons,
				event.clientX,
				event.clientY,
				event.screenX,
				event.screenY,
			]).toEqual([2, 3, 12, 13, 20, 21]);
			expect([event.ctrlKey, event.altKey, event.shiftKey, event.metaKey]).toEqual([
				true,
				false,
				true,
				false,
			]);
			expect(event.relatedTarget).toBe(relatedTarget);
			expect(event.isTrusted).toBe(false);
			const defaults = new MouseEvent('mousemove');
			expect(defaults.relatedTarget).toBeNull();
		},
	);

	context.test('uses standard defaults for MouseEvent', (fixture) => {
		const Constructor = fixture.globals('MouseEvent') as unknown as typeof MouseEvent;
		const event = new Constructor('x');
		expect(event.type).toBe('x');
		expect(event.bubbles).toBe(false);
		expect(event.cancelable).toBe(false);
		expect(event.composed).toBe(false);
		expect(event.isTrusted).toBe(false);
		expect(event.button).toBe(0);
		expect(event.buttons).toBe(0);
		expect(event.clientX).toBe(0);
		expect(event.ctrlKey).toBe(false);
		expect(event.relatedTarget).toBeNull();
	});

	context.test('preserves event constructor flags without implicit dispatch', (fixture) => {
		const Constructor = fixture.globals('MouseEvent') as unknown as typeof MouseEvent;
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
