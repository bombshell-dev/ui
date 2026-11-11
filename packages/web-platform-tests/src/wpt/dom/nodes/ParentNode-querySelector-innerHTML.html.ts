import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	context.test(
		title(
			'ParentNode-querySelector-innerHTML.html',
			'querySelector matches nodes inserted by innerHTML',
		),
		({ document }) => {
			const div = document.createElement('div');
			expect(div.innerHTML, 'initial').toBe('');
			div.innerHTML = '<div id="inner-div"><span id="inner-span"></span></div>';
			const expectedDiv = div.firstElementChild!,
				expectedSpan = expectedDiv.firstElementChild!;
			expect(div.querySelector('div'), 'inner div').toBe(expectedDiv);
			expect(div.querySelector('span'), 'inner span').toBe(expectedSpan);
		},
	);
}
