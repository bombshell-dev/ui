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
			'ParentNode-querySelector-parent-context.html',
			'querySelector with ancestor context in selector',
		),
		(fixture) => {
			const container = mount(fixture, '<div id="container"></div>').firstElementChild!;
			container.innerHTML = '<div><section><span></span></section></div>';
			const section = container.firstElementChild!.firstElementChild!;
			const expectedSpan = section.firstElementChild!;
			expect(section.querySelector('div section span')).toBe(expectedSpan);
		},
	);
}
