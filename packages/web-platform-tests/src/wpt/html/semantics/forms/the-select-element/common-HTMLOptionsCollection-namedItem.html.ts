import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title id='title'>HTMLOptionsCollection</title>


</head>
<body>
<div id="log"></div>
<select id="selly">
  <option id="id1" name="name1">1</option>
  <option id="id2" name="name2">2</option>
  <option id="id3" name="name3">3</option>
  <option id="id4" name="name4">4</option>
  <option name="nameonly">nameonly</option>
  <option id="id3">duplicate ID</option>
  <option name="name4">duplicate name</option>
  <option id="mixed1">mixed ID</option>
  <option name="mixed1">mixed name</option>
</select>


</body>
</html>
`;

		context.test(
			'if only one item has a *name* or id value matching the parameter, return that object and stop',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				expect((selly.namedItem('nameonly') as HTMLOptionElement)['value']).toBe('nameonly');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'if only one item has a name or *id* value matching the parameter, return that object and stop',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				expect((selly.namedItem('id2') as HTMLOptionElement)['value']).toBe('2');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'if no item has a name or id value matching the parameter, return null and stop',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				expect(selly.namedItem('thisdoesnotexist') as HTMLOptionElement).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'if multiple items have a name or *id* value matching the parameter, return the first object and stop',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				expect((selly.namedItem('id3') as HTMLOptionElement)['value']).toBe('3');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'if multiple items have a *name* or id value matching the parameter, return the first object and stop',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				expect((selly.namedItem('name4') as HTMLOptionElement)['value']).toBe('4');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'if multiple items have a *name* or *id* value matching the parameter, return the first object and stop',
			({ document }) => {
				const selly = document.getElementById('selly') as HTMLSelectElement;

				expect((selly.namedItem('mixed1') as HTMLOptionElement)['value']).toBe('mixed ID');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
