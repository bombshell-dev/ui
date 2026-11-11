import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function listener(evt: Event) {
		evt.preventDefault();
		return false;
	}
	context.test(
		'Removing an event listener without explicit capture arg should succeed',
		({ EventTarget, Event }) => {
			const et = new EventTarget();
			et.addEventListener('x', listener, false);
			let event = new Event('x', { cancelable: true });
			let ret = et.dispatchEvent(event);
			expect(ret).toBe(false);

			et.removeEventListener('x', listener);
			event = new Event('x', { cancelable: true });
			ret = et.dispatchEvent(event);
			expect(ret).toBe(true);
		},
	);
}
