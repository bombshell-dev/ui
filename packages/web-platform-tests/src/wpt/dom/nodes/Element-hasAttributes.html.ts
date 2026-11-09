import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	// XXX

	// XXX

	context.test(
		'element.hasAttributes() must return false when the element does not have attribute.',
		({ document }) => {
			let buttonElement = document.getElementsByTagName('button')[0]!;
			expect(
				buttonElement.hasAttributes(),
				'hasAttributes() on empty element must return false.',
			).toBe(false);

			let emptyDiv = document.createElement('div');
			expect(
				emptyDiv.hasAttributes(),
				'hasAttributes() on dynamically created empty element must return false.',
			).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html><button></button><div id="foo"></div><p data-foo=""></p>',
			},
		},
	);
	context.test(
		'element.hasAttributes() must return true when the element has attribute.',
		({ document }) => {
			let divWithId = document.getElementById('foo')!;
			expect(
				divWithId.hasAttributes(),
				'hasAttributes() on element with id attribute must return true.',
			).toBe(true);

			let divWithClass = document.createElement('div');
			divWithClass.setAttribute('class', 'foo');
			expect(
				divWithClass.hasAttributes(),
				'hasAttributes() on dynamically created element with class attribute must return true.',
			).toBe(true);

			let pWithCustomAttr = document.getElementsByTagName('p')[0]!;
			expect(
				pWithCustomAttr.hasAttributes(),
				'hasAttributes() on element with custom attribute must return true.',
			).toBe(true);

			let divWithCustomAttr = document.createElement('div');
			divWithCustomAttr.setAttribute('data-custom', 'foo');
			expect(
				divWithCustomAttr.hasAttributes(),
				'hasAttributes() on dynamically created element with custom attribute must return true.',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!doctype html><button></button><div id="foo"></div><p data-foo=""></p>',
			},
		},
	);
}
