import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>HTMLSelectElement.selectedOptions</title>



</head>
<body>
<div id="log"></div>

<select id="select-none-selected">
  <option>One</option>
  <option>Two</option>
  <option>Three</option>
</select>

<select id="select-one-selected">
  <option>One</option>
  <option selected>Two</option>
  <option>Three</option>
</select>

<select multiple id="multiple-select-none-selected">
  <option>One</option>
  <option>Two</option>
  <option>Three</option>
</select>

<select multiple id="multiple-select-two-selected">
  <option>One</option>
  <option selected>Two</option>
  <option selected>Three</option>
</select>

<select id="select-named-selected">
  <option>One</option>
  <option>Two</option>
  <option id="named-option" selected>Three</option>
</select>

<select id="invalid-select">
  <option selected>One</option>
  <option selected>Two</option>
  <option>Three</option>
</select>

<select id="select-same-object">
  <option>One</option>
  <option selected>Two</option>
  <option>Three</option>
</select>

<select multiple id="select-same-object-change">
  <option selected>One</option>
  <option selected>Two</option>
  <option selected>Three</option>
</select>


</body>
</html>
`;

		context.test(
			'.selectedOptions with no selected option',
			({ document }) => {
				const select = document.getElementById('select-none-selected') as HTMLSelectElement;

				expect(select.selectedOptions).toHaveLength(1);
				expect(select.selectedOptions[0]).toBe(select.children[0]);
				expect(select.selectedOptions.length).toBe(1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'.selectedOptions with one selected option',
			({ document }) => {
				const select = document.getElementById('select-one-selected') as HTMLSelectElement;

				expect(select.selectedOptions).toHaveLength(1);
				expect(select.selectedOptions[0]).toBe(select.children[1]);
				expect(select.selectedOptions.length).toBe(1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			".selectedOptions using the 'multiple' attribute with no selected options",
			({ document }) => {
				const select = document.getElementById(
					'multiple-select-none-selected',
				) as HTMLSelectElement;

				expect(select.selectedOptions.item(0)).toBe(null);
				expect(select.selectedOptions.length).toBe(0);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			".selectedOptions using the 'multiple' attribute with two selected options",
			({ document }) => {
				const select = document.getElementById('multiple-select-two-selected') as HTMLSelectElement;

				expect(select.selectedOptions.item(0)).toBe(select.children[1]);
				expect(select.selectedOptions.item(1)).toBe(select.children[2]);
				expect(select.selectedOptions.length).toBe(2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			".selectedOptions without the 'multiple' attribute but " +
				'more than one selected option should return the last one',
			({ document }) => {
				const select = document.getElementById('invalid-select') as HTMLSelectElement;

				expect(select.selectedOptions).toHaveLength(1);
				expect(select.selectedOptions[0]).toBe(select.children[1]);
				expect(select.selectedOptions.length).toBe(1);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'.selectedOptions should return `HTMLCollection` instance',
			({ document, HTMLCollection }) => {
				const select = document.getElementById('select-named-selected') as HTMLSelectElement;

				expect(select.selectedOptions.constructor).toBe(HTMLCollection);
				expect(select.selectedOptions.namedItem('named-option')).toBe(select.children[2]);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'.selectedOptions should always return the same value - [SameObject]',
			({ document }) => {
				const select = document.getElementById('select-same-object') as HTMLSelectElement;
				const selectAgain = document.getElementById('select-same-object') as HTMLSelectElement;

				expect(select.selectedOptions).toBe(selectAgain.selectedOptions);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'.selectedOptions should return the same object after selection changes - [SameObject]',
			({ document }) => {
				const select = document.getElementById('select-same-object-change') as HTMLSelectElement;
				const before = select.selectedOptions;
				expect(before.length).toBe(3);

				(select.selectedOptions[1] as HTMLOptionElement).selected = false;

				const after = select.selectedOptions;

				expect(before).toBe(after);
				expect(before.length).toBe(2);
				expect(after.length).toBe(2);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'.selectedOptions should not go stale when a form reset runs the ' +
				'selectedness setting algorithm on a script-created select',
			({ document, Option, cleanup }) => {
				const form = document.createElement('form');
				const select = document.createElement('select');
				const a = new Option('a');
				const b = new Option('b');
				select.append(a, b);
				form.append(select);
				document.body.append(form);
				cleanup(() => form.remove());

				const options = select.selectedOptions;
				expect([...options], "'a' selected initially").toHaveLength(1);
				expect([...options][0], "'a' selected initially").toBe(a);

				select.selectedIndex = -1;
				expect([...options], 'nothing selected').toHaveLength(0);

				// The reset algorithm ends by running the selectedness setting algorithm,
				// which selects 'a'.
				form.reset();
				expect(a.selected, "'a' re-selected").toBe(true);
				expect([...options], 'selectedOptions reflects the re-selected option').toHaveLength(1);
				expect([...options][0], 'selectedOptions reflects the re-selected option').toBe(a);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'.selectedOptions should not go stale when the selectedness setting ' +
				'algorithm runs on a script-created select',
			({ document, Option, cleanup }) => {
				const select = document.createElement('select');
				const a = new Option('a', 'a', true, true);
				const b = new Option('b');
				select.append(a, b);
				document.body.append(select);
				cleanup(() => select.remove());

				const options = select.selectedOptions;
				expect([...options], "'a' selected initially").toHaveLength(1);
				expect([...options][0], "'a' selected initially").toBe(a);

				select.selectedIndex = -1;
				expect([...options], 'nothing selected').toHaveLength(0);

				// Removing 'b' re-runs the selectedness setting algorithm, which selects 'a'.
				b.remove();
				expect(a.selected, "'a' re-selected").toBe(true);
				expect([...options], 'selectedOptions reflects the re-selected option').toHaveLength(1);
				expect([...options][0], 'selectedOptions reflects the re-selected option').toBe(a);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
