import type { CompatibilityContext } from '../../../../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<meta charset=utf-8>
<title>Selector: pseudo-classes (:checked)</title>
<link rel="author" title="Denis Ah-Kang" href="mailto:denis@w3.org" id=link1>
<link rel=help href="https://html.spec.whatwg.org/multipage/#pseudo-classes" id=link2>



<div id="log"></div>
<select id=select1>
 <optgroup label="options" id=optgroup1>
  <option value="option1" id=option1 selected>option1
  <option value="option2" id=option2>option2
  <option value="option2" id=option3 checked>option3
</select>
<input type=checkbox id=checkbox1 checked>
<input type=checkbox id=checkbox2>
<input type=checkbox id=checkbox3 selected>
<input type=radio id=radio1 checked>
<input type=radio id=radio2>
<form>
  <p><input type=submit contextmenu=formmenu id="submitbutton"></p>
  <menu type=context id=formmenu>
    <!-- historical; these should *not* match -->
    <menuitem type=checkbox checked default id=menuitem1>
    <menuitem type=checkbox default id=menuitem2>
    <menuitem type=checkbox id=menuitem3>
    <menuitem type=radio checked id=menuitem4>
    <menuitem type=radio id=menuitem5>
  </menu>
</form>


`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"':checked' matches checked <input>s in checkbox and radio button states, selected <option>s",
		({ document }) => {
			const elements = document.querySelectorAll(':checked');
			const result: (HTMLElement | null)[] = [];
			['option1', 'checkbox1', 'radio1'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		"':checked' should no longer match <input>s whose type checkbox/radio has been removed",
		({ document }) => {
			document.getElementById('checkbox1')!.removeAttribute('type');
			document.getElementById('radio1')!.removeAttribute('type');

			const elements = document.querySelectorAll(':checked');
			const result: (HTMLElement | null)[] = [];
			['option1'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		"':checked' matches clicked checkbox and radio buttons",
		({ document }) => {
			document.getElementById('checkbox1')!.removeAttribute('type');
			document.getElementById('radio1')!.removeAttribute('type');
			(document.getElementById('option2') as HTMLOptionElement).selected =
				'selected' as unknown as boolean;
			document.getElementById('checkbox2')!.click();
			document.getElementById('radio2')!.click();

			const elements = document.querySelectorAll(':checked');
			const result: (HTMLElement | null)[] = [];
			['option2', 'checkbox2', 'radio2'].forEach(function (id: string) {
				result.push(document.getElementById(id));
			});
			{
				const actual = [...elements];
				const expected = result;
				expect(actual.length).toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index]).toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
