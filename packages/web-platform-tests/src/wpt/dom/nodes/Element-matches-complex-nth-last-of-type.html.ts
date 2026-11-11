import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'WPT Element-matches-complex-nth-last-of-type.html: element.matches() with complex :nth-last-of-type selector',
		({ document }) => {
			const div = document.createElement('div');
			div.innerHTML = '<div class="b"><div class="c"></div></div>';
			const c = div.querySelector('.c')!;
			expect(c.matches('.a:nth-last-of-type(1) .b .c')).toBe(false);
		},
	);
}
