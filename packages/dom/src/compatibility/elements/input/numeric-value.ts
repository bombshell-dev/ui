import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#dom-input-valueasnumber';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('converts numeric values and clears NaN', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		input.type = 'number';
		expect(Number.isNaN(input.valueAsNumber)).toBe(true);
		input.value = '1.5';
		expect(input.valueAsNumber).toBe(1.5);
		input.valueAsNumber = 42;
		expect(input.value).toBe('42');
		input.valueAsNumber = Number.NaN;
		expect(input.value).toBe('');
		input.type = 'text';
		expect(Number.isNaN(input.valueAsNumber)).toBe(true);
		expect(() => {
			input.valueAsNumber = 1;
		}).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
	});

	context.test('represents empty numeric values as NaN and rejects infinity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'number';
		expect(Number.isNaN(e.valueAsNumber)).toBe(true);
		e.valueAsNumber = 3.5;
		expect(e.value).toBe('3.5');
		e.valueAsNumber = NaN;
		expect(e.value).toBe('');
		expect(() => {
			e.valueAsNumber = Infinity;
		}).toThrow(expect.objectContaining({ name: 'TypeError' }));
	});
}
