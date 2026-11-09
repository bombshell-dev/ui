import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api';
export const requires = ['elements.input.validation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('checks each invalid candidate without stopping at the first', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const first = document.createElement('input');
		const second = document.createElement('input');
		first.required = second.required = true;
		form.append(first, second);
		const invalid: string[] = [];
		first.addEventListener('invalid', () => invalid.push('first'));
		second.addEventListener('invalid', () => invalid.push('second'));
		expect(form.checkValidity()).toBe(false);
		expect(invalid).toEqual(['first', 'second']);
		first.value = second.value = 'ready';
		expect(form.checkValidity()).toBe(true);
	});

	context.test('dispatches nonbubbling invalid events on every invalid control', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			a = document.createElement('input'),
			b = document.createElement('input');
		a.required = b.required = true;
		form.append(a, b);
		const seen: unknown[] = [];
		form.addEventListener('invalid', () => seen.push('bubble'));
		form.addEventListener(
			'invalid',
			(event) => {
				seen.push(event.target);
				event.preventDefault();
			},
			true,
		);
		expect(form.checkValidity()).toBe(false);
		expect(seen).toEqual([a, b]);
	});
}
