import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#focus-delegate';
export const requires = ['shadow.focus.retargeting'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('delegates host focus to an eligible shadow descendant', ({ document, connect }) => {
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open', delegatesFocus: true });
		const control = document.createElement('button');
		root.append(control);
		connect(host);
		host.focus();
		expect(root.delegatesFocus).toBe(true);
		expect(document.activeElement).toBe(host);
		expect(root.activeElement).toBe(control);
	});
}
