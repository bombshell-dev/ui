import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';
const requiredGlobals = ['FocusEvent'] as const;
export { requiredGlobals as globals };
export const requires = ['shadow.events.retargeting'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'suppresses delivery when target and relatedTarget retarget to the same host',
		({ document, globals }) => {
			const FocusEvent = globals('FocusEvent');
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const first = document.createElement('button');
			const second = document.createElement('button');
			root.append(first, second);
			let inside = 0;
			let outside = 0;
			root.addEventListener('focusout', () => inside++);
			host.addEventListener('focusout', () => outside++);
			first.dispatchEvent(
				new FocusEvent('focusout', { bubbles: true, composed: true, relatedTarget: second }),
			);
			expect(inside).toBe(1);
			expect(outside).toBe(0);
		},
	);
}
