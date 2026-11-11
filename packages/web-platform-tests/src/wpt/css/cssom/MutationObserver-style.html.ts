import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Updating style property with the same value does not trigger an observation callback',
		async ({ document, MutationObserver, cleanup }) => {
			let called = 0;
			const el = document.createElement('div');
			document.body.appendChild(el);
			const m = new MutationObserver(() => {
				called++;
			});
			cleanup(() => m.disconnect());
			m.observe(el, { attributes: true });
			el.style.height = '100px';
			await Promise.resolve();
			expect(called, 'times callback called').toBe(1);
			el.style.height = '100px';
			await Promise.resolve();
			expect(called, 'times callback called').toBe(1);
		},
	);
	context.test(
		'Updating cssText triggers an observation callback even if the value is the same',
		async ({ document, MutationObserver, cleanup }) => {
			let called = 0;
			const el = document.createElement('div');
			document.body.appendChild(el);
			const m = new MutationObserver(() => {
				called++;
			});
			cleanup(() => m.disconnect());
			m.observe(el, { attributes: true });
			el.style.cssText = 'height:100px';
			await Promise.resolve();
			expect(called, 'times callback called').toBe(1);
			el.style.cssText = 'height:100px';
			await Promise.resolve();
			expect(called, 'times callback called').toBe(2);
		},
	);
}
