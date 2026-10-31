import type { CompatibilityContext } from '../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-elements.html#the-optgroup-element';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects label and disabled without rewriting child attributes', (fixture) => {
		const document = fixture.document;
		const group = document.createElement('optgroup');
		const option = document.createElement('option');
		group.appendChild(option);
		group.label = 'Group';
		group.disabled = true;
		expect(group.getAttribute('label')).toBe('Group');
		expect(group.hasAttribute('disabled')).toBe(true);
		expect(option.disabled).toBe(false);
	});

	context.test('reflects disabled and label attributes with standard defaults', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('optgroup');
		expect(e.disabled).toBe(false);
		expect(e.label).toBe('');
		e.disabled = true;
		e.label = 'Group';
		expect(e.hasAttribute('disabled')).toBe(true);
		expect(e.getAttribute('label')).toBe('Group');
		e.removeAttribute('disabled');
		expect(e.disabled).toBe(false);
	});
}
