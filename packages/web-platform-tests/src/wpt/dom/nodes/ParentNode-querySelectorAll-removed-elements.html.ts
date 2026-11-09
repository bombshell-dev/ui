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
			'ParentNode-querySelectorAll-removed-elements.html',
			'querySelectorAll must not return removed elements',
		),
		(fixture) => {
			const container = mount(fixture, '<div id="container"></div>').firstElementChild!;
			const getIDs = (): string[] => [...container.querySelectorAll('a.test')].map((el) => el.id);
			container.innerHTML = '<a id="link-a" class="test">a link</a>';
			expect(getIDs(), 'Sanity check: initial setup').toEqual(['link-a']);
			container.innerHTML = '<a id="link-b" class="test"><img src="foo.jpg"></a>';
			expect(getIDs(), 'After replacement').toEqual(['link-b']);
			container.innerHTML = '<a id="link-a" class="test">a link</a>';
			expect(getIDs(), 'After changing back to the original HTML').toEqual(['link-a']);
		},
	);
}
