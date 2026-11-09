import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	function testDelete(document: Document, attr: string, prop: string) {
		let d = document.createElement('div');
		d.setAttribute(attr, 'value');
		delete d.dataset[prop];
		return d.hasAttribute(attr) === false && d.getAttribute(attr) != 'value';
	}
	function testDeleteNoAdd(document: Document, prop: string) {
		let d = document.createElement('div');
		delete d.dataset[prop];
		return true;
	}

	context.test(
		"Deleting element.dataset['foo'] should also remove an attribute with name 'data-foo' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data-foo', 'foo')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset['fooBar'] should also remove an attribute with name 'data-foo-bar' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data-foo-bar', 'fooBar')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset['-'] should also remove an attribute with name 'data--' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data--', '-')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset['Foo'] should also remove an attribute with name 'data--foo' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data--foo', 'Foo')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset['-foo'] should not remove an attribute with name 'data--foo' should it exist.",
		({ document }) => {
			let d = document.createElement('div');
			d.setAttribute('data--foo', 'value');
			expect(d.dataset['-foo']).toBe(undefined);
			expect('-foo' in d.dataset).toBe(false);
			delete d.dataset['-foo'];
			expect(d.hasAttribute('data--foo')).toBe(true);
			expect(d.getAttribute('data--foo')).toBe('value');
		},
	);
	context.test(
		"Deleting element.dataset['-Foo'] should also remove an attribute with name 'data---foo' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data---foo', '-Foo')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset[''] should also remove an attribute with name 'data-' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data-', '')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset['\xE0'] should also remove an attribute with name 'data-\xE0' should it exist.",
		({ document }) => {
			expect(testDelete(document, 'data-\xE0', '\xE0')).toBe(true);
		},
	);
	context.test(
		"Deleting element.dataset['foo'] should not throw if even if the element does now have an attribute with the name data-foo.",
		({ document }) => {
			expect(testDeleteNoAdd(document, 'foo')).toBe(true);
		},
	);
}
