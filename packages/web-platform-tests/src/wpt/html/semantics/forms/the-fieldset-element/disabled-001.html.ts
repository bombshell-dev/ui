import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><div id="log"></div>
<form>
  <fieldset id=fs disabled>
    <legend>
      <input type=checkbox id=clubc_l1>
      <input type=radio id=clubr_l1>
      <input type=text id=clubt_l1>
    </legend>
    <legend><input type=checkbox id=club_l2></legend>
    <p><label>Name on card: <input id=clubname required></label></p>
    <p><label>Card number: <input id=clubnum required pattern="[-0-9]+"></label></p>
  </fieldset>
  <fieldset id=fs2 disabled>
    <p><legend><input type=checkbox id=club2></legend></p>
    <p><label>Name on card: <input id=clubname2 required></label></p>
    <p><label>Card number: <input id=clubnum2 required pattern="[-0-9]+"></label></p>
  </fieldset>
  <fieldset id=fs3 disabled>
    <fieldset>
      <legend><input type=checkbox id=club3></legend>
    </fieldset>
    <p><label>Name on card: <input id=clubname3 required></label></p>
    <p><label>Card number: <input id=clubnum3 required pattern="[-0-9]+"></label></p>
  </fieldset>
  <fieldset id=fs4 disabled>
    <legend>
      <fieldset id=fs4-1><input type=checkbox id=club4></fieldset>
    </legend>
    <p><label>Name on card: <input id=clubname4 required></label></p>
    <p><label>Card number: <input id=clubnum4 required pattern="[-0-9]+"></label></p>
  </fieldset>
</form>
`;
	context.test(
		"The disabled attribute, when specified, causes all the form control descendants of the fieldset element, excluding those that are descendants of the fieldset element's first legend element child, if any, to be disabled.",
		({ document }) => {
			expect(
				(document.getElementById('fs') as HTMLFieldSetElement).disabled,
				'The fieldset is disabled',
			).toBe(true);
			expect(
				(document.getElementById('clubname') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubname'",
			).toBe(false);
			expect(
				(document.getElementById('clubnum') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubnum'",
			).toBe(false);
			expect(
				(document.getElementById('clubc_l1') as HTMLInputElement).willValidate,
				"input 'clubc_l1' is descendant of the first legend child of the fieldset. It should not be disabled",
			).toBe(true);
			expect(
				(document.getElementById('clubr_l1') as HTMLInputElement).willValidate,
				"input 'clubr_l1' is descendant of the first legend child of the fieldset. It should not be disabled",
			).toBe(true);
			expect(
				(document.getElementById('clubt_l1') as HTMLInputElement).willValidate,
				"input 'clubt_l1' is descendant of the first legend child of the fieldset. It should not be disabled",
			).toBe(true);
			expect(
				(document.getElementById('club_l2') as HTMLInputElement).willValidate,
				"input 'club_l2' is a descendant of the second legend child of the fieldset. It should be disabled",
			).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"The first 'legend' element is not a child of the disabled fieldset: Its descendants should be disabled.",
		({ document }) => {
			expect(
				(document.getElementById('fs2') as HTMLFieldSetElement).disabled,
				'The fieldset is disabled',
			).toBe(true);
			expect(
				(document.getElementById('clubname2') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubname2'",
			).toBe(false);
			expect(
				(document.getElementById('clubnum2') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubnum2'",
			).toBe(false);
			expect(
				(document.getElementById('club2') as HTMLInputElement).willValidate,
				"the first legend is not a child of the disabled fieldset: input 'club2' is disabled",
			).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The <legend> element is not a child of the disabled fieldset: Its descendants should be disabled.',
		({ document }) => {
			expect(
				(document.getElementById('fs3') as HTMLFieldSetElement).disabled,
				'The fieldset is disabled',
			).toBe(true);
			expect(
				(document.getElementById('clubname3') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubname3'",
			).toBe(false);
			expect(
				(document.getElementById('clubnum3') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubnum3'",
			).toBe(false);
			expect(
				(document.getElementById('club3') as HTMLInputElement).willValidate,
				"the first legend is not a child of the disabled fieldset: input 'club3' is disabled",
			).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'The <legend> element is child of the disabled fieldset: Its descendants should be disabled.',
		({ document }) => {
			expect(
				(document.getElementById('fs4') as HTMLFieldSetElement).disabled,
				'The fieldset is disabled',
			).toBe(true);
			expect(
				(document.getElementById('clubname4') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubname4'",
			).toBe(false);
			expect(
				(document.getElementById('clubnum4') as HTMLInputElement).willValidate,
				"fieldset is disabled so is input 'clubnum4'",
			).toBe(false);
			expect(
				(document.getElementById('club4') as HTMLInputElement).willValidate,
				"the first legend a child of the disabled fieldset: input 'club4' is disabled",
			).toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'A <fieldset> element is in the <legend> element of another disabled <fieldset>: Its descendants should be disabled.',
		({ document }) => {
			let fs41 = document.querySelector('#fs4-1') as HTMLFieldSetElement;
			fs41.disabled = true;
			expect(fs41.disabled, 'The fieldset in a legend is disabled').toBe(true);
			expect(
				(document.getElementById('club4') as HTMLInputElement).willValidate,
				"In a disabled fieldset in the first legend child of another disabled fieldset: input 'club4' is disabled",
			).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
