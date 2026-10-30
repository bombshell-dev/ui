import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('derives default thresholds and clamps values to the range', (fixture) => {
		const document = fixture.document;
		const meter = document.createElement('meter');
		expect(meter.min).toBe(0);
		expect(meter.max).toBe(1);
		expect(meter.optimum).toBe(0.5);
		meter.min = 10;
		meter.max = 20;
		meter.value = 25;
		expect(meter.value).toBe(20);
		expect(meter.getAttribute('value')).toBe('25');
		expect(meter.low).toBe(10);
		expect(meter.high).toBe(20);
		expect(meter.optimum).toBe(15);
	});

	context.test('clamps values to min/max and reflects explicit numeric attributes', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('meter');
		expect(e.min).toBe(0);
		expect(e.max).toBe(1);
		e.min = 2;
		e.max = 10;
		e.value = 20;
		expect(e.value).toBe(10);
		e.value = -1;
		expect(e.value).toBe(2);
		e.low = 4;
		e.high = 8;
		e.optimum = 6;
		expect(e.low).toBe(4);
		expect(e.high).toBe(8);
		expect(e.optimum).toBe(6);
	});
}
