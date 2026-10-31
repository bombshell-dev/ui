import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element';
export const requires = ['elements.form.submission', 'events.dispatch.cancellation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('click submits the owning form and disabled suppresses activation', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const button = document.createElement('button');
		form.appendChild(button);
		fixture.connect(form);
		let submissions = 0;
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			submissions++;
		});
		button.click();
		expect(submissions).toBe(1);
		button.disabled = true;
		button.click();
		expect(submissions).toBe(1);
	});

	context.test('canceled click prevents submit activation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			button = document.createElement('button');
		form.append(button);
		fixture.connect(form as unknown as DOMElementContract);
		let submits = 0;
		form.addEventListener('submit', (event) => {
			event.preventDefault();
			submits++;
		});
		button.addEventListener('click', (event) => event.preventDefault());
		button.click();
		expect(submits).toBe(0);
	});
}
