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
			'ParentNode-querySelectorAll-scope-colon-id-class.html',
			':scope child selector on element with colon-prefixed class',
		),
		(fixture) => {
			const container = mount(
				fixture,
				'<div class="sm:block" id="parentDiv"><span id="targetSpan"></span></div><div id=":r3:"></div>',
			);
			const div = container.firstElementChild!;
			const expectedSpan = div.firstElementChild!;
			const result = div.querySelectorAll(':scope > span');
			expect(Array.from(result)).toEqual([expectedSpan]);
		},
	);
	context.test(
		title(
			'ParentNode-querySelectorAll-scope-colon-id-class.html',
			':scope selector on element with colon-prefixed ID',
		),
		(fixture) => {
			const container = mount(
				fixture,
				'<div class="sm:block" id="parentDiv"><span id="targetSpan"></span></div><div id=":r3:"></div>',
			);
			const div = container.children[1]!;
			const result = div.querySelector(':scope');
			expect(result).toBeNull();
		},
	);
}
