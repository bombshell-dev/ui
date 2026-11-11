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
		'WPT ParentNode-querySelector-matches.html: matches with ancestor ID and descendant type selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main .foo')!;
			expect(el.matches('#main p')).toBe(true);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches returns false for non-matching ID selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main .foo')!;
			expect(el.matches('#nonexistent')).toBe(false);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches with :not() pseudo-class',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main p:not(.foo)')!;
			expect(el.matches('#main p:not(.foo)')).toBe(true);
		},
	);

	context.test(
		'WPT ParentNode-querySelector-matches.html: matches with simple type selector',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="main">\n  <p class="foo">Foo</p>\n  <p>Bar</p>\n</div>',
			);

			const el = document.querySelector('#main .foo')!;
			expect(el.matches('p')).toBe(true);
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
