import type { CompatibilityContext } from '../../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'innerHTML of template element replaces all referenced by the content attribute',
		({ document }) => {
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}

			let doc = newHTMLDocument();
			let template = doc.createElement('template');

			let div1 = doc.createElement('div');
			div1.setAttribute('id', 'div1');
			template.content.appendChild(div1);

			expect(
				template.content.querySelector('#div1'),
				'Element should present in template content',
			).not.toBe(null);

			template.innerHTML = '<div id="div2"></div>';

			expect(
				template.content.querySelector('#div1'),
				'Template content should be replaced by innerHTML',
			).toBe(null);
			expect(
				template.content.querySelector('#div2'),
				'Element should present in template content',
			).not.toBe(null);
		},
	);
	context.test(
		'innerHTML of template element replaces all referenced by the content attribute. ' +
			'Test empty HTML string',
		({ document }) => {
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}

			let doc = newHTMLDocument();
			let template = doc.createElement('template');

			let div1 = doc.createElement('div');
			div1.setAttribute('id', 'div1');
			template.content.appendChild(div1);

			expect(
				template.content.querySelector('#div1'),
				'Element should present in template content',
			).not.toBe(null);

			template.innerHTML = '';

			expect(
				template.content.hasChildNodes(),
				'Template content should be removed by innerHTML',
			).toBe(false);
		},
	);
	context.test(
		'innerHTML of template element replaces all referenced by the content attribute. ' +
			'Test nested template',
		({ document }) => {
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}

			let doc = newHTMLDocument();
			let template = doc.createElement('template');
			let nestedTemplate = doc.createElement('template');

			template.content.appendChild(nestedTemplate);

			let div1 = doc.createElement('div');
			div1.setAttribute('id', 'div1');
			nestedTemplate.content.appendChild(div1);

			expect(
				nestedTemplate.content.querySelector('#div1'),
				'Element should present in template content',
			).not.toBe(null);

			nestedTemplate.innerHTML = '<div id="div2"></div>';

			expect(
				nestedTemplate.content.querySelector('#div1'),
				'Template content should be replaced by innerHTML',
			).toBe(null);
			expect(
				nestedTemplate.content.querySelector('#div2'),
				'Element should present in template content',
			).not.toBe(null);
		},
	);
}
