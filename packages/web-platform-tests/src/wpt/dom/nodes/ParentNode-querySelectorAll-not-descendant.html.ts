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
		'WPT ParentNode-querySelectorAll-not-descendant.html: querySelectorAll with :not() pseudo-class and descendant selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3340 -->\n\n<div id="container">\n  <p id="p1">\n    <table>\n      <tbody>\n        <tr>\n          <td>\n            <p id="p2"></p>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </p>\n  <p id="p3"></p>\n</div>',
			);

			const container = document.getElementById('container')!;
			const result = container.querySelectorAll('p:not(table p)');

			// Browsers parse the invalid HTML `<p><table>...</table></p><p>`
			// such that the first <p> is closed before the <table>,
			// and the closing </p> tag creates a *new* empty <p> element after the table.
			// Thus, the query should match p#p1, the empty p after the table, and p#p3.
			const resultIDs = Array.from(result, (el) => el.id);
			arrayEquals(resultIDs, { expected: ['p1', '', 'p3'] });
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
