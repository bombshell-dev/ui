import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function testGet(document: Document, attr: string, expected: string) {
		let d = document.createElement('div');
		d.setAttribute(attr, 'value');
		return d.dataset[expected] == 'value';
	}
	function matchesNothingInDataset(document: Document, attr: string) {
		let d = document.createElement('div');
		d.setAttribute(attr, 'value');

		if (!d.dataset) return false;

		let count = 0;
		for (let item in d.dataset) count++;
		return count == 0;
	}

	context.test(
		"Getting element.dataset['foo'] should return the value of element.getAttribute('data-foo')'",
		({ document }) => {
			expect(testGet(document, 'data-foo', 'foo')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['fooBar'] should return the value of element.getAttribute('data-foo-bar')'",
		({ document }) => {
			expect(testGet(document, 'data-foo-bar', 'fooBar')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['-'] should return the value of element.getAttribute('data--')'",
		({ document }) => {
			expect(testGet(document, 'data--', '-')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['Foo'] should return the value of element.getAttribute('data--foo')'",
		({ document }) => {
			expect(testGet(document, 'data--foo', 'Foo')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['-Foo'] should return the value of element.getAttribute('data---foo')'",
		({ document }) => {
			expect(testGet(document, 'data---foo', '-Foo')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['foo'] should return the value of element.getAttribute('data-Foo')'",
		({ document }) => {
			expect(testGet(document, 'data-Foo', 'foo')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset[''] should return the value of element.getAttribute('data-')'",
		({ document }) => {
			expect(testGet(document, 'data-', '')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['\xE0'] should return the value of element.getAttribute('data-\xE0')'",
		({ document }) => {
			expect(testGet(document, 'data-\xE0', '\xE0')).toBe(true);
		},
	);
	context.test(
		"Getting element.dataset['toString'] should return the value of element.getAttribute('data-to-string')'",
		({ document }) => {
			expect(testGet(document, 'data-to-string', 'toString')).toBe(true);
		},
	);
	context.test(
		'Tests that an attribute named dataFoo does not make an entry in the dataset DOMStringMap.',
		({ document }) => {
			expect(matchesNothingInDataset(document, 'dataFoo')).toBe(true);
		},
	);
}
