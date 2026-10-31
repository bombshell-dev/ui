import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#the-input-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('sanitizes invalid numeric and calendar values', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		for (const [type, value, expected] of [
			['number', ' 3 ', ''],
			['number', 'Infinity', ''],
			['number', '1e2', '1e2'],
			['date', '2025-02-29', ''],
			['date', '2024-02-29', '2024-02-29'],
			['time', '24:00', ''],
			['datetime-local', '2024-03-02 09:30:00', '2024-03-02T09:30'],
		] as const) {
			input.type = type;
			input.value = value;
			expect(input.value).toBe(expected);
		}
	});

	context.test('sanitizes line endings for text and whitespace for URL values', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.value = 'a\r\nb\nc';
		expect(e.value).toBe('abc');
		e.type = 'url';
		e.value = '  https://example.test/a  ';
		expect(e.value).toBe('https://example.test/a');
	});

	context.test('normalizes invalid types and invalid numeric values', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'unknown';
		expect(e.type).toBe('text');
		e.type = 'number';
		e.value = 'not a number';
		expect(e.value).toBe('');
		e.value = '2.5';
		expect(e.valueAsNumber).toBe(2.5);
	});
}
