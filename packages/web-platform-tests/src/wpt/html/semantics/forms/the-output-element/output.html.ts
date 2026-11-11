import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content =
		'<!doctype html><div id="log"></div><output id="output"></output><output id="defaultValueOutput">abc</output>';

	context.test(
		'output value and defaultValue',
		({ document }) => {
			const output = document.getElementById('output') as HTMLOutputElement;
			const defaultValueOutput = document.getElementById('defaultValueOutput') as HTMLOutputElement;

			expect(output.type, "type must return the string 'output'").toBe('output');
			expect(output.textContent, 'textContent is empty').toBe('');
			expect(output.value, 'value should be empty').toBe('');
			expect(output.defaultValue, 'defaultValue should be empty').toBe('');

			output.textContent = '5';
			expect(output.value, 'textContent is set to 5: value is updated').toBe('5');
			expect(output.textContent, 'textContent is set to 5').toBe('5');
			expect(output.defaultValue, 'textContent is set to 5: defaultValue is updated').toBe('5');

			output.defaultValue = '10'; // value mode flag is in "default" mode. Setting defaultValue should set textContent as well
			expect(output.value, 'defaultValue is set to 10: value is updated').toBe('10');
			expect(output.textContent, 'defaultValue is set to 10: textContent is updated').toBe('10');
			expect(output.defaultValue, 'defaultValue is set to 10').toBe('10');

			output.value = '20'; // set the value mode flag to "value": default value remains unchanged
			expect(output.value, 'value is set to 20').toBe('20');
			expect(output.textContent, 'value is set to 20: textContent is updated').toBe('20');
			expect(output.defaultValue, 'value is set to 20: defaultValue remains unchanged').toBe('10');

			output.defaultValue = '15'; // value mode flag is in "value" mode. textContent remains unchanged when setting defaultValue
			expect(output.value, 'defaultValue is set to 15: value remains unchanged').toBe('20');
			expect(output.textContent, 'defaultValue is set to 15: textContent remains unchanged').toBe(
				'20',
			);
			expect(output.defaultValue, 'defaultValue is set to 15').toBe('15');

			expect(defaultValueOutput.type, "type must return the string 'output'").toBe('output');
			expect(defaultValueOutput.textContent, "textContent should be 'abc'").toBe('abc');
			expect(defaultValueOutput.value, "value should be 'abc'").toBe('abc');
			expect(defaultValueOutput.defaultValue, "defaultValue should be 'abc'").toBe('abc');
		},
		{ document: { contentType: 'text/html', content } },
	);
}
