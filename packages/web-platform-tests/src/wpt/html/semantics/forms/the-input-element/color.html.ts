import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const colors = [
		{ value: '', expected: '#000000', testname: 'Empty value should return #000000' },
		{ expected: '#000000', testname: 'Missing value should return #000000' },
		{
			value: '#ffffff',
			expected: '#ffffff',
			testname: 'Valid simple color: should return #ffffff',
		},
		{
			value: '#FFFFFF',
			expected: '#ffffff',
			testname:
				'Valid simple color (containing LATIN CAPITAL LETTERS): should return #ffffff (converted to ASCII lowercase)',
		},
		{ value: '#0F0F0F', expected: '#0f0f0f', testname: 'Zero-padding' },
		{ value: '#fff', expected: '#ffffff', testname: 'Valid simple color: 4 characters long' },
		{ value: '#fffffff', expected: '#000000', testname: 'Invalid simple color: 8 characters long' },
		{ value: 'fffffff', expected: '#000000', testname: 'Invalid simple color: no starting # sign' },
		{
			value: '#gggggg',
			expected: '#000000',
			testname: 'Invalid simple color: non ASCII hex digits',
		},
		{ value: 'foobar', expected: '#000000', testname: 'Invalid simple color: foobar' },
		{
			value: '#ffffff\u0000',
			expected: '#000000',
			testname: 'Invalid color: trailing Null (U+0000)',
		},
		{ value: '#ffffff;', expected: '#000000', testname: 'Invalid color: trailing ;' },
		{ value: ' #ffffff', expected: '#ffffff', testname: 'Valid color: leading space' },
		{ value: '#ffffff ', expected: '#ffffff', testname: 'Valid color: trailing space' },
		{ value: ' #ffffff ', expected: '#ffffff', testname: 'Valid color: leading+trailing spaces' },
		{ value: 'crimson', expected: '#dc143c', testname: 'Valid color: keyword crimson' },
		{ value: 'bisque', expected: '#ffe4c4', testname: 'Valid color: keyword bisque' },
		{ value: 'currentColor', expected: '#000000', testname: 'Valid color: currentColor' },
		{ value: 'transparent', expected: '#000000', testname: 'Invalid color: keyword transparent' },
		{ value: 'inherit', expected: '#000000', testname: 'Invalid color: keyword inherit' },
		{ value: 'rgb(1,1,1)', expected: '#010101', testname: 'Valid color: rgb(1,1,1)' },
		{ value: 'rgb(1,1,1,1)', expected: '#010101', testname: 'Valid color: rgb(1,1,1,1)' },
		{
			value: '#FFFFF\u1F4A9',
			expected: '#000000',
			testname: 'Invalid color: PILE OF POO (U+1F4A9)',
		},
		{
			value: 'hsl(150deg 100 53.5)',
			expected: '#12ff88',
			testname: 'Valid color: hsl(150deg 100 53.5)',
		},
		{
			value: 'color(display-p3 .5 0 0)',
			expected: '#8c0000',
			testname: 'Valid color: color(display-p3 .5 0 0)',
		},
		{
			value: 'color(display-p3 1 0 0)',
			expected: '#ff0000',
			testname: 'Valid color: color(display-p3 1 0 0)',
		},
	];

	for (const w of colors) {
		context.test(w.testname, ({ document }) => {
			let input = document.createElement('input');
			input.type = 'color';
			input.value = w.value as string;
			expect(input.value).toBe(w.expected);
		});
	}
	context.test('System colors are parsed', ({ document }) => {
		const input = document.createElement('input');
		input.type = 'color';
		expect(input.value).toBe('#000000');
		input.value = 'ActiveBorder';
		expect(input.value).not.toBe('#000000');
	});
}
