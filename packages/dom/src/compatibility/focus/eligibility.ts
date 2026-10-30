import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#focusable-area';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'focuses enabled controls and explicitly focusable HTML elements',
		({ document, connect }) => {
			const root = document.createElement('div');
			const button = document.createElement('button');
			const custom = document.createElement('div');
			custom.tabIndex = -1;
			root.append(button, custom);
			connect(root);
			button.focus();
			expect(document.activeElement).toBe(button);
			custom.focus();
			expect(document.activeElement).toBe(custom);
			button.setAttribute('disabled', '');
			button.focus();
			expect(document.activeElement).toBe(custom);
			const detached = document.createElement('button');
			detached.focus();
			expect(document.activeElement).toBe(custom);
		},
	);

	context.test(
		'rejects disabled and hidden controls but accepts negative tabindex focus',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				disabled = document.createElement('input'),
				hidden = document.createElement('input'),
				target = document.createElement('div');
			disabled.disabled = true;
			hidden.type = 'hidden';
			target.tabIndex = -1;
			p.append(disabled, hidden, target);
			fixture.connect(p as unknown as DOMElementContract);
			target.focus();
			expect(document.activeElement).toBe(target);
			disabled.focus();
			expect(document.activeElement).toBe(target);
			hidden.focus();
			expect(document.activeElement).toBe(target);
		},
	);
}
