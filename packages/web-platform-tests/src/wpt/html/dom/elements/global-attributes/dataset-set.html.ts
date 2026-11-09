import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	function testSet(document: Document, prop: string, expected: string) {
		let d = document.createElement('div');
		d.dataset[prop] = 'value';
		return d.getAttribute(expected) == 'value';
	}

	context.test(
		"Setting element.dataset['foo'] should also change the value of element.getAttribute('data-foo')",
		({ document }) => {
			expect(testSet(document, 'foo', 'data-foo')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset['fooBar'] should also change the value of element.getAttribute('data-foo-bar')",
		({ document }) => {
			expect(testSet(document, 'fooBar', 'data-foo-bar')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset['-'] should also change the value of element.getAttribute('data--')",
		({ document }) => {
			expect(testSet(document, '-', 'data--')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset['Foo'] should also change the value of element.getAttribute('data--foo')",
		({ document }) => {
			expect(testSet(document, 'Foo', 'data--foo')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset['-Foo'] should also change the value of element.getAttribute('data---foo')",
		({ document }) => {
			expect(testSet(document, '-Foo', 'data---foo')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset[''] should also change the value of element.getAttribute('data-')",
		({ document }) => {
			expect(testSet(document, '', 'data-')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset['\xE0'] should also change the value of element.getAttribute('data-\xE0')",
		({ document }) => {
			expect(testSet(document, '\xE0', 'data-\xE0')).toBe(true);
		},
	);
	context.test(
		"Setting element.dataset['-foo'] should throw a SYNTAX_ERR",
		({ document, window }) => {
			expect(function () {
				testSet(document, '-foo', 'dummy');
			}).toThrow(
				expect.objectContaining({
					name: 'SyntaxError',
					code: 12,
					constructor: window.DOMException,
				}),
			);
		},
	);
	context.test(
		"Setting element.dataset['foo\x20'] should throw an INVALID_CHARACTER_ERR",
		({ document, window }) => {
			expect(function () {
				testSet(document, 'foo\x20', 'dummy');
			}).toThrow(
				expect.objectContaining({
					name: 'InvalidCharacterError',
					code: 5,
					constructor: window.DOMException,
				}),
			);
		},
	);
	context.test("Setting element.dataset['\u037Efoo'] should not throw.", ({ document }) => {
		expect(testSet(document, '\u037Efoo', 'data-\u037Efoo')).toBe(true);
	});
	context.test(
		"Setting element.dataset['\u0BC6foo'] should also change the value of element.getAttribute('\u0BC6foo')",
		({ document }) => {
			expect(testSet(document, '\u0BC6foo', 'data-\u0BC6foo')).toBe(true);
		},
	);
}
