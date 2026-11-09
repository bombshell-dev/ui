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

	for (const [name, selector, isSVG, nextClass] of [
		['svg simple class', '.a', true, 'b'],
		['svg compound class', 'g.a', true, 'b'],
		['svg complex class', 'svg g.a', true, 'b'],
		['html simple class', '.one', false, 'b'],
		['html compound class', 'span.one', false, 'two'],
		['html complex class', 'div span.one', false, 'two'],
	] as const) {
		context.test(title('ParentNode-querySelector-class-change.html', name), (fixture) => {
			const { document } = fixture;
			const container = mount(
				fixture,
				'<svg id="svg"><g id="g" class="a" /></svg><div id="div"><span id="span" class="one"></span></div>',
			);
			const node = container.children[isSVG ? 0 : 1]!.firstElementChild!;
			fixture.cleanup(() => {
				if (isSVG) node.setAttributeNS(null, 'class', 'a');
				else node.setAttribute('class', 'one');
			});
			expect(document.querySelector(selector), 'initial').toBe(node);
			if (isSVG) node.setAttributeNS(null, 'class', nextClass);
			else node.setAttribute('class', nextClass);
			expect(
				document.querySelector(selector),
				name === 'html simple class' ? 'querySelectorchange class' : 'change class',
			).toBeNull();
		});
	}
}
