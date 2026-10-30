import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/input.html#dom-input-stepup';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('steps within numeric constraints and rejects any', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		input.type = 'number';
		input.min = '1';
		input.max = '9';
		input.step = '2';
		input.value = '3';
		input.stepUp(2);
		expect(input.value).toBe('7');
		input.stepDown();
		expect(input.value).toBe('5');
		input.stepUp(99);
		expect(input.value).toBe('9');
		input.step = 'any';
		expect(() => input.stepUp()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
	});

	context.test('steps relative to min and rejects step any', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'number';
		e.min = '1';
		e.step = '2';
		e.value = '3';
		e.stepUp(2);
		expect(e.value).toBe('7');
		e.stepDown();
		expect(e.value).toBe('5');
		e.step = 'any';
		expect(() => e.stepUp()).toThrow(expect.objectContaining({ name: 'InvalidStateError' }));
	});
}
