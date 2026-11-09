import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/html/semantics/forms/the-input-element/radio-disconnected-group-owner.html';
export const requires = ['elements.input.checkedness'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('groups radios by tree and nonempty name', (fixture) => {
		const document = fixture.document;
		const root = document.createElement('div');
		const first = document.createElement('input');
		const second = document.createElement('input');
		first.type = second.type = 'radio';
		first.name = second.name = 'choice';
		root.append(first, second);
		first.checked = true;
		second.checked = true;
		expect(first.checked, 'setting checked in a detached group deselects its peer').toBe(false);
		expect(second.checked).toBe(true);
		first.name = 'other';
		first.checked = true;
		expect(second.checked).toBe(true);
		first.name = 'choice';
		expect(second.checked, 'changing a checked radio name updates its detached group').toBe(false);
	});

	context.test('keeps empty names independent and scopes named groups to forms', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			a = document.createElement('input'),
			b = document.createElement('input');
		a.type = b.type = 'radio';
		form.append(a, b);
		a.checked = b.checked = true;
		expect(a.checked).toBe(true);
		expect(b.checked).toBe(true);
		a.name = b.name = 'group';
		a.checked = true;
		b.checked = true;
		expect(a.checked).toBe(false);
		expect(b.checked).toBe(true);
	});
}
