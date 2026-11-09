import type { CompatibilityContext } from '../../context.ts';
import type { DOMEvent } from '../../contracts/events.ts';

const requiredGlobals = ['Event', 'ErrorEvent', 'window'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://html.spec.whatwg.org/multipage/webappapis.html#report-an-exception';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'reports listener exceptions as global error events without interrupting dispatch',
		({ document, globals, cleanup }) => {
			const Event = globals('Event');
			const ErrorEvent = globals('ErrorEvent');
			const window = globals('window');
			const target = document.createElement('div');
			const failure = new TypeError('compatibility listener failure');
			const errors: unknown[] = [];
			const listener = (event: DOMEvent): void => {
				if (event instanceof ErrorEvent && event.error === failure) {
					errors.push(event.error);
					event.preventDefault();
				}
			};
			window.addEventListener('error', listener);
			cleanup(() => {
				window.removeEventListener('error', listener);
			});
			let following = 0;
			target.addEventListener('probe', () => {
				throw failure;
			});
			target.addEventListener('probe', () => {
				following++;
			});
			expect(target.dispatchEvent(new Event('probe'))).toBe(true);
			expect(following).toBe(1);
			expect(errors.length).toBe(1);
			expect(errors[0]).toBe(failure);
		},
	);
}
