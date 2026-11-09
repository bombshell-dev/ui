import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('removing a null event listener should succeed', ({ window }) => {
		expect(window.removeEventListener('x', null as unknown as EventListener, false)).toBe(
			undefined,
		);
		expect(window.removeEventListener('x', null as unknown as EventListener, true)).toBe(undefined);
		expect(window.removeEventListener('x', null as unknown as EventListener)).toBe(undefined);
	});
}
