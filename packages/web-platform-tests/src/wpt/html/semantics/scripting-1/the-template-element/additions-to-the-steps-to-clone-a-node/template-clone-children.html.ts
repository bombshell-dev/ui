import type { CompatibilityContext } from '../../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('Clone template node. Test call to cloneNode(true)', ({ document }) => {
		function newHTMLDocument() {
			return document.implementation.createHTMLDocument('Test Document');
		}

		let doc = newHTMLDocument();
		doc.body.innerHTML =
			'<template id="tmpl1">' +
			'<div id="div1">This is div inside template</div>' +
			'<div id="div2">This is another div inside template</div>' +
			'</template>';

		let template = doc.querySelector<HTMLTemplateElement>('#tmpl1')!;
		let copy = template.cloneNode(true) as HTMLTemplateElement;

		expect(copy.content, 'Template clone content attribute should not be undefined').not.toBe(
			undefined,
		);
		expect(copy.content, 'Template clone content attribute should not be null').not.toBe(null);

		expect(
			copy.content.childNodes.length,
			"Wrong number of template content's copy child nodes",
		).toBe(2);
		expect(copy.content.querySelector('#div1'), 'Template child node should be copied').not.toBe(
			null,
		);
		expect(copy.content.querySelector('#div2'), 'Template child node should be copied').not.toBe(
			null,
		);
	});
	context.test(
		'Clone template node. Test call to cloneNode() with the default parameter ' +
			'(false by default)',
		({ document }) => {
			function newHTMLDocument() {
				return document.implementation.createHTMLDocument('Test Document');
			}

			let doc = newHTMLDocument();
			doc.body.innerHTML =
				'<template id="tmpl1">' +
				'<div id="div1">This is div inside template</div>' +
				'<div id="div2">This is another div inside template</div>' +
				'</template>';

			let template = doc.querySelector<HTMLTemplateElement>('#tmpl1')!;
			let copy = template.cloneNode() as HTMLTemplateElement;

			expect(copy.content, 'Template clone content attribute should not be undefined').not.toBe(
				undefined,
			);
			expect(copy.content, 'Template clone content attribute should not be null').not.toBe(null);

			expect(
				copy.content.childNodes.length,
				"Wrong number of template content's copy child nodes",
			).toBe(0);
		},
	);
	context.test('Clone template node. Test call to cloneNode(false)', ({ document }) => {
		function newHTMLDocument() {
			return document.implementation.createHTMLDocument('Test Document');
		}

		let doc = newHTMLDocument();
		doc.body.innerHTML =
			'<template id="tmpl1">' +
			'<div id="div1">This is div inside template</div>' +
			'<div id="div2">This is another div inside template</div>' +
			'</template>';

		let template = doc.querySelector<HTMLTemplateElement>('#tmpl1')!;
		let copy = template.cloneNode(false) as HTMLTemplateElement;

		expect(copy.content, 'Template clone content attribute is undefined').not.toBe(undefined);
		expect(copy.content, 'Template clone content attribute is null').not.toBe(null);

		expect(
			copy.content.childNodes.length,
			"Wrong number of template content's copy child nodes",
		).toBe(0);
	});
}
