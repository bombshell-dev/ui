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
		title('ParentNode-querySelector-All-comma-selector.html', 'Basic comma-separated selector'),
		(fixture) => {
			const { document } = fixture;
			mount(fixture, '<h1>Hello world</h1><h2>Goodbye, world</h2>');
			expect(document.querySelectorAll('h1,h2').length).toBe(2);
		},
	);
	context.test(
		title(
			'ParentNode-querySelector-All-comma-selector.html',
			'Repeated identical querySelectorAll calls with repeated selectors should work on empty elements',
		),
		({ document }) => {
			const el = document.createElement('div');
			const selector = '.foo, .foo, .bar';
			const results1 = el.querySelectorAll(selector);
			expect(results1.length).toBe(0);
			const results2 = el.querySelectorAll(selector);
			expect(results2.length).toBe(0);
		},
	);
}
