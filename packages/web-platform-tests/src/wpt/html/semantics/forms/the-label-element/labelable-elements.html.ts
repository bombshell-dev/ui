import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<meta charset="utf-8">
<title>HTML Test: labelable elements</title>



<div id="log"></div>
<form style="display:none">
  <output id="testoutput"></output>
  <label id="lbl0" for="testoutput"></label>
  <progress id="testprogress"></progress>
  <label id="lbl1" for="testprogress"></label>
  <select id="testselect"></select>
  <label id="lbl2" for="testselect"></label>
  <textarea id="testarea"></textarea>
  <label id="lbl3" for="testarea"></label>
  <button id="testButton"></button>
  <label id="lbl4" for="testButton"></label>
  <input type="hidden" id="testHidden">
  <label id="lbl5" for="testHidden"></label>
  <input type="radio" id="testRadio">
  <label id="lbl6" for="testRadio"></label>
  <keygen id="testkeygen">
  <label id="lbl7" for="testkeygen"></label>
  <meter id="testmeter"></meter>
  <label id="lbl8" for="testmeter"></label>

  <fieldset id="testfieldset"></fieldset>
  <label id="lbl9" for="testfieldset"></label>
  <label id="testlabel"></label>
  <label id="lbl10" for="testlabel"></label>
  <object id="testobject"></object>
  <label id="lbl11" for="testobject"></label>
  <img id="testimg">
  <label id="lbl12" for="testimg"></label>
</form>


`;
		context.test(
			'Check if the output element is a labelable element',
			({ document }) => {
				expect(
					(document.getElementById('lbl0') as HTMLLabelElement).control!.id,
					'An output element should be labelable.',
				).toBe('testoutput');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the progress element is a labelable element',
			({ document }) => {
				expect(
					(document.getElementById('lbl1') as HTMLLabelElement).control!.id,
					'A progress element should be labelable.',
				).toBe('testprogress');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the select element is a labelable element',
			({ document }) => {
				expect(
					(document.getElementById('lbl2') as HTMLLabelElement).control!.id,
					'A select element should be labelable.',
				).toBe('testselect');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the textarea element is a labelable form-element',
			({ document }) => {
				expect(
					(document.getElementById('lbl3') as HTMLLabelElement).control!.id,
					'A textarea element should be labelable.',
				).toBe('testarea');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the button element is a labelable element',
			({ document }) => {
				expect(
					(document.getElementById('lbl4') as HTMLLabelElement).control!.id,
					'A button element should be labelable.',
				).toBe('testButton');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the hidden input element is not a labelable element.',
			({ document }) => {
				expect(
					(document.getElementById('lbl5') as HTMLLabelElement).control,
					'An input element in hidden state should not be labelable.',
				).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the input element in radio state is a labelable element',
			({ document }) => {
				expect(
					(document.getElementById('lbl6') as HTMLLabelElement).control!.id,
					'An input  element in radio state should be labelable.',
				).toBe('testRadio');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the keygen element is not a labelable element',
			({ document }) => {
				expect((document.getElementById('lbl7') as HTMLLabelElement).control).not.toBe(
					document.getElementById('testkeygen'),
				);
				expect(
					(document.getElementById('lbl7') as HTMLLabelElement).control,
					'A keygen element should not be labelable.',
				).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the meter element is a labelable element',
			({ document }) => {
				expect(
					(document.getElementById('lbl8') as HTMLLabelElement).control!.id,
					'A meter element should be labelable.',
				).toBe('testmeter');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the fieldset element is not a labelable element',
			({ document }) => {
				expect((document.getElementById('lbl9') as HTMLLabelElement).control).not.toBe(
					document.getElementById('testfieldset'),
				);
				expect(
					(document.getElementById('lbl9') as HTMLLabelElement).control,
					'A fieldset element should not be labelable.',
				).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the label element is not a labelable element',
			({ document }) => {
				expect((document.getElementById('lbl9') as HTMLLabelElement).control).not.toBe(
					document.getElementById('testlabel'),
				);
				expect(
					(document.getElementById('lbl10') as HTMLLabelElement).control,
					'A label element should not be labelable.',
				).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the object element is not a labelable element',
			({ document }) => {
				expect((document.getElementById('lbl9') as HTMLLabelElement).control).not.toBe(
					document.getElementById('testobject'),
				);
				expect(
					(document.getElementById('lbl11') as HTMLLabelElement).control,
					'An object element should not be labelable.',
				).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Check if the img element is not a labelable element',
			({ document }) => {
				expect((document.getElementById('lbl9') as HTMLLabelElement).control).not.toBe(
					document.getElementById('testimg'),
				);
				expect(
					(document.getElementById('lbl12') as HTMLLabelElement).control,
					'An img element should not be labelable.',
				).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<meta charset="utf-8">
<title>HTML Test: labelable elements</title>



<div id="log"></div>
<form style="display:none">
  <output id="testoutput"></output>
  <label id="lbl0" for="testoutput"></label>
  <progress id="testprogress"></progress>
  <label id="lbl1" for="testprogress"></label>
  <select id="testselect"></select>
  <label id="lbl2" for="testselect"></label>
  <textarea id="testarea"></textarea>
  <label id="lbl3" for="testarea"></label>
  <button id="testButton"></button>
  <label id="lbl4" for="testButton"></label>
  <input type="hidden" id="testHidden">
  <label id="lbl5" for="testHidden"></label>
  <input type="radio" id="testRadio">
  <label id="lbl6" for="testRadio"></label>
  <keygen id="testkeygen">
  <label id="lbl7" for="testkeygen"></label>
  <meter id="testmeter"></meter>
  <label id="lbl8" for="testmeter"></label>

  <fieldset id="testfieldset"></fieldset>
  <label id="lbl9" for="testfieldset"></label>
  <label id="testlabel"></label>
  <label id="lbl10" for="testlabel"></label>
  <object id="testobject"></object>
  <label id="lbl11" for="testobject"></label>
  <img id="testimg">
  <label id="lbl12" for="testimg"></label>
</form>


`;
		context.test(
			"Check if the textarea element can access 'labels'",
			({ document }) => {
				function testLabelsAttr(formElementId: string, labelElementId: string) {
					const elem = document.getElementById(formElementId) as HTMLTextAreaElement;
					if (labelElementId) {
						expect(elem.labels.length).toBe(1);
						expect(elem.labels[0]!.id).toBe(labelElementId);
					} else {
						expect(elem.labels.length).toBe(0);
					}
				}

				testLabelsAttr('testarea', 'lbl3');
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
