import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		function assert_equal_values(output: HTMLOutputElement, value: string, message: string) {
			expect(output.value, `.value ${message}`).toBe(value);
			expect(output.defaultValue, `.defaultValue ${message}`).toBe(value);
		}
		function assert_values(
			output: HTMLOutputElement,
			value: string,
			defaultValue: string,
			message: string,
		) {
			expect(output.value, `.value ${message}`).toBe(value);
			expect(output.defaultValue, `.defaultValue ${message}`).toBe(defaultValue);
		}

		context.test('output and output.form.reset()', ({ document }) => {
			const form = document.createElement('form'),
				output = form.appendChild(document.createElement('output'));
			output.textContent = 'value';
			assert_equal_values(output, 'value', 'after setting textContent');
			output.value = 'heya';
			assert_values(output, 'heya', 'value', 'after setting value');
			form.reset();
			assert_equal_values(output, 'value', 'after form.reset()');

			output.innerHTML = '<div>something</div>';
			assert_equal_values(output, 'something', 'after setting innerHTML');
			form.reset();
			assert_equal_values(output, 'something', 'after form.reset() again');
		});
	}
	{
		const { expect } = context.runner;

		function assert_equal_values(output: HTMLOutputElement, value: string, message: string) {
			expect(output.value, `.value ${message}`).toBe(value);
			expect(output.defaultValue, `.defaultValue ${message}`).toBe(value);
		}
		function assert_values(
			output: HTMLOutputElement,
			value: string,
			defaultValue: string,
			message: string,
		) {
			expect(output.value, `.value ${message}`).toBe(value);
			expect(output.defaultValue, `.defaultValue ${message}`).toBe(defaultValue);
		}

		context.test('Descendant mutations and output.value and .defaultValue', ({ document }) => {
			const output = document.createElement('output'),
				child = output.appendChild(document.createElement('span'));
			assert_equal_values(output, '', 'start');
			child.textContent = 'x';
			assert_equal_values(output, 'x', 'after setting textContent');
			output.value = 'some';
			assert_values(output, 'some', 'x', 'after setting value');
			output.textContent = 'y';
			assert_values(output, 'y', 'x', 'after setting textContent again');
		});
	}
}
