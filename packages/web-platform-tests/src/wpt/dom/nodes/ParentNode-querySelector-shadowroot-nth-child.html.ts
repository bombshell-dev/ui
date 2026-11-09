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
			'ParentNode-querySelector-shadowroot-nth-child.html',
			'div:nth-child(2) should select #first when preceded by a style inside shadow root',
		),
		(fixture) => {
			const container = mount(
				fixture,
				'<style id="zero"></style><div id="shadowRootContainer"></div><div id="first"><button>hello</button></div>',
			);
			const hostElement = container.children[1]!;
			const shadowRoot = hostElement.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML =
				'<style id="zero"></style><div id="first"><button>hello</button></div><div id="second"></div><nav id="third"></nav>';
			const el = shadowRoot.querySelector('div:nth-child(2)');
			expect(el!.id).toBe('first');
		},
	);
}
