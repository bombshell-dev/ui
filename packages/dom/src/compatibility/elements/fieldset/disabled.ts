import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute';
export const requires = ['elements.input.validation'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('exempts descendants of the first legend from disabled inheritance', (fixture) => {
		const document = fixture.document;
		const fieldset = document.createElement('fieldset');
		const legend = document.createElement('legend');
		const exempt = document.createElement('input');
		const blocked = document.createElement('input');
		legend.appendChild(exempt);
		fieldset.append(legend, blocked);
		fieldset.disabled = true;
		expect(exempt.willValidate).toBe(true);
		expect(blocked.willValidate).toBe(false);
		expect(blocked.disabled).toBe(false);
		fieldset.disabled = false;
		expect(blocked.willValidate).toBe(true);
	});

	context.test(
		'exempts only descendants of the first legend from disabled validation',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const f = document.createElement('fieldset'),
				a = document.createElement('legend'),
				b = document.createElement('legend'),
				x = document.createElement('input'),
				y = document.createElement('input'),
				z = document.createElement('input');
			a.append(x);
			b.append(y);
			f.append(a, b, z);
			f.disabled = true;
			expect(x.willValidate).toBe(true);
			expect(y.willValidate).toBe(false);
			expect(z.willValidate).toBe(false);
			expect(z.disabled).toBe(false);
		},
	);
}
