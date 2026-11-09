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
		'WPT ParentNode-querySelector-is-not.html: querySelector with :is():not() combined',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3686 -->',
			);

			expect(document.querySelector(':is([a],b):not(.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,[b]):not(.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,b):not(.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,b):not([c])')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a):not([b],.c)')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,[b])')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is(a,[b]):first-child')!, 'does not throw').toBe(null);
			expect(document.querySelector(':is([b]):not(.c)')!, 'does not throw').toBe(null);
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
