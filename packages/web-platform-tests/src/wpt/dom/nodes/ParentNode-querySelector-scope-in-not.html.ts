import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}
	function mount({ document, connect }: DOMFixture, markup: string): HTMLElement {
		const container = document.createElement('main');
		container.innerHTML = markup;
		connect(container);
		return container;
	}

	const { expect } = context.runner;

	context.test(
		title(
			'ParentNode-querySelector-scope-in-not.html',
			':scope nested in :not should select one element per [data-main] scope',
		),
		(fixture) => {
			const { document } = fixture;
			mount(
				fixture,
				'<div id="fixture"><div data-main><div data-item><div data-side><div data-main><div data-item><div data-side></div></div></div></div></div></div></div>',
			);
			const mainAttribute = 'data-main',
				itemAttribute = 'data-item',
				sideAttribute = 'data-side';
			const result = [];
			const foundElements = document.querySelectorAll(`[${mainAttribute}]`);
			for (const element of foundElements) result.push(element);
			for (const element of result) {
				const selector = `:scope [${sideAttribute}]:not(:scope [${itemAttribute}] [${itemAttribute}] [${sideAttribute}])`;
				const results = element.querySelectorAll(selector);
				expect(results.length).toBe(1);
			}
		},
	);
}
