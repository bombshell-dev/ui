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
		'WPT querySelector-id-nth-child.html: querySelector matching #id + constant nth-child()',
		(fixture) => {
			const document = prepare(fixture, '<div>\n  <div id="target"></div>\n</div>');
			const target = document.getElementById('target')!;

			expect(document.querySelector('#target:nth-child(1)')!).toBe(target);
			expect(document.querySelector('#target:nth-child(4)')!).toBe(null);
		},
	);

	context.test(
		'WPT querySelector-id-nth-child.html: querySelectorAll matching #id + constant nth-child()',
		(fixture) => {
			const document = prepare(fixture, '<div>\n  <div id="target"></div>\n</div>');

			expect(document.querySelectorAll('#target:nth-child(1)').length).toBe(1);
			expect(document.querySelectorAll('#target:nth-child(4)').length).toBe(0);
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
