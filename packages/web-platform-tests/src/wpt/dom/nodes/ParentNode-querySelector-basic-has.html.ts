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
		'WPT ParentNode-querySelector-basic-has.html: Basic :has() support in querySelector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3506 -->\n\n<p id="p-with-span">\n  <span>123</span>\n</p>\n<p></p>',
			);

			const expectedP = document.getElementById('p-with-span')!;
			expect(document.querySelector('p:has(span)')!).toBe(expectedP);
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
