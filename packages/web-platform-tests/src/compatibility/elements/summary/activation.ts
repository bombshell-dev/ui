import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interactive-elements.html#the-summary-element';
export const requires = ['elements.details.open', 'events.dispatch.cancellation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'toggles details only through the first summary and honors cancellation',
		(fixture) => {
			const document = fixture.document;
			const details = document.createElement('details');
			const first = document.createElement('summary');
			const second = document.createElement('summary');
			details.append(first, second);
			second.click();
			expect(details.open).toBe(false);
			first.click();
			expect(details.open).toBe(true);
			first.addEventListener('click', (event) => {
				event.preventDefault();
			});
			first.click();
			expect(details.open).toBe(true);
		},
	);

	context.test('only the first summary has details activation behavior', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('details'),
			a = document.createElement('summary'),
			b = document.createElement('summary');
		e.append(a, b);
		fixture.connect(e as unknown as DOMElementContract);
		b.click();
		expect(e.open).toBe(false);
		a.click();
		expect(e.open).toBe(true);
		a.click();
		expect(e.open).toBe(false);
	});

	context.test('canceled summary click leaves details state unchanged', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('details'),
			s = document.createElement('summary');
		e.append(s);
		fixture.connect(e as unknown as DOMElementContract);
		s.addEventListener('click', (event) => event.preventDefault());
		s.click();
		expect(e.open).toBe(false);
	});
}
