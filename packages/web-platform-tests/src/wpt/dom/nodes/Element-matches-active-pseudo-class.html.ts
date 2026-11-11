import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}

	const { expect } = context.runner;

	for (const [id, title] of [
		['test', 'Regular div should not match :active by default'],
		['button', 'Button should not match :active by default'],
		['link', 'Link should not match :active by default'],
	] as const) {
		context.test(`WPT Element-matches-active-pseudo-class.html: ${title}`, (fixture) => {
			const document = html(
				fixture,
				'<div id="test">Test element</div>\n<button id="button">Button element</button>\n<a id="link" href="#">Link element</a>',
			);
			expect(document.getElementById(id)!.matches(':active')).toBe(false);
		});
	}
	context.test(
		'WPT Element-matches-active-pseudo-class.html: No elements should match :active by default via querySelectorAll',
		(fixture) => {
			const document = html(
				fixture,
				'<div id="test">Test element</div>\n<button id="button">Button element</button>\n<a id="link" href="#">Link element</a>',
			);
			expect(document.querySelectorAll(':active').length).toBe(0);
		},
	);
}
