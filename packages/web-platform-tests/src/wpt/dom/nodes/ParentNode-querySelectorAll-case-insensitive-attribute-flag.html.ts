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
		"WPT ParentNode-querySelectorAll-case-insensitive-attribute-flag.html: Case-insensitive attribute selector with lowercase flag 'i' should work",
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="testContainer">\n  <div class="CasE">Test div with CasE class</div>\n</div>',
			);

			const elements = document.querySelectorAll('div[class=CasE i]');
			expect(elements.length, "Selector with lowercase 'i' flag should match the element").toBe(1);
		},
	);

	context.test(
		"WPT ParentNode-querySelectorAll-case-insensitive-attribute-flag.html: Case-insensitive attribute selector with uppercase flag 'I' should work",
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="testContainer">\n  <div class="CasE">Test div with CasE class</div>\n</div>',
			);

			const elements = document.querySelectorAll('div[class=CasE I]');
			expect(elements.length, "Selector with uppercase 'I' flag should match the element").toBe(1);
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
