import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function setPreconditions(document: Document, arg: string) {
		(document.getElementById('ipt1') as HTMLInputElement).value = '123';
		(document.getElementById('ipt2') as HTMLInputElement).value = '123';
		(document.getElementById('rd1') as HTMLInputElement).checked = false;
		(document.getElementById('rd2') as HTMLInputElement).checked = true;
		(document.getElementById('cb1') as HTMLInputElement).checked = false;
		(document.getElementById('cb2') as HTMLInputElement).checked = true;
		(document.getElementById('ta') as HTMLTextAreaElement).value = '123';
		(document.getElementById('opt') as HTMLOutputElement).textContent = 'abc';
		(document.getElementById('slt1') as HTMLSelectElement).value = '2';
		(document.getElementById('slt2') as HTMLSelectElement).value = '1';
		(document.getElementById('slt3') as HTMLSelectElement).options[0]!.selected = true;
		(document.getElementById('slt3') as HTMLSelectElement).options[1]!.selected = false;
		(document.getElementById('slt3') as HTMLSelectElement).options[2]!.selected = false;

		expect((document.getElementById('ipt1') as HTMLInputElement).value, 'Precondition 1').toBe(
			'123',
		);
		expect((document.getElementById('ipt2') as HTMLInputElement).value, 'Precondition 2').toBe(
			'123',
		);
		expect((document.getElementById('rd1') as HTMLInputElement).checked, 'Precondition 3').toBe(
			false,
		);
		expect((document.getElementById('rd2') as HTMLInputElement).checked, 'Precondition 4').toBe(
			true,
		);
		expect((document.getElementById('cb1') as HTMLInputElement).checked, 'Precondition 5').toBe(
			false,
		);
		expect((document.getElementById('cb2') as HTMLInputElement).checked, 'Precondition 6').toBe(
			true,
		);
		expect((document.getElementById('ta') as HTMLTextAreaElement).value, 'Precondition 17').toBe(
			'123',
		);
		expect(
			(document.getElementById('opt') as HTMLOutputElement).textContent,
			'Precondition 8',
		).toBe('abc');
		expect(
			(document.getElementById('slt1') as HTMLSelectElement).options[1]!.selected,
			'Precondition 9',
		).toBe(true);
		expect(
			(document.getElementById('slt2') as HTMLSelectElement).options[0]!.selected,
			'Precondition 10',
		).toBe(true);
		expect(
			(document.getElementById('slt3') as HTMLSelectElement).options[0]!.selected,
			'Precondition 11',
		).toBe(true);
		expect(
			(document.getElementById('slt3') as HTMLSelectElement).options[1]!.selected,
			'Precondition 12',
		).toBe(false);
		expect(
			(document.getElementById('slt3') as HTMLSelectElement).options[2]!.selected,
			'Precondition 13',
		).toBe(false);
	}
	function reset(document: Document, description: string) {
		if (description === 'by calling the reset() method') document.forms.namedItem('fm1')!.reset();
		else
			(
				document.getElementById(
					description === 'by clicking the button in reset status' ? 'rst1' : 'rst2',
				) as HTMLElement
			).click();
	}
	{
		const content = `<!DOCTYPE html>
<meta charset="utf-8">
<title>HTML Test: Resetting a form</title>





<div id="log"></div>
<form name="fm1" style="display:none">
  <input value="abc" id="ipt1" />
  <input id="ipt2" />
  <input type="radio" id="rd1" checked="checked" />
  <input type="radio" id="rd2"/>
  <input type="checkbox" id="cb1" checked="checked" />
  <input type="checkbox" id="cb2" />
  <textarea id="ta">abc</textarea>
  <output id="opt">5</output>
  <select id="slt1">
    <option value="1">ITEM1</option>
    <option value="2">ITEM2</option>
  </select>
  <select id="slt2">
    <option value="1">ITEM1</option>
    <option value="2" selected>ITEM2</option>
  </select>
  <select id="slt3" multiple>
    <option value="1">ITEM1</option>
    <option value="2" selected>ITEM2</option>
    <option value="3" selected>ITEM3</option>
  </select>
  <button  id="rst1" type="reset">Reset1</button>
  <input id="rst2" type="reset" value="Reset2" />
</form>

`;
		for (const description of [
			'by calling the reset() method',
			'by clicking the button in reset status',
			'by clicking the input in reset status',
		]) {
			context.test(
				'Resetting <input> ' + description,
				({ document }) => {
					setPreconditions(document, 'Setting preconditions for resetting ' + description);
					reset(document, description);
					expect(
						(document.getElementById('ipt1') as HTMLInputElement).value,
						"The value of the input element in text status should be 'abc'.",
					).toBe('abc');
					expect(
						(document.getElementById('ipt2') as HTMLInputElement).value,
						'The value of the input element in text status should be empty string.',
					).toBe('');
					expect(
						(document.getElementById('rd1') as HTMLInputElement).checked,
						'The checked attribute of the input element in radio should be true.',
					).toBe(true);
					expect(
						(document.getElementById('rd2') as HTMLInputElement).checked,
						'The checked attribute of the input element in radio should be false.',
					).toBe(false);
					expect(
						(document.getElementById('cb1') as HTMLInputElement).checked,
						'The checked attribute of the input element in checkbox should be true.',
					).toBe(true);
					expect(
						(document.getElementById('cb2') as HTMLInputElement).checked,
						'The checked attribute of the input element in checkbox should be false.',
					).toBe(false);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'Resetting <textarea> ' + description,
				({ document }) => {
					setPreconditions(document, 'Setting preconditions for resetting ' + description);
					reset(document, description);
					expect(
						(document.getElementById('ta') as HTMLTextAreaElement).value,
						'The value attribute of the textarea element should be reset.',
					).toBe((document.getElementById('ta') as HTMLTextAreaElement).textContent);
					expect(
						(document.getElementById('ta') as HTMLTextAreaElement).value,
						"The value attribute of the textarea element should be 'abc'.",
					).toBe('abc');
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'Resetting <output> ' + description,
				({ document }) => {
					setPreconditions(document, 'Setting preconditions for resetting ' + description);
					reset(document, description);
					expect(
						(document.getElementById('opt') as HTMLOutputElement).textContent,
						'The textContent of the output element should be reset.',
					).toBe((document.getElementById('opt') as HTMLOutputElement).defaultValue);
					expect(
						(document.getElementById('opt') as HTMLOutputElement).textContent,
						"The textContent of the output element should be 'abc'.",
					).toBe('abc');
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				'Resetting <select> ' + description,
				({ document }) => {
					setPreconditions(document, 'Setting preconditions for resetting ' + description);
					reset(document, description);
					expect(
						(document.getElementById('slt1') as HTMLSelectElement).options[0]!.selected,
						'The first option in the select element should be selected.',
					).toBe(true);
					expect(
						(document.getElementById('slt1') as HTMLSelectElement).options[1]!.selected,
						'The second option in the select element should not be selected.',
					).toBe(false);
					expect(
						(document.getElementById('slt2') as HTMLSelectElement).options[0]!.selected,
						'The first option in the select element should not be selected.',
					).toBe(false);
					expect(
						(document.getElementById('slt2') as HTMLSelectElement).options[1]!.selected,
						'The second option in the select element should be selected.',
					).toBe(true);
					expect(
						(document.getElementById('slt3') as HTMLSelectElement).options[0]!.selected,
						'The first option in the select element with multiple attribute should not be selected.',
					).toBe(false);
					expect(
						(document.getElementById('slt3') as HTMLSelectElement).options[1]!.selected,
						'The second option in the select element with multiple attribute should be selected.',
					).toBe(true);
					expect(
						(document.getElementById('slt3') as HTMLSelectElement).options[2]!.selected,
						'The third option in the select element with multiple attribute should be selected.',
					).toBe(true);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
}
