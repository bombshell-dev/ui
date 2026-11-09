import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function prepare({ document, connect }: DOMFixture, markup: string): Document {
		const root = document.createElement('div');
		root.innerHTML = markup;
		connect(root);
		return document;
	}

	const { expect } = context.runner;

	function syntaxError({ DOMException }: DOMFixture, operation: () => unknown): void {
		let caught: unknown;
		try {
			operation();
		} catch (error) {
			caught = error;
		}
		expect(caught).toBeInstanceOf(DOMException);
		expect(caught).toMatchObject({ name: 'SyntaxError', code: 12 });
	}

	context.test(
		'WPT ParentNode-querySelector-invalid-comment-like.html: querySelector throws SyntaxError for comment-like selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1214 -->',
			);

			const selector =
				' //MAIN MENU - (used to keep mobile menu options hidden) // #tncms-region-nav-main-nav-right-nav';

			syntaxError(fixture, () => document.querySelector(selector)!);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-invalid-comment-like.html: querySelectorAll throws SyntaxError for comment-like selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1214 -->',
			);

			const selector =
				' //MAIN MENU - (used to keep mobile menu options hidden) // #tncms-region-nav-main-nav-right-nav';

			syntaxError(fixture, () => document.querySelectorAll(selector));
		},
	);

	context.test(
		'WPT ParentNode-querySelector-invalid-comment-like.html: matches throws SyntaxError for comment-like selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/1214 -->',
			);

			const selector =
				' //MAIN MENU - (used to keep mobile menu options hidden) // #tncms-region-nav-main-nav-right-nav';

			syntaxError(fixture, () => document.body.matches(selector));
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
