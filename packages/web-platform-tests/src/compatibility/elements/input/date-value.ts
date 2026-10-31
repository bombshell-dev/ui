import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#dom-input-valueasdate';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reads and writes UTC dates', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		input.type = 'date';
		expect(input.valueAsDate).toBeNull();
		input.value = '2024-02-29';
		const date = input.valueAsDate;
		if (!date) return expect.fail('Expected a date for a valid date value');
		expect(date.getTime()).toBe(Date.UTC(2024, 1, 29));
		input.valueAsDate = new Date(Date.UTC(2025, 5, 3));
		expect(input.value).toBe('2025-06-03');
		input.valueAsDate = null;
		expect(input.value).toBe('');
	});

	context.test('sanitizes invalid dates and represents empty dates as null and NaN', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'date';
		e.value = '2023-02-29';
		expect(e.value).toBe('');
		expect(e.valueAsDate).toBeNull();
		expect(Number.isNaN(e.valueAsNumber)).toBe(true);
		e.value = '2024-02-29';
		expect(e.valueAsNumber).toBe(Date.UTC(2024, 1, 29));
	});

	context.test('writes date values using UTC calendar components', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'date';
		e.valueAsDate = new Date(Date.UTC(2024, 0, 2, 23));
		expect(e.value).toBe('2024-01-02');
		e.valueAsDate = null;
		expect(e.value).toBe('');
	});
}
