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
		'querySelector stringifies Array argument via toString()',
		'querySelectorAll stringifies Array argument via toString()',
		'querySelector stringifies object with custom toString()',
	]) {
		context.test(
			title('ParentNode-querySelector-argument-stringification.html', name),
			(fixture) => {
				const container = mount(
					fixture,
					'<div id="container"><strong>bold</strong><em>italic 1</em><em>italic 2</em><p>paragraph</p></div>',
				).firstElementChild!;
				if (name.startsWith('querySelectorAll')) {
					const results = container.querySelectorAll(['strong', 'em'] as unknown as string);
					expect(
						results.length,
						"Array.toString() produces 'strong,em' matching both element types",
					).toBe(3);
				} else if (name.includes('Array')) {
					const result = container.querySelector(['strong'] as unknown as string);
					expect(result!.textContent).toBe('bold');
				} else {
					const result = container.querySelector({
						toString() {
							return 'p';
						},
					} as unknown as string);
					expect(result!.textContent).toBe('paragraph');
				}
			},
		);
	}
}
