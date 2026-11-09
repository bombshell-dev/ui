import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!doctype html>
<meta charset="utf-8">
<title>HTMLSelectElement.value</title>



<div id=log></div>

<select id=sel1>
  <option value=0></option>
  <option selected value=1></option>
</select>

<select id=sel2>
  <optgroup>
    <option value=0></option>
  </optgroup>
  <optgroup></optgroup>
  <optgroup>
    <option></option>
    <option value=1></option>
    <option selected value=2></option>
  </optgroup>
</select>

<select id=sel3>
  <option selected value=1></option>
</select>

<select id=sel4></select>


`;

		context.test(
			'options',
			({ document }) => {
				let select = document.getElementById('sel1') as HTMLSelectElement;
				expect(select.value).toBe('1');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'optgroups',
			({ document }) => {
				let select = document.getElementById('sel2') as HTMLSelectElement;
				expect(select.value).toBe('2');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'option is child of div',
			({ document }) => {
				let select = document.getElementById('sel3') as HTMLSelectElement;
				let option = select.options[0]!;
				let div = document.createElement('div');
				select.appendChild(div);
				div.appendChild(option);
				expect(select.value).toBe('1');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'no options',
			({ document }) => {
				let select = document.getElementById('sel4') as HTMLSelectElement;
				expect(select.value).toBe('');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
