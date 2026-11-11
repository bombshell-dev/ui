import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('Placeholder label options within a select', ({ document }) => {
		let select = document.createElement('select');
		expect(
			select.willValidate,
			'A select element is a submittable element that is a candidate for constraint validation.',
		).toBe(true);
		let placeholder = document.createElement('option');
		select.appendChild(placeholder);
		expect(select.checkValidity(), "Always valid when the select isn't a required value.").toBe(
			true,
		);
		select.required = true;
		expect(
			placeholder.selected,
			'If display size is 1, multiple is absent and no options have selectedness true, the first option is selected.',
		).toBe(true);
		expect(select.value, "The placeholder's value should be the select's value right now").toBe('');
		expect(
			select.checkValidity(),
			'A selected placeholder option should invalidate the select.',
		).toBe(false);
		let emptyOption = document.createElement('option');
		select.appendChild(emptyOption);
		emptyOption.selected = true;
		expect(select.value, 'The empty value should be set.').toBe('');
		expect(
			select.checkValidity(),
			'An empty non-placeholder option should be a valid choice.',
		).toBe(true);
		let filledOption = document.createElement('option');
		filledOption.value = 'test';
		select.appendChild(filledOption);
		filledOption.selected = true;
		expect(select.value, 'The non-empty value should be set.').toBe('test');
		expect(
			select.checkValidity(),
			'A non-empty non-placeholder option should be a valid choice.',
		).toBe(true);
		select.removeChild(placeholder);
		select.appendChild(emptyOption); // move emptyOption to second place
		emptyOption.selected = true;
		expect(select.value, 'The empty value should be set.').toBe('');
		expect(select.checkValidity(), 'Only the first option can be seen as a placeholder.').toBe(
			true,
		);
		placeholder.disabled = true;
		select.insertBefore(placeholder, filledOption);
		placeholder.selected = true;
		expect(
			select.value,
			'A disabled first placeholder option should result in an empty value.',
		).toBe('');
		expect(
			select.checkValidity(),
			'A disabled first placeholder option should invalidate the select.',
		).toBe(false);
	});
	context.test('Placeholder label-like options within optgroup', ({ document }) => {
		let select = document.createElement('select');
		select.required = true;
		let optgroup = document.createElement('optgroup');
		let emptyOption = document.createElement('option');
		optgroup.appendChild(emptyOption);
		select.appendChild(optgroup);
		emptyOption.selected = true;
		expect(select.value, 'The empty value should be set.').toBe('');
		expect(
			select.checkValidity(),
			'The first option is not considered a placeholder if it is located within an optgroup.',
		).toBe(true);
		let otherEmptyOption = document.createElement('option');
		otherEmptyOption.value = '';
		select.appendChild(otherEmptyOption);
		otherEmptyOption.selected = true;
		expect(select.value, 'The empty value should be set.').toBe('');
		expect(
			select.checkValidity(),
			'The empty option should be accepted as it is not the first option in the tree ordered list.',
		).toBe(true);
	});
	context.test('Validation on selects with display size set as more than one', ({ document }) => {
		let select = document.createElement('select');
		select.required = true;
		select.size = 2;
		let emptyOption = document.createElement('option');
		select.appendChild(emptyOption);
		expect(
			emptyOption.selected,
			'Display size is not 1, so the first option should not be selected.',
		).toBe(false);
		expect(
			select.checkValidity(),
			'If no options are selected the select must be seen as invalid.',
		).toBe(false);
		emptyOption.selected = true;
		expect(
			select.checkValidity(),
			'If one option is selected, the select should be considered valid.',
		).toBe(true);
		let otherEmptyOption = document.createElement('option');
		otherEmptyOption.value = '';
		select.appendChild(otherEmptyOption);
		otherEmptyOption.selected = true;
		expect(
			emptyOption.selected,
			'Whenever an option has its selectiveness set to true, the other options must be set to false.',
		).toBe(false);
		otherEmptyOption.selected = false;
		expect(
			otherEmptyOption.selected,
			'It should be possible to set the selectiveness to false with a display size more than one.',
		).toBe(false);
		expect(
			select.checkValidity(),
			'If no options are selected the select must be seen as invalid.',
		).toBe(false);
	});
	context.test('Validation on selects with multiple set', ({ document }) => {
		let select = document.createElement('select');
		select.required = true;
		select.multiple = true;
		let emptyOption = document.createElement('option');
		select.appendChild(emptyOption);
		expect(
			select.checkValidity(),
			'If no options are selected the select must be seen as invalid.',
		).toBe(false);
		emptyOption.selected = true;
		expect(
			select.checkValidity(),
			'If one option is selected, the select should be considered valid.',
		).toBe(true);
		let optgroup = document.createElement('optgroup');
		optgroup.appendChild(emptyOption); // Move option to optgroup
		select.appendChild(optgroup);
		expect(
			select.checkValidity(),
			'If one option within an optgroup or not is selected, the select should be considered valid.',
		).toBe(true);
	});
	context.test('Validation on selects with non-empty disabled option', ({ document }) => {
		let select = document.createElement('select');
		select.required = true;
		let option = document.createElement('option');
		option.value = 'test';
		option.disabled = true;
		option.selected = true;
		select.appendChild(option);
		expect(
			select.checkValidity(),
			'When a required select has an option that is selected and disabled, the select should be considered valid.',
		).toBe(true);
	});
	context.test('Remove and add back the placeholder label option', ({ document }) => {
		let select = document.createElement('select');
		select.required = true;
		let placeholder = document.createElement('option');
		select.appendChild(placeholder);
		let nonPlaceholder = document.createElement('option');
		nonPlaceholder.textContent = 'non-placeholder-option';
		select.appendChild(nonPlaceholder);

		expect(
			select.checkValidity(),
			"If the placeholder label option is selected, required select element shouldn't be valid.",
		).toBe(false);
		placeholder.remove();
		expect(
			select.checkValidity(),
			'If the placeholder label option is removed, required select element should become valid.',
		).toBe(true);
		select.prepend(placeholder);
		expect(
			select.checkValidity(),
			"If the placeholder label option is selected, required select element shouldn't be valid.",
		).toBe(false);
	});
}
