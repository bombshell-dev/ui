import type { CompatibilityContext } from '../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('clamps exposed values while retaining reflected attributes', (fixture) => {
		const document = fixture.document;
		const progress = document.createElement('progress');
		expect(progress.max).toBe(1);
		expect(progress.value).toBe(0);
		expect(progress.position).toBe(-1);
		progress.max = 10;
		progress.value = 4;
		expect(progress.position).toBe(0.4);
		progress.value = 20;
		expect(progress.getAttribute('value')).toBe('20');
		expect(progress.value).toBe(10);
		expect(progress.position).toBe(1);
		progress.removeAttribute('value');
		expect(progress.position).toBe(-1);
	});

	context.test('clamps value and computes determinate position without layout', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('progress');
		expect(e.max).toBe(1);
		expect(e.value).toBe(0);
		expect(e.position).toBe(-1);
		e.max = 10;
		e.value = 20;
		expect(e.value).toBe(10);
		expect(e.position).toBe(1);
		e.value = -1;
		expect(e.value).toBe(0);
		e.removeAttribute('value');
		expect(e.position).toBe(-1);
	});
}
