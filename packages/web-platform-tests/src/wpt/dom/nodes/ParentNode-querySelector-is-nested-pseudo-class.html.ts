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
		'WPT ParentNode-querySelector-is-nested-pseudo-class.html: Simple nested :is selector should match all inputs and buttons',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3432 -->\n\n<div id="container">\n  <button id="button1">Button 1</button>\n  <input id="input1" type="text">\n  <input id="input2" type="submit" value="Submit">\n  <button id="button2" type="submit">Button 2</button>\n  <button id="button3" disabled>Button 3</button>\n</div>',
			);

			const elements = document.querySelectorAll(':is(:is(input), button)');
			const elementIds = Array.from(elements).map((el) => el.id);

			const expectedIds = ['button1', 'input1', 'input2', 'button2', 'button3'];
			arrayEquals(elementIds, { expected: expectedIds });
		},
	);

	context.test(
		'WPT ParentNode-querySelector-is-nested-pseudo-class.html: Complex nested :is selector with attribute and :not selectors should work',
		(fixture) => {
			const document = prepare(
				fixture,
				'<!-- Regression test for https://github.com/jsdom/jsdom/issues/3432 -->\n\n<div id="container">\n  <button id="button1">Button 1</button>\n  <input id="input1" type="text">\n  <input id="input2" type="submit" value="Submit">\n  <button id="button2" type="submit">Button 2</button>\n  <button id="button3" disabled>Button 3</button>\n</div>',
			);

			const selector = ':is(:is(button, input)[type=submit], button:not([type])):not([disabled])';
			const elements = document.querySelectorAll(selector);
			const elementIds = Array.from(elements).map((el) => el.id);

			const expectedIds = ['button1', 'input2', 'button2'];
			arrayEquals(elementIds, { expected: expectedIds });
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
