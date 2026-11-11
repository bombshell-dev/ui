import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content =
			'<!DOCTYPE html>\n<title>form.elements: matches</title>\n\n\n\n\n<div id="log"></div>\n<div id="test">\n<form id="form">\n<input type="image">\n</form>\n</div>\n\n';

		context.test(
			'input type=image should not be present in the form.elements collection',
			({ document }) => {
				expect((document.getElementById('form') as HTMLFormElement).elements.length).toBe(0);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'form.elements should include elements whose name starts with a number',
			({ document }) => {
				let form = document.getElementById('form') as HTMLFormElement;
				let i = document.createElement('input');
				i.name = '2';
				form.appendChild(i);
				let j = document.createElement('input');
				j.name = '03';
				form.appendChild(j);
				expect(form.elements[-1], '[-1]').toBe(undefined);
				expect(form.elements['-1'], '["-1"]').toBe(undefined);
				expect(form.elements[0], '[0]').toBe(i);
				expect(form.elements['0'], '["0"]').toBe(i);
				expect(form.elements[1], '[1]').toBe(j);
				expect(form.elements['1'], '["1"]').toBe(j);
				expect(form.elements[2], '[2]').toBe(undefined);
				expect(form.elements['2'], '["2"]').toBe(undefined);
				expect(form.elements[3], '[03]').toBe(undefined);
				expect((form.elements as unknown as Record<string, Element>)['03'], '["03"]').toBe(j);
				expect(form.elements.item(-1), 'item(-1)').toBe(null);
				expect(form.elements.item(0), 'item(0)').toBe(i);
				expect(form.elements.item(1), 'item(1)').toBe(j);
				expect(form.elements.item(2), 'item(2)').toBe(null);
				expect(form.elements.namedItem('2'), 'namedItem("2")').toBe(i);
				expect(form.elements.namedItem('03'), 'namedItem("03")').toBe(j);
				expect(form.elements.namedItem('3'), 'namedItem("3")').toBe(null);
				expect(form.elements).toHaveLength(2);
				expect(form.elements[0]).toBe(i);
				expect(form.elements[1]).toBe(j);
				form.removeChild(i);
				form.removeChild(j);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
