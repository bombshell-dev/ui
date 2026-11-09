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

	for (const name of [
		'querySelector with :scope',
		'querySelector with id and sibling',
		'querySelectorAll with :scope',
		'querySelectorAll with id and sibling',
	]) {
		context.test(title('ParentNode-querySelector-scope.html', name), (fixture) => {
			const div = mount(
				fixture,
				'<div><h1 id="test"></h1><p><span>hello</span></p></div>',
			).firstElementChild!;
			const p = div.children[1]!;
			if (name === 'querySelector with :scope') {
				expect(div.querySelector(':scope > p')).toBe(p);
				expect(div.querySelector(':scope > span')).toBeNull();
			} else if (name === 'querySelector with id and sibling') {
				expect(div.querySelector('#test + p')).toBe(p);
				expect(p.querySelector('#test + p')).toBeNull();
			} else if (name === 'querySelectorAll with :scope') {
				expect(Array.from(div.querySelectorAll(':scope > p'))).toEqual([p]);
				expect(Array.from(div.querySelectorAll(':scope > span'))).toEqual([]);
			} else {
				expect(Array.from(div.querySelectorAll('#test + p'))).toEqual([p]);
				expect(Array.from(p.querySelectorAll('#test + p'))).toEqual([]);
			}
		});
	}
}
