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
		'WPT ParentNode-querySelector-nested.html: querySelector on multi-level query selecting',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/#3928 -->\n\n<div>\n  <span id="span1">Actions</span>\n  <ul>\n    <li>\n      <a href="/">\n        <span id="span2">Link</span>\n      </a>\n    </li>\n  </ul>\n</div>',
			);

			const target = document.getElementById('span2')!;
			const anchor = document.querySelector('a')!;
			const span = anchor.querySelector('span')!;
			expect(span).toBe(target);
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
