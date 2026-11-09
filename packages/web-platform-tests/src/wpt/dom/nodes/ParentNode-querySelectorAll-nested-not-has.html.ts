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
		'WPT ParentNode-querySelectorAll-nested-not-has.html: querySelectorAll with :not(:has(..))',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3774 -->\n\n<dl>\n  <dt class="a">A:</dt>\n  <dd class="a" id="dd-a">A</dd>\n  <dt class="b">B:</dt>\n  <dd class="b" id="dd-b">\n    B\n    <dl>\n      <dt class="c">C:</dt>\n      <dd class="c" id="dd-c">C</dd>\n      <dt class="d">D:</dt>\n      <dd class="d" id="dd-d">D</dd>\n    </dl>\n  </dd>\n  <dt class="e">E:</dt>\n  <dd class="e" id="dd-e">E</dd>\n</dl>',
			);

			const selector1 = 'dd:not(:has(dd))';
			const selector2 = 'dd:not(dd:has(dd))';
			const expectedElements = [
				document.getElementById('dd-a')!,
				document.getElementById('dd-c')!,
				document.getElementById('dd-d')!,
				document.getElementById('dd-e')!,
			];

			const result1 = document.querySelectorAll(selector1);
			arrayEquals(result1, { expected: expectedElements, message: selector1 });

			const result2 = document.querySelectorAll(selector2);
			arrayEquals(result2, { expected: expectedElements, message: selector2 });
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
