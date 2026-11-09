import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}

	const { expect } = context.runner;

	for (const selector of ['#null', '.null']) {
		context.test(
			`WPT Element-closest-null-selectors.html: element.closest('${selector}') should return null`,
			(fixture) => {
				const document = html(fixture, '<p id="testP">Some text</p>');
				expect(document.getElementById('testP')!.closest(selector)).toBeNull();
			},
		);
	}
}
