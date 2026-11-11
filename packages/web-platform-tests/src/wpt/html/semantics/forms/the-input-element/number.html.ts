import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const numbers = [
		{ value: '', expected: '', testname: 'empty value' },
		{ value: '11', expected: '11', testname: 'value = 11' },
		{ value: '11.12', expected: '11.12', testname: 'value = 11.12' },
		{ value: '-11111', expected: '-11111', testname: 'value = -11111' },
		{ value: '-11111.123', expected: '-11111.123', testname: 'value = -11111.123' },
		{ value: '1e2', expected: '1e2', testname: 'value = 1e2' },
		{ value: '1E2', expected: '1E2', testname: 'value = 1E2' },
		{ value: '1e+2', expected: '1e+2', testname: 'value = 1e+2' },
		{ value: '1e-2', expected: '1e-2', testname: 'value = 1e-2' },
		{ value: '1d+2', expected: '', testname: 'value is not a valid floating-point number: 1d+2' },
		{
			value: 'foobar',
			expected: '',
			testname: 'value not a valid floating-point number: random string',
		},
		{ value: '11', attributes: { min: '10' }, expected: '11', testname: 'Value >= min attribute' },
		{ value: '9', attributes: { min: '10' }, expected: '9', testname: 'Value < min attribute' },
		{ value: '19', attributes: { max: '20' }, expected: '19', testname: 'Value <= max attribute' },
		{ value: '21', attributes: { max: '20' }, expected: '21', testname: 'Value > max attribute' },
		{ value: '.1', expected: '.1', testname: "value with a leading '.'" },
		{ value: '1.', expected: '', testname: "value ending with '.'" },
		{ value: '-0', expected: '-0', testname: 'value = -0' },
		{ value: 'Infinity', expected: '', testname: ' value = Infinity' },
		{ value: '-Infinity', expected: '', testname: 'value = -Infinity' },
		{ value: 'NaN', expected: '', testname: 'value = NaN' },
		{ value: '9007199254740993', expected: '9007199254740993', testname: 'value = 2^53+1' },
		{ value: '2e308', expected: '', testname: 'value >= Number.MAX_VALUE' },
		{ value: '1e', expected: '', testname: 'value = 1e' },
		{ value: '+1', expected: '', testname: 'value = +1' },
		{ value: '+', expected: '', testname: "value = '+'" },
		{ value: '-', expected: '', testname: "value = '-'" },
		{ value: '\t1', expected: '', testname: 'value with a leading tab' },
		{ value: '\n1', expected: '', testname: 'value with a leading newline' },
		{ value: '\f1', expected: '', testname: 'value with a leading form feed' },
		{ value: '\r1', expected: '', testname: 'value with a leading carriage return' },
		{ value: ' 1', expected: '', testname: 'value with a leading space' },
		{ value: '1trailing junk', expected: '', testname: 'value = 1trailing junk' },
		{ value: '１２３', expected: '', testname: 'full-width digits' },
	];

	for (const w of numbers) {
		context.test(w.testname, ({ document }) => {
			let input = document.createElement('input');
			input.type = 'number';
			input.value = w.value;
			for (let attr in w.attributes) {
				(input as unknown as Record<string, string>)[attr] = (
					w.attributes as Record<string, string | undefined>
				)[attr]!;
			}
			expect(input.value).toBe(w.expected);
		});
	}
}
