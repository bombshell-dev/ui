import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"Mutating the style declaration doesn't remove the style attribute",
		({ document }) => {
			let el = document.getElementById('test')!;
			el.style.color = '';
			expect(el.hasAttribute('style')).toBe(true);

			el.removeAttribute('style');
			expect(el.hasAttribute('style')).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n\n\n\n\n<div id="test" style="color: red"></div>\n\n',
			},
		},
	);
}
