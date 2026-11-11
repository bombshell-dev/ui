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
		'WPT ParentNode-querySelectorAll-svg-append.html: Sanity check with div',
		(fixture) => {
			const document = html(fixture, '<svg></svg><div>\n  <p>foo</p>\n</div>');
			const div = document.getElementsByTagName('div')[0]!;
			expect(div.querySelectorAll('div p').length).toBe(1);
		},
	);
	context.test(
		'WPT ParentNode-querySelectorAll-svg-append.html: Append child nodes to svg',
		(fixture) => {
			const document = html(fixture, '<svg></svg><div>\n  <p>foo</p>\n</div>');
			const svg = document.getElementsByTagName('svg')[0]!;
			const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			svg.append(g);
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			g.append(circle);
			expect(g.querySelectorAll('g circle').length).toBe(1);
			expect(g.querySelectorAll('g>circle').length).toBe(1);
			expect(g.querySelectorAll('circle').length).toBe(1);
		},
	);
}
