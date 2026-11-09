import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	context.test(
		title(
			'ParentNode-querySelector-host-pseudo-class.html',
			'Using :host pseudo-class selector in shadow DOM',
		),
		({ document, connect }) => {
			const section = document.createElement('section');
			section.id = 'test-container';
			connect(section);
			const article = document.createElement('article');
			const shadowSection = section.attachShadow({ mode: 'open' });
			shadowSection.appendChild(article);
			const normalQuery = shadowSection.querySelector('article');
			expect(normalQuery, 'Simple querySelector for article should find the element').toBe(article);
			const hostQuery = shadowSection.querySelector(':host > article');
			expect(hostQuery, 'querySelector with :host pseudo-class should find the element').toBe(
				article,
			);
		},
	);
}
