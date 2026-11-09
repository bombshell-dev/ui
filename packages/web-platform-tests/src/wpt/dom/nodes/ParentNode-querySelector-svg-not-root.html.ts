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
		'WPT ParentNode-querySelector-svg-not-root.html: svg:not(:root) in a HTML document',
		(fixture) => {
			const document = html(
				fixture,
				`<svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 3 2" id="the-svg">
  <rect width="1" height="2" x="0" fill="#008d46" />
  <rect width="1" height="2" x="1" fill="#ffffff" />
  <rect width="1" height="2" x="2" fill="#d2232c" />
</svg>`,
			);
			const svg = document.getElementById('the-svg');
			expect(svg).not.toBeNull();
			expect(document.querySelector('svg:not(:root)')).toBe(svg);
		},
	);
}
