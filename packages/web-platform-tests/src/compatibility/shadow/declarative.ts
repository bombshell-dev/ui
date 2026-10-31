import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inhead';
export const requires = ['shadow.roots.attachment', 'parsing.fragments'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('constructs declarative roots beneath newly parsed hosts', ({ document }) => {
		const container = document.createElement('div');
		container.setHTMLUnsafe(
			'<section><template shadowrootmode="open"><span>shadow</span></template><b>light</b></section>',
		);
		const host = container.firstElementChild;
		if (!host) return expect.fail('Parsed host expected');
		expect(host.shadowRoot?.textContent).toBe('shadow');
		expect(host.shadowRoot?.host).toBe(host);
		expect(host.childNodes.length).toBe(1);
		expect(host.firstChild?.textContent).toBe('light');
	});
	context.test('does not attach a root to the fragment context element', ({ document }) => {
		const host = document.createElement('div');
		host.setHTMLUnsafe('<template shadowrootmode="open">shadow</template>light');
		expect(host.shadowRoot).toBeNull();
		expect(host.firstElementChild?.localName).toBe('template');
	});
}
