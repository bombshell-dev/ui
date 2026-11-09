import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		context.test('Input checked/defaultChecked dirty checkedness semantics', ({ document }) => {
			const input = document.createElement('input');

			expect(input.checked, 'checkedness is false by default').toBe(false);

			input.setAttribute('checked', 'checked');
			expect(input.checked, 'checked property must return the current checkedness').toBe(true);

			input.removeAttribute('checked');
			expect(
				input.checked,
				'dirty checkedness is still false so removing the attribute changes checkedness',
			).toBe(false);

			input.checked = false;
			// dirty checkedness flag is now true

			expect(
				input.checked,
				"on setting, the checked property must set the element's checkedness to the new value",
			).toBe(false);

			input.setAttribute('checked', 'checked');
			expect(
				input.checked,
				'checkedness should not change because dirty checkedness is now true',
			).toBe(false);
		});
	}
	{
		const { expect } = context.runner;
		context.test('Input value/defaultValue dirty value flag semantics', ({ document }) => {
			const input = document.createElement('input');

			expect(input.value, 'value should be empty string if uninitialized').toBe('');
			expect(input.defaultValue, 'defaultValue should be empty string if uninitialized').toBe('');
			expect(input.getAttribute('value'), 'value attribute should be null (uninitialized)').toBe(
				null,
			);

			input.defaultValue = 'abc';

			expect(
				input.value,
				'setting defaultValue should also change value if dirty value flag is false',
			).toBe('abc');
			expect(input.defaultValue, 'defaultValue should equal set string').toBe('abc');
			expect(input.getAttribute('value'), 'value attribute should equal set string').toBe('abc');

			input.value = 'def';
			// dirty value flag is now true

			expect(input.value, 'value should be changed by setter').toBe('def');
			expect(input.defaultValue, 'defaultValue should not change').toBe('abc');
			expect(input.getAttribute('value'), 'value attribute should not change').toBe('abc');

			input.defaultValue = 'abc2';

			expect(
				input.value,
				'value should not change when setting defaultValue if dirty value flag is true',
			).toBe('def');
			expect(input.defaultValue, 'defaultValue should equal new set string').toBe('abc2');

			(input as unknown as { value: string | null }).value = null;

			expect(input.value, 'setting value to null should result in empty string').toBe('');
			expect(
				input.getAttribute('value'),
				'value attribute should not change after setting value',
			).toBe('abc2');
		});
		context.test(
			"Input type defaults to 'text' on the property despite no attribute",
			({ document }) => {
				const input = document.createElement('input');

				expect(input.hasAttribute('type')).toBe(false);
				expect(input.getAttribute('type')).toBe(null);
				expect(input.type, "type should default to 'text'").toBe('text');
			},
		);
		context.test('Setting input type property sets the attribute', ({ document }) => {
			const input = document.createElement('input');
			input.type = 'checkbox';

			expect(
				input.getAttribute('type'),
				'setting type property should set the type attribute',
			).toBe('checkbox');
		});
		context.test(
			'Parsed input type attribute is reflected in both property and attribute',
			({ document }) => {
				const div = document.createElement('div');
				div.innerHTML = '<input id="input" type="checkbox">';
				const input = div.querySelector<HTMLInputElement>('#input')!;

				expect(input.type).toBe('checkbox');
				expect(input.getAttribute('type')).toBe('checkbox');
			},
		);
	}
}
