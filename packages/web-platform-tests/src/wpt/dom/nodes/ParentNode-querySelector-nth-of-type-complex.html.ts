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
		'WPT ParentNode-querySelector-nth-of-type-complex.html: querySelector with complex :nth-of-type selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3057 -->\n\n<div class="team-wrap">\n  <p>Sibling to ensure div.clearfix is :nth-of-type(1) among divs</p>\n  <div class="clearfix"> <!-- :nth-of-type(1) -->\n    <table>\n      <tbody>\n        <tr><td>Row 1 Data</td></tr>\n        <tr> <!-- :nth-of-type(2) -->\n          <td>\n            <span class="u-hyphenate" id="targetElement">Target Text</span>\n          </td>\n        </tr>\n      </tbody>\n    </table>\n  </div>\n  <div class="clearfix">\n    <!-- Another clearfix sibling -->\n  </div>\n</div>',
			);

			const selector = '.team-wrap .clearfix:nth-of-type(1) tr:nth-of-type(2) .u-hyphenate';
			const expectedElement = document.getElementById('targetElement')!;
			expect(document.querySelector(selector)!).toBe(expectedElement);
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
