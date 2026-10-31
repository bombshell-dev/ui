import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/forms.html#the-label-element';
export const requires = ['elements.input.activation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('does not forward activation from an interactive descendant', (fixture) => {
		const document = fixture.document;
		const label = document.createElement('label');
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		const button = document.createElement('button');
		button.type = 'button';
		label.append(checkbox, button);
		fixture.connect(label);
		button.click();
		expect(checkbox.checked).toBe(false);
		checkbox.click();
		expect(checkbox.checked).toBe(true);
	});

	context.test('canceling label click prevents forwarded control activation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const label = document.createElement('label'),
			e = document.createElement('input');
		e.type = 'checkbox';
		label.append(e);
		fixture.connect(label as unknown as DOMElementContract);
		label.addEventListener('click', (event) => event.preventDefault());
		label.click();
		expect(e.checked).toBe(false);
	});

	context.test('does not forward activation through a disabled associated control', (fixture) => {
		const document = fixture.document as unknown as Document;
		const label = document.createElement('label'),
			e = document.createElement('input');
		e.type = 'checkbox';
		e.disabled = true;
		label.append(e);
		fixture.connect(label as unknown as DOMElementContract);
		let n = 0;
		e.addEventListener('click', () => n++);
		label.click();
		expect(n).toBe(0);
		expect(e.checked).toBe(false);
	});
}
