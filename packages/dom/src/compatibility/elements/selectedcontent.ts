import type { CompatibilityContext } from '../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#the-selectedcontent-element';
export const requires = ['elements.select.selection'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('copies selected option content without sharing node identity', (fixture) => {
		const document = fixture.document;
		const select = document.createElement('select');
		const button = document.createElement('button');
		const selected = document.createElement('selectedcontent');
		button.appendChild(selected);
		const first = document.createElement('option');
		const label = document.createElement('span');
		label.textContent = 'First';
		first.appendChild(label);
		const second = document.createElement('option');
		second.text = 'Second';
		select.append(button, first, second);
		fixture.connect(select);
		expect(selected.textContent).toBe('First');
		expect(selected.firstChild).not.toBe(label);
		select.selectedIndex = 1;
		expect(selected.textContent).toBe('Second');
	});
}
