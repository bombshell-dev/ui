import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function prepare({ document, connect }: DOMFixture, markup: string): Document {
		const root = document.createElement('div');
		root.innerHTML = markup;
		connect(root);
		return document;
	}

	const { expect } = context.runner;
	function arrayEquals(
		actual: ArrayLike<unknown>,
		options: { expected: ArrayLike<unknown>; message?: string },
	): void {
		expect(actual.length, options.message).toBe(options.expected.length);
		for (let i = 0; i < actual.length; i++)
			expect(actual[i], options.message).toBe(options.expected[i]);
	}

	context.test(
		'WPT ParentNode-querySelectors-space-and-dash-attribute-value.html: querySelector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/2542 -->\n\n<a title="test with - dash and space" id="testme">Test One</a>',
			);

			const el = document.getElementById('testme')!;

			expect(document.querySelector("a[title='test with - dash and space']")!).toBe(el);
		},
	);

	context.test(
		'WPT ParentNode-querySelectors-space-and-dash-attribute-value.html: querySelectorAll',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/2542 -->\n\n<a title="test with - dash and space" id="testme">Test One</a>',
			);

			const el = document.getElementById('testme')!;

			arrayEquals(document.querySelectorAll("a[title='test with - dash and space']"), {
				expected: [el],
			});
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
