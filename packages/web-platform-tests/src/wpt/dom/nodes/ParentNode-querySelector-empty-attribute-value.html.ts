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
		"WPT ParentNode-querySelector-empty-attribute-value.html: [title=''] matches element with empty title attribute",
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1163 -->\n\n<div id="container">\n  <div></div>\n  <div title="">has empty title</div>\n  <div title="yes">has non-empty title</div>\n</div>',
			);

			const container = document.getElementById('container')!;
			expect(container.querySelectorAll("div[title='']").length).toBe(1);
		},
	);

	context.test(
		"WPT ParentNode-querySelector-empty-attribute-value.html: Compound [title][title=''] matches element with empty title attribute",
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1163 -->\n\n<div id="container">\n  <div></div>\n  <div title="">has empty title</div>\n  <div title="yes">has non-empty title</div>\n</div>',
			);

			const container = document.getElementById('container')!;
			expect(container.querySelectorAll("div[title][title='']").length).toBe(1);
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
