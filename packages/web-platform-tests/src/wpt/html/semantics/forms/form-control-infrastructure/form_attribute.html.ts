import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<html>
  <head>
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
  <body>
    <div>
      <form id="f1"></form>
      <form id="f2">
        <input id="i1" />
        <input id="i2" form="f1" />
        <input id="i3" />
      </form>
\x20\x20\x20\x20\x20\x20
    </div>

    <div id="placeholder">
    </div>

\x20\x20\x20\x20

    <form id="form3">
    </form>
    <input id="form3" form="form3">Same ID as form

\x20\x20\x20\x20
  </body>
</html>
`;
		context.test(
			'[BUTTON] ' +
				'Basic form association - control with no form attribute is associated with ancestor',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				"Form owner is reset to null when control's form attribute is set to an ID " +
				'that does not exist in the document',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.id = 'form-one';
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' + 'Control whose form attribute is an empty string has no form owner',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				'Control whose form attribute is an empty string has no form owner ' +
				'even when form with empty attribute is present',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = '';
				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' + "Control's form attribute must be a case sensitive match for the form's id",
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'FORM1';
				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				'Setting the form attribute of a control to the id of a non-ancestor form works',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' + 'Removing form id from a control resets the form owner to ancestor',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				control.removeAttribute('form');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				'Removing the form owner of a control with form attribute resets ' +
				'the form owner to null',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				placeholder.removeChild(form1);

				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' + 'Changing form attibute of control resets form owner to correct form',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				let form3 = document.createElement('form');
				form3.id = 'form3';
				placeholder.appendChild(form3);
				form3.appendChild(control);
				expect(control.form).toBe(form3);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);

				control.setAttribute('form', 'form1');
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				'Moving a control with form attribute within the document ' +
				'does not change the form owner',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				let form3 = document.createElement('form');
				form3.id = 'form3';

				placeholder.appendChild(form3);
				placeholder.appendChild(control);
				expect(control.form).toBe(form1);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				'When the id of a non-ancestor form changes from not being a match for the ' +
				"form attribute to being a match, the control's form owner is reset",
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'form-one';
				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(null);

				form1.id = 'form1';
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				"When form element with same ID as the control's form attribute is inserted " +
				'earlier in tree order, the form owner is changed to the inserted form',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.id = 'form1';
				form1.parentNode!.insertBefore(form2, form1);
				expect(control.form).toBe(form2);

				form2.parentNode!.removeChild(form2);
				expect(control.form).toBe(form1);

				form1.parentNode!.appendChild(form2);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				"When non-form element with same ID as the control's form attribute is " +
				'inserted earlier in tree order, the control does not have a form owner',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(form1);

				let span = document.createElement('span');
				span.id = 'form1';
				form1.parentNode!.insertBefore(span, form1);
				expect(control.form).toBe(null);

				form1.parentNode!.appendChild(span);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[BUTTON] ' +
				'A control that is not in the document but has the form attribute set ' +
				'is associated with the nearest ancestor form if one exists',
			({ document }) => {
				const control = document.createElement('button');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.parentNode!.removeChild(form1);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<html>
  <head>
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
  <body>
    <div>
      <form id="f1"></form>
      <form id="f2">
        <input id="i1" />
        <input id="i2" form="f1" />
        <input id="i3" />
      </form>
\x20\x20\x20\x20\x20\x20
    </div>

    <div id="placeholder">
    </div>

\x20\x20\x20\x20

    <form id="form3">
    </form>
    <input id="form3" form="form3">Same ID as form

\x20\x20\x20\x20
  </body>
</html>
`;
		context.test(
			'[INPUT] ' +
				'Basic form association - control with no form attribute is associated with ancestor',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				"Form owner is reset to null when control's form attribute is set to an ID " +
				'that does not exist in the document',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.id = 'form-one';
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' + 'Control whose form attribute is an empty string has no form owner',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				'Control whose form attribute is an empty string has no form owner ' +
				'even when form with empty attribute is present',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = '';
				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' + "Control's form attribute must be a case sensitive match for the form's id",
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'FORM1';
				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' + 'Setting the form attribute of a control to the id of a non-ancestor form works',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' + 'Removing form id from a control resets the form owner to ancestor',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				control.removeAttribute('form');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				'Removing the form owner of a control with form attribute resets ' +
				'the form owner to null',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				placeholder.removeChild(form1);

				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' + 'Changing form attibute of control resets form owner to correct form',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				let form3 = document.createElement('form');
				form3.id = 'form3';
				placeholder.appendChild(form3);
				form3.appendChild(control);
				expect(control.form).toBe(form3);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);

				control.setAttribute('form', 'form1');
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				'Moving a control with form attribute within the document ' +
				'does not change the form owner',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				let form3 = document.createElement('form');
				form3.id = 'form3';

				placeholder.appendChild(form3);
				placeholder.appendChild(control);
				expect(control.form).toBe(form1);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				'When the id of a non-ancestor form changes from not being a match for the ' +
				"form attribute to being a match, the control's form owner is reset",
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'form-one';
				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(null);

				form1.id = 'form1';
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				"When form element with same ID as the control's form attribute is inserted " +
				'earlier in tree order, the form owner is changed to the inserted form',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.id = 'form1';
				form1.parentNode!.insertBefore(form2, form1);
				expect(control.form).toBe(form2);

				form2.parentNode!.removeChild(form2);
				expect(control.form).toBe(form1);

				form1.parentNode!.appendChild(form2);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				"When non-form element with same ID as the control's form attribute is " +
				'inserted earlier in tree order, the control does not have a form owner',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(form1);

				let span = document.createElement('span');
				span.id = 'form1';
				form1.parentNode!.insertBefore(span, form1);
				expect(control.form).toBe(null);

				form1.parentNode!.appendChild(span);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[INPUT] ' +
				'A control that is not in the document but has the form attribute set ' +
				'is associated with the nearest ancestor form if one exists',
			({ document }) => {
				const control = document.createElement('input');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.parentNode!.removeChild(form1);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Tests for parser inserted controls',
			({ document }) => {
				let i1 = document.getElementById('i1') as HTMLInputElement;
				let i2 = document.getElementById('i2') as HTMLInputElement;
				let i3 = document.getElementById('i3') as HTMLInputElement;
				let f1 = document.getElementById('f1') as HTMLFormElement;
				let f2 = document.getElementById('f2') as HTMLFormElement;

				expect(i1.form, 'i1 must be associated with f2 by the parser').toBe(f2);
				expect(
					i2.form,
					'i2 is not associated with f2 by the parser ' +
						'since it has the form attribute set to f1',
				).toBe(f1);

				f1.appendChild(i1);
				i3.setAttribute('form', 'f1');

				expect(i1.form, "i1's form owner must be reset when parent changes").toBe(f1);
				expect(i3.form, "i3's form owner must be reset when the form" + 'attribute is set').toBe(
					f1,
				);

				expect(i2.form).toBe(f1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Test for button with same ID as form',
			({ document }) => {
				let form3 = document.getElementById('form3') as HTMLFormElement;
				let button = form3.nextElementSibling as HTMLInputElement;

				expect(
					button.form,
					'button should be associated with form3 even though it has the same ID',
				).toBe(form3);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<html>
  <head>
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
  <body>
    <div>
      <form id="f1"></form>
      <form id="f2">
        <input id="i1" />
        <input id="i2" form="f1" />
        <input id="i3" />
      </form>
\x20\x20\x20\x20\x20\x20
    </div>

    <div id="placeholder">
    </div>

\x20\x20\x20\x20

    <form id="form3">
    </form>
    <input id="form3" form="form3">Same ID as form

\x20\x20\x20\x20
  </body>
</html>
`;
		context.test(
			'[TEXTAREA] ' +
				'Basic form association - control with no form attribute is associated with ancestor',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				"Form owner is reset to null when control's form attribute is set to an ID " +
				'that does not exist in the document',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.id = 'form-one';
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' + 'Control whose form attribute is an empty string has no form owner',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				'Control whose form attribute is an empty string has no form owner ' +
				'even when form with empty attribute is present',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = '';
				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' + "Control's form attribute must be a case sensitive match for the form's id",
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'FORM1';
				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				'Setting the form attribute of a control to the id of a non-ancestor form works',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' + 'Removing form id from a control resets the form owner to ancestor',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				control.removeAttribute('form');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				'Removing the form owner of a control with form attribute resets ' +
				'the form owner to null',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				placeholder.removeChild(form1);

				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' + 'Changing form attibute of control resets form owner to correct form',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				let form3 = document.createElement('form');
				form3.id = 'form3';
				placeholder.appendChild(form3);
				form3.appendChild(control);
				expect(control.form).toBe(form3);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);

				control.setAttribute('form', 'form1');
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				'Moving a control with form attribute within the document ' +
				'does not change the form owner',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				let form3 = document.createElement('form');
				form3.id = 'form3';

				placeholder.appendChild(form3);
				placeholder.appendChild(control);
				expect(control.form).toBe(form1);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				'When the id of a non-ancestor form changes from not being a match for the ' +
				"form attribute to being a match, the control's form owner is reset",
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'form-one';
				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(null);

				form1.id = 'form1';
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				"When form element with same ID as the control's form attribute is inserted " +
				'earlier in tree order, the form owner is changed to the inserted form',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.id = 'form1';
				form1.parentNode!.insertBefore(form2, form1);
				expect(control.form).toBe(form2);

				form2.parentNode!.removeChild(form2);
				expect(control.form).toBe(form1);

				form1.parentNode!.appendChild(form2);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				"When non-form element with same ID as the control's form attribute is " +
				'inserted earlier in tree order, the control does not have a form owner',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(form1);

				let span = document.createElement('span');
				span.id = 'form1';
				form1.parentNode!.insertBefore(span, form1);
				expect(control.form).toBe(null);

				form1.parentNode!.appendChild(span);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[TEXTAREA] ' +
				'A control that is not in the document but has the form attribute set ' +
				'is associated with the nearest ancestor form if one exists',
			({ document }) => {
				const control = document.createElement('textarea');
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.parentNode!.removeChild(form1);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	for (const localName of ['fieldset', 'object', 'output', 'select'] as const) {
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<html>
  <head>
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
  <body>
    <div>
      <form id="f1"></form>
      <form id="f2">
        <input id="i1" />
        <input id="i2" form="f1" />
        <input id="i3" />
      </form>
\x20\x20\x20\x20\x20\x20
    </div>

    <div id="placeholder">
    </div>

\x20\x20\x20\x20

    <form id="form3">
    </form>
    <input id="form3" form="form3">Same ID as form

\x20\x20\x20\x20
  </body>
</html>
`;
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Basic form association - control with no form attribute is associated with ancestor',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				"Form owner is reset to null when control's form attribute is set to an ID " +
				'that does not exist in the document',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.id = 'form-one';
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Control whose form attribute is an empty string has no form owner',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Control whose form attribute is an empty string has no form owner ' +
				'even when form with empty attribute is present',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = '';
				control.setAttribute('form', '');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				"Control's form attribute must be a case sensitive match for the form's id",
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'FORM1';
				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Setting the form attribute of a control to the id of a non-ancestor form works',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Removing form id from a control resets the form owner to ancestor',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				control.removeAttribute('form');
				expect(control.form).toBe(form2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Removing the form owner of a control with form attribute resets ' +
				'the form owner to null',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');

				form2.appendChild(control);
				expect(control.form).toBe(form1);

				placeholder.removeChild(form1);

				expect(control.form).toBe(null);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Changing form attibute of control resets form owner to correct form',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				let form3 = document.createElement('form');
				form3.id = 'form3';
				placeholder.appendChild(form3);
				form3.appendChild(control);
				expect(control.form).toBe(form3);

				control.setAttribute('form', 'form2');
				expect(control.form).toBe(form2);

				control.setAttribute('form', 'form1');
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'Moving a control with form attribute within the document ' +
				'does not change the form owner',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				let form3 = document.createElement('form');
				form3.id = 'form3';

				placeholder.appendChild(form3);
				placeholder.appendChild(control);
				expect(control.form).toBe(form1);

				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.appendChild(control);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'When the id of a non-ancestor form changes from not being a match for the ' +
				"form attribute to being a match, the control's form owner is reset",
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				form1.id = 'form-one';
				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(null);

				form1.id = 'form1';
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				"When form element with same ID as the control's form attribute is inserted " +
				'earlier in tree order, the form owner is changed to the inserted form',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form2.id = 'form1';
				form1.parentNode!.insertBefore(form2, form1);
				expect(control.form).toBe(form2);

				form2.parentNode!.removeChild(form2);
				expect(control.form).toBe(form1);

				form1.parentNode!.appendChild(form2);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				"When non-form element with same ID as the control's form attribute is " +
				'inserted earlier in tree order, the control does not have a form owner',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form2.appendChild(control);
				expect(control.form).toBe(form1);

				let span = document.createElement('span');
				span.id = 'form1';
				form1.parentNode!.insertBefore(span, form1);
				expect(control.form).toBe(null);

				form1.parentNode!.appendChild(span);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'[' +
				localName.toUpperCase() +
				'] ' +
				'A control that is not in the document but has the form attribute set ' +
				'is associated with the nearest ancestor form if one exists',
			({ document }) => {
				const control = document.createElement(localName);
				const placeholder = document.getElementById('placeholder')!;
				while (placeholder.firstChild) placeholder.removeChild(placeholder.firstChild);
				const form1 = document.createElement('form');
				const form2 = document.createElement('form');
				form1.id = 'form1';
				form2.id = 'form2';
				placeholder.appendChild(form1);
				placeholder.appendChild(form2);

				control.setAttribute('form', 'form1');
				form1.appendChild(control);
				expect(control.form).toBe(form1);

				form1.parentNode!.removeChild(form1);
				expect(control.form).toBe(form1);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
