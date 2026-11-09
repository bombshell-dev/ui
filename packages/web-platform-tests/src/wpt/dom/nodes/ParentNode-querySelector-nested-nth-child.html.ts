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
		'WPT ParentNode-querySelector-nested-nth-child.html: querySelector with nested :nth-child() without tag names',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3026 -->\n\n<main>\n  <div> <!-- :nth-child(1) of main -->\n    <div> <!-- :nth-child(1) of div -->\n      <p>\n        <a href="#" id="targetLink">link</a>\n      </p>\n    </div>\n  </div>\n</main>',
			);

			const selector = 'main > :nth-child(1) > :nth-child(1) a';
			const expectedLink = document.getElementById('targetLink')!;
			expect(document.querySelector(selector)!).toBe(expectedLink);
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
