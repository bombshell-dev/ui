import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<title>form.elements: parsing</title>





<div id="log"></div>
<div id="test">
<form id=form>
<table>
<tr>
<td><input type="radio" name="radio1" id="r1" value=1></td>
<td><input type="radio" name="radio2" id="r2" value=2></td>
<input type="radio"  name="radio0" id="r0" value=0>
</tr>
</table>
</form>
</div>

`;

		context.test(
			'form.elements should work correctly in the face of table syntax errors',
			({ document }) => {
				let form = document.getElementById('form') as HTMLFormElement;
				expect(form.elements).toHaveLength(3);
				expect(form.elements[0]).toBe(document.getElementById('r0'));
				expect(form.elements[1]).toBe(document.getElementById('r1'));
				expect(form.elements[2]).toBe(document.getElementById('r2'));
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
