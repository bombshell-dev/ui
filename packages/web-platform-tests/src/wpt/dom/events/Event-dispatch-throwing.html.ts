import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Throwing in event listener with a single listeners',
		({ document, window, Event, cleanup, step }) => {
			const previousOnError = window.onerror;
			const allowUncaughtException = (event: ErrorEvent) => event.preventDefault();
			window.addEventListener('error', allowUncaughtException);
			cleanup(() => {
				window.onerror = previousOnError;
				window.removeEventListener('error', allowUncaughtException);
			});

			let errorEvents = 0;
			window.onerror = step(function (e: string | Event) {
				expect(typeof e).toBe('string');
				++errorEvents;
			});

			let element = document.createElement('div');

			element.addEventListener('click', function () {
				throw new Error('Error from only listener');
			});

			element.dispatchEvent(new Event('click'));

			expect(errorEvents).toBe(1);
		},
	);
	context.test(
		'Throwing in event listener with multiple listeners',
		({ document, window, Event, cleanup, step }) => {
			const previousOnError = window.onerror;
			const allowUncaughtException = (event: ErrorEvent) => event.preventDefault();
			window.addEventListener('error', allowUncaughtException);
			cleanup(() => {
				window.onerror = previousOnError;
				window.removeEventListener('error', allowUncaughtException);
			});

			let errorEvents = 0;
			window.onerror = step(function (e: string | Event) {
				expect(typeof e).toBe('string');
				++errorEvents;
			});

			let element = document.createElement('div');

			let secondCalled = false;

			element.addEventListener('click', function () {
				throw new Error('Error from first listener');
			});
			element.addEventListener(
				'click',
				step(function () {
					secondCalled = true;
				}),
				false,
			);

			element.dispatchEvent(new Event('click'));

			expect(errorEvents).toBe(1);
			expect(secondCalled).toBe(true);
		},
	);
}
