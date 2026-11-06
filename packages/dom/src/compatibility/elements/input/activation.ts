import type { DOMEvent } from '../../contracts/events.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox)';
export const requires = ['elements.input.checkedness', 'events.dispatch.cancellation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('runs checkbox preactivation and restores canceled checkedness', (fixture) => {
		const document = fixture.document;
		const input = document.createElement('input');
		input.type = 'checkbox';
		input.indeterminate = true;
		fixture.connect(input);
		const preactivation: boolean[][] = [];
		const cancel = (event: DOMEvent): void => {
			preactivation.push([input.checked, input.indeterminate]);
			event.preventDefault();
		};
		input.addEventListener('click', cancel);
		input.click();
		expect(preactivation).toEqual([[true, false]]);
		expect(input.checked).toBe(false);
		expect(input.indeterminate).toBe(true);
		input.removeEventListener('click', cancel);
		input.click();
		expect(input.checked).toBe(true);
		expect(input.indeterminate).toBe(false);
	});

	context.test('checkbox canceled click rolls back checked and indeterminate state', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		e.type = 'checkbox';
		e.indeterminate = true;
		let during: unknown;
		let changes = 0;
		e.addEventListener('click', (event) => {
			during = [e.checked, e.indeterminate];
			event.preventDefault();
		});
		e.addEventListener('change', () => changes++);
		e.click();
		expect(during).toEqual([true, false]);
		expect(e.checked).toBe(false);
		expect(e.indeterminate).toBe(true);
		expect(changes).toBe(0);
	});
}
