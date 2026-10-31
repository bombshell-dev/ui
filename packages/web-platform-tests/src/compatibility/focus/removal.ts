import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/infrastructure.html#dom-trees';
export const requires = ['focus.eligibility'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'removing a focused node clears focus without firing blur',
		({ document, connect }) => {
			const root = document.createElement('div');
			const button = document.createElement('button');
			root.append(button);
			connect(root);
			button.focus();
			let blurred = 0;
			button.addEventListener('blur', () => blurred++);
			button.remove();
			expect(document.activeElement).not.toBe(button);
			expect(blurred).toBe(0);
			root.append(button);
			expect(document.activeElement).not.toBe(button);
		},
	);

	context.test('removing an unrelated subtree preserves the focused element', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('input'),
			other = document.createElement('div');
		p.append(e, other);
		fixture.connect(p as unknown as DOMElementContract);
		e.focus();
		other.remove();
		expect(document.activeElement).toBe(e);
	});
}
