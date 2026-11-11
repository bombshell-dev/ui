import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}

	const { expect } = context.runner;

	context.test(
		'WPT ParentNode-querySelectorAll-svg-class.html: Selecting a svg element with a class selector',
		(fixture) => {
			const document = html(fixture, '<div class="test">\n</div>\n<svg class="test">\n</svg>');
			expect(document.querySelectorAll('svg.test').length).toBe(1);
		},
	);
}
