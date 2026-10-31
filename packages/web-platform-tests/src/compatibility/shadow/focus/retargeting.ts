import type { CompatibilityContext } from '../../context.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/interaction.html#dom-documentorshadowroot-activeelement';
export const requires = ['shadow.roots.attachment', 'focus.eligibility'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'exposes the host as document focus and the control as shadow focus',
		({ document, connect }) => {
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const control = document.createElement('button');
			root.append(control);
			connect(host);
			control.focus();
			expect(document.activeElement).toBe(host);
			expect(root.activeElement).toBe(control);
			control.blur();
			expect(root.activeElement).toBeNull();
		},
	);
}
