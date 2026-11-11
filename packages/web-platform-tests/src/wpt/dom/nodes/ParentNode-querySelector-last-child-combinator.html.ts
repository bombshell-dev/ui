import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function prepare({ document, connect }: DOMFixture, markup: string): Document {
		const root = document.createElement('div');
		root.innerHTML = markup;
		connect(root);
		return document;
	}

	const { expect } = context.runner;

	context.test(
		'WPT ParentNode-querySelector-last-child-combinator.html: div:last-child > span[title] should match',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/972 -->\n\n<div id="container">\n  <div><span title="title text">text</span></div>\n</div>',
			);

			const container = document.getElementById('container')!;
			const span = container.querySelector('div:last-child > span[title]')!;
			expect(span).not.toBe(null);
			expect(span.textContent).toBe('text');
		},
	);

	// 4.3.7 from https://drafts.csswg.org/css-syntax/#consume-escaped-code-point

	// - escape hex digit

	// - hex digit special replacement
	// 1. zero points

	// 2. surrogate points

	// 3. out of range points

	// - escape EOF

	// - escape anythong else

	// non edge cases

	// ident tests case from CSS tests of chromium source: https://goo.gl/3Cxdov
}
