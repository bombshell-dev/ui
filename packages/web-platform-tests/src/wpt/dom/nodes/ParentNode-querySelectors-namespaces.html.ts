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
		'WPT ParentNode-querySelectors-namespaces.html: querySelectorAll must work with namespace attribute selectors on SVG',
		(fixture) => {
			const document = html(fixture, '<svg id="thesvg" xlink:href="foo"></svg>');
			const element = document.getElementById('thesvg');
			expect(document.querySelector('[*|href]')).toBe(element);
			expect(Array.from(document.querySelectorAll('[*|href]'))).toEqual([element]);
		},
	);
}
