import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('Adding a null event listener should succeed', ({ EventTarget }) => {
		const et = new EventTarget();
		expect(et.addEventListener('x', null as unknown as EventListener, false)).toBe(undefined);
		expect(et.addEventListener('x', null as unknown as EventListener, true)).toBe(undefined);
		expect(et.addEventListener('x', null as unknown as EventListener)).toBe(undefined);
	});
}
