import type { CompatibilityContext } from '../../../../../shared/context.ts';

const markup2 = `<!DOCTYPE html>
<meta charset=utf-8>
<title>Selector: pseudo-classes (:disabled)</title>
<link rel="author" title="Denis Ah-Kang" href="mailto:denis@w3.org" id=link1>
<link rel=help href="https://html.spec.whatwg.org/multipage/#pseudo-classes" id=link2>



<style>
  #input4 {display:none;}
</style>
<div id="log"></div>
<button id=button1 type=submit>button1</button>
<button id=button2 disabled>button2</button>
<input id=input1>
<input id=input2 disabled>
<input id=input3 readonly>
<input id=input4>
<select id=select1>
 <optgroup label="options" id=optgroup1>
  <option value="option1" id=option1 selected>option1
</select>
<select disabled id=select2>
 <optgroup label="options" disabled id=optgroup2>
  <option value="option2" disabled id=option2>option2
</select>
<textarea id=textarea1>textarea1</textarea>
<textarea disabled id=textarea2>textarea2</textarea>
<fieldset id=fieldset1></fieldset>
<fieldset disabled id=fieldset2>
  <legend><input type=checkbox id=club></legend>
  <p><label>Name on card: <input id=clubname required></label></p>
  <p><label>Card number: <input id=clubnum required pattern="[-0-9]+"></label></p>
</fieldset>
<label disabled></label>
<object disabled></object>
<output disabled></output>
<img disabled/>
<meter disabled></meter>
<progress disabled></progress>


`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"':disabled' should match only disabled elements",
		({ document }) => {
			const elements = document.querySelectorAll(':disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'button2',
				'input2',
				'select2',
				'optgroup2',
				'option2',
				'textarea2',
				'fieldset2',
				'clubname',
				'clubnum',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
	context.test(
		"':disabled' should not match elements whose disabled attribute has been removed",
		({ document }) => {
			document.getElementById('button2')!.removeAttribute('disabled');

			const elements = document.querySelectorAll(':disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'input2',
				'select2',
				'optgroup2',
				'option2',
				'textarea2',
				'fieldset2',
				'clubname',
				'clubnum',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
	context.test(
		"':disabled' should also match elements whose disabled attribute has been set",
		({ document }) => {
			document.getElementById('button2')!.removeAttribute('disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');

			const elements = document.querySelectorAll(':disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'button1',
				'input2',
				'select2',
				'optgroup2',
				'option2',
				'textarea2',
				'fieldset2',
				'clubname',
				'clubnum',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
	context.test(
		"':disabled' should also match elements whose disabled attribute has been set twice",
		({ document }) => {
			document.getElementById('button2')!.removeAttribute('disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');

			const elements = document.querySelectorAll(':disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'button1',
				'input2',
				'select2',
				'optgroup2',
				'option2',
				'textarea2',
				'fieldset2',
				'clubname',
				'clubnum',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
	context.test(
		"':disabled' should also match disabled elements whose type has changed",
		({ document }) => {
			document.getElementById('button2')!.removeAttribute('disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('input2')!.setAttribute('type', 'submit');

			const elements = document.querySelectorAll(':disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'button1',
				'input2',
				'select2',
				'optgroup2',
				'option2',
				'textarea2',
				'fieldset2',
				'clubname',
				'clubnum',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
	context.test(
		"':disabled' should not match elements not in the document",
		({ document }) => {
			document.getElementById('button2')!.removeAttribute('disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('input2')!.setAttribute('type', 'submit');
			var input = document.createElement('input');
			input.setAttribute('disabled', 'disabled');

			const elements = document.querySelectorAll(':disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'button1',
				'input2',
				'select2',
				'optgroup2',
				'option2',
				'textarea2',
				'fieldset2',
				'clubname',
				'clubnum',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
	context.test(
		"':disabled' should match elements that are appended to a disabled fieldset dynamically",
		({ document }) => {
			document.getElementById('button2')!.removeAttribute('disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('button1')!.setAttribute('disabled', 'disabled');
			document.getElementById('input2')!.setAttribute('type', 'submit');
			var input = document.createElement('input');
			input.setAttribute('disabled', 'disabled');
			var fieldset = document.createElement('fieldset');
			fieldset.id = 'fieldset_nested';
			fieldset.innerHTML = `
    <input id=input_nested>
    <button id=button_nested>button nested</button>
    <select id=select_nested>
      <optgroup label="options" id=optgroup_nested>
        <option value="options" id=option_nested>option nested</option>
      </optgroup>
    </select>
    <textarea id=textarea_nested>textarea nested</textarea>
    <object id=object_nested></object>
    <output id=output_nested></output>
    <fieldset id=fieldset_nested2>
      <input id=input_nested2>
    </fieldset>
  `;
			document.getElementById('fieldset2')!.appendChild(fieldset);

			const elements = document.querySelectorAll('#fieldset2 :disabled');
			const result: (HTMLElement | null)[] = [];
			[
				'clubname',
				'clubnum',
				'fieldset_nested',
				'input_nested',
				'button_nested',
				'select_nested',
				'optgroup_nested',
				'option_nested',
				'textarea_nested',
				'fieldset_nested2',
				'input_nested2',
			].forEach(function (id: string) {
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
				content: markup2,
			},
		},
	);
}
