import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!DOCTYPE html>
<html>

<head>
\x20\x20
\x20\x20
  <meta charset="utf-8">
  <title>Test for validity of disconnected radio buttons</title>
</head>

<body>
  <input type="radio" name="group" id="radio1" required />
  <input type="radio" name="group" id="radio2" checked />
  <form>
    <input type="radio" name="group" id="radio3" required />
    <input type="radio" name="group" id="radio4" checked />
  </form>

\x20\x20
</body>

</html>
`;
	context.test(
		'Removed elements are moved into separate radio groups.',
		({ document }) => {
			const radio1 = document.getElementById('radio1') as HTMLInputElement;
			const radio2 = document.getElementById('radio2') as HTMLInputElement;
			expect(radio1.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);

			radio2.remove();
			expect(radio1.validity.valueMissing, 'Element should suffer from value missing').toBe(true);

			radio1.checked = true;
			radio2.required = true;
			expect(radio2.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);

			const radio3 = document.getElementById('radio3') as HTMLInputElement;
			const radio4 = document.getElementById('radio4') as HTMLInputElement;
			expect(radio3.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);

			radio4.remove();
			expect(radio3.validity.valueMissing, 'Element should suffer from value missing').toBe(true);

			radio3.checked = true;
			expect(radio4.checked, 'Element should remain checked').toBe(true);
			expect(radio3.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);

			document.querySelector('form')!.appendChild(radio2);
			expect(radio3.checked, 'Element should be unchecked').toBe(false);
			expect(radio1.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Disconnected radio buttons should be contained by their tree root.',
		({ document }) => {
			const container = document.createElement('div');
			const radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = 'group';
			radio.id = 'radio5';
			radio.required = true;
			container.appendChild(radio);
			expect(radio.validity.valueMissing, 'Element should suffer from value missing').toBe(true);

			const outerContainer = document.createElement('div');
			const outerRadio = document.createElement('input');
			outerRadio.type = 'radio';
			outerRadio.name = 'group';
			outerRadio.id = 'radio6';
			outerRadio.checked = true;
			outerContainer.appendChild(outerRadio);
			outerContainer.appendChild(container);
			expect(radio.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);

			container.remove();
			expect(radio.validity.valueMissing, 'Element should suffer from value missing').toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Disconnected radio buttons can serve as radio group containers.',
		({ document }) => {
			const radioParent = document.createElement('input');
			radioParent.type = 'radio';
			radioParent.name = 'group';
			radioParent.id = 'radio-parent';
			radioParent.required = true;
			expect(radioParent.validity.valueMissing, 'Element should suffer from value missing').toBe(
				true,
			);

			const radioChild = document.createElement('input');
			radioChild.type = 'radio';
			radioChild.name = 'group';
			radioChild.id = 'radio-child';
			radioChild.checked = true;
			expect(radioChild.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);

			radioParent.appendChild(radioChild);
			expect(radioChild.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);
			expect(
				radioParent.validity.valueMissing,
				'Element should not suffer from value missing',
			).toBe(false);

			radioParent.checked = true;
			expect(radioChild.checked, 'Element should no longer be checked').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Shadow roots in disconnected trees can serve as radio group containers.',
		({ document }) => {
			const shadowHost = document.createElement('div');
			const root = shadowHost.attachShadow({ mode: 'open' });
			const container = document.createElement('div');
			container.appendChild(shadowHost);

			const radio1 = document.createElement('input');
			radio1.type = 'radio';
			radio1.name = 'group';
			radio1.required = true;
			const radio2 = document.createElement('input');
			radio2.type = 'radio';
			radio2.name = 'group';
			radio2.checked = true;
			const radio3 = document.createElement('input');
			radio3.type = 'radio';
			radio3.name = 'group';
			radio3.required = true;

			root.appendChild(radio1);
			container.appendChild(radio3);
			expect(radio1.validity.valueMissing, 'Element should suffer from value missing').toBe(true);
			expect(radio3.validity.valueMissing, 'Element should suffer from value missing').toBe(true);

			root.appendChild(radio2);
			expect(radio1.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);
			expect(radio3.validity.valueMissing, 'Element should suffer from value missing').toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Non-HTML elements in disconnected trees can serve as radio group containers.',
		({ document }) => {
			const svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			const htmlContainer = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
			svgRoot.appendChild(htmlContainer);

			const radio1 = document.createElement('input');
			radio1.type = 'radio';
			radio1.name = 'group';
			radio1.required = true;
			const radio2 = document.createElement('input');
			radio2.type = 'radio';
			radio2.name = 'group';
			radio2.checked = true;

			htmlContainer.appendChild(radio1);
			expect(radio1.validity.valueMissing, 'Element should suffer from value missing').toBe(true);
			htmlContainer.appendChild(radio2);
			expect(radio1.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);
			radio1.checked = true;
			expect(radio2.checked, 'Element should no longer be checked').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Disconnected document fragments can serve as radio group containers.',
		({ document }) => {
			const fragment = document.createDocumentFragment();

			const radio1 = document.createElement('input');
			radio1.type = 'radio';
			radio1.name = 'group';
			radio1.required = true;
			const radio2 = document.createElement('input');
			radio2.type = 'radio';
			radio2.name = 'group';
			radio2.checked = true;

			fragment.appendChild(radio1);
			expect(radio1.validity.valueMissing, 'Element should suffer from value missing').toBe(true);
			fragment.appendChild(radio2);
			expect(radio1.validity.valueMissing, 'Element should not suffer from value missing').toBe(
				false,
			);
			radio1.checked = true;
			expect(radio2.checked, 'Element should no longer be checked').toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		"Appending input radio input into a disconnect tree don't update the other radio inputs in the same radio group.",
		({ document }) => {
			const container = document.createElement('div');
			const radio1 = document.createElement('input');
			radio1.type = 'radio';
			radio1.name = 'group';
			radio1.checked = true;
			const radio2 = document.createElement('input');
			radio2.type = 'radio';
			radio2.name = 'group';
			radio2.checked = true;

			container.appendChild(radio1);
			expect(radio1.checked, 'radio1 should be checked').toBe(true);
			container.appendChild(radio2);
			expect(radio1.checked, 'radio1 should still be checked').toBe(true);
			expect(radio2.checked, 'radio2 should be checked, too').toBe(true);

			container.innerHTML = `<input type="radio" name="group" checked><input type="radio" name="group" checked>`;
			expect(
				(container.children[0] as HTMLInputElement).checked,
				'first radio child should be checked',
			).toBe(true);
			expect(
				(container.children[1] as HTMLInputElement).checked,
				'second radio child should be checked',
			).toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Appending input radio input into a disconnect form should update the other radio inputs in the same radio group.',
		({ document }) => {
			const form = document.createElement('form');
			const radio1 = document.createElement('input');
			radio1.type = 'radio';
			radio1.name = 'group';
			radio1.checked = true;
			const radio2 = document.createElement('input');
			radio2.type = 'radio';
			radio2.name = 'group';
			radio2.checked = true;

			form.appendChild(radio1);
			expect(radio1.checked, 'radio1 should be checked').toBe(true);
			form.appendChild(radio2);
			expect(radio1.checked, 'radio1 should no longer be checked').toBe(false);
			expect(radio2.checked, 'radio2 should be checked').toBe(true);

			form.innerHTML = `<input type="radio" name="group" checked><input type="radio" name="group" checked>`;
			expect(
				(form.children[0] as HTMLInputElement).checked,
				'first radio child should no longer be checked',
			).toBe(false);
			expect(
				(form.children[1] as HTMLInputElement).checked,
				'second radio child should be checked',
			).toBe(true);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
