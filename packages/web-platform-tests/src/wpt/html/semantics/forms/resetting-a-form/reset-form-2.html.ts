import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('integration test on reset for a created-from-script form', ({ document }) => {
		const form = document.createElement('form');
		const text = document.createElement('input');
		text.type = 'text';
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		const select = document.createElement('select');
		select.multiple = true;
		const option = document.createElement('option');
		option.value = 'option';
		const textarea = document.createElement('textarea');

		form.appendChild(text);
		form.appendChild(checkbox);
		form.appendChild(textarea);
		form.appendChild(select);
		select.appendChild(option);

		text.defaultValue = 'text default';
		checkbox.defaultChecked = true;
		option.defaultSelected = true;
		textarea.defaultValue = 'textarea default';

		text.value = 'text new value';
		checkbox.checked = false;
		option.selected = false;
		textarea.value = 'textarea new value';

		form.reset();

		expect(text.value, 'input should reset value to default').toBe('text default');
		expect(checkbox.checked, 'input should reset checkedness to default').toBe(true);
		expect(option.selected, 'second option should reset selectedness to default').toBe(true);
		expect(select.selectedIndex, 'second option should reset selectedness to default').toBe(0);
		expect(textarea.value, 'textarea should reset api value to default').toBe('textarea default');

		text.defaultValue = 'text new default';
		checkbox.defaultChecked = false;
		option.defaultSelected = false;
		textarea.defaultValue = 'textarea new default';

		expect(text.value, 'input should reset dirty value to false').toBe('text new default');
		expect(checkbox.checked, 'input should reset dirty checkedness to false').toBe(false);
		expect(option.selected, 'option should reset dirtyness to false').toBe(false);
		expect(select.selectedIndex, 'option should reset dirtyness to false').toBe(-1);
		expect(textarea.value, 'textarea should reset dirty value to false').toBe(
			'textarea new default',
		);
	});
}
