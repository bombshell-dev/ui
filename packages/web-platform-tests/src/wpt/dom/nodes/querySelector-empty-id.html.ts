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
		'WPT querySelector-empty-id.html: querySelector attribute matching empty id',
		(fixture) => {
			const document = prepare(
				fixture,
				'<div id="root">\n  <div id=""></div>\n  <div id></div>\n  <div></div>\n</div>',
			);
			const root = document.getElementById('root')!;

			expect(root.querySelectorAll('[id]').length).toBe(2);
			expect(root.querySelectorAll("[id='']").length).toBe(2);
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
