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

	const attributeMarkup =
		'<div id="id"><span id="id-span-1"></span><span></span></div>' +
		'<div id="class"><span id="class-span-1" class="foo"></span><span id="class-span-2"></span></div>' +
		'<div id="hidden"><span id="hidden-span-1" hidden></span><span id="hidden-span-2"></span></div>' +
		'<div id="style"><span id="style-span-1" style="display:inline-block;"></span><span id="style-span-2"></span></div>' +
		'<div id="readonly"><input id="readonly-input-1" readonly><input id="readonly-input-2"></div>' +
		'<div id="width"><img id="width-img-1" width="200"><img id="width-img-2"></div>' +
		'<div id="height"><img id="height-img-1" height="200"><img id="height-img-2"></div>';

	for (const [index, attribute] of [
		'id',
		'class',
		'hidden',
		'style',
		'readonly',
		'width',
		'height',
	].entries()) {
		context.test(
			title('ParentNode-querySelector-attribute-change.html', `${attribute} attribute`),
			(fixture) => {
				const div = mount(fixture, attributeMarkup).children[index]!;
				const node1 = div.firstElementChild!,
					node2 = div.lastElementChild!;
				expect(div.querySelector(`[${attribute}]`), 'initial').toBe(node1);
				expect(div.querySelector(`:not([${attribute}])`), 'initial not').toBe(node2);
				node1.removeAttribute(attribute);
				expect(div.querySelector(`[${attribute}]`), 'change attribute').toBeNull();
				expect(div.querySelector(`:not([${attribute}])`), 'change attribute not').toBe(node1);
			},
		);
	}
}
