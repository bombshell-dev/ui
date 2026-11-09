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

	for (const [name, selector, fromDocument] of [
		['Query from document', '.root table tbody tr', true],
		['Query without root class', 'table tbody tr', false],
		['Query with root class', '.root table tbody tr', false],
	] as const) {
		context.test(title('Element-querySelectorAll-context-element.html', name), (fixture) => {
			const { document } = fixture;
			const container = mount(
				fixture,
				'<div id="test-container"><div class="root" id="root"><table><tbody><tr id="row"></tr></tbody></table></div></div>',
			);
			const root = container.firstElementChild!.firstElementChild!;
			const target = root.firstElementChild!.firstElementChild!.firstElementChild!;
			expect(Array.from((fromDocument ? document : root).querySelectorAll(selector))).toEqual([
				target,
			]);
		});
	}
}
