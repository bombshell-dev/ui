import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#dom-htmloptionscollection-setter';
export const wpt =
	'https://github.com/web-platform-tests/wpt/tree/master/html/semantics/forms/the-select-element';
export const requires = ['elements.select.options'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('supports the standard indexed options setter', (fixture) => {
		const document = fixture.document;
		const select = document.createElement('select');
		const original = document.createElement('option');
		const replacement = document.createElement('option');
		select.appendChild(original);
		select.options[0] = replacement;
		expect(select.options[0]).toBe(replacement);
		expect(replacement.parentNode).toBe(select);
		expect(original.parentNode).toBeNull();
		expect(select.length).toBe(1);
		select.options[0] = null;
		expect(select.length).toBe(0);
		expect(replacement.parentNode).toBeNull();
	});

	context.test(
		'replaces and deletes indexed options while retaining collection identity',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('select'),
				a = document.createElement('option'),
				b = document.createElement('option'),
				options = e.options;
			e.add(a);
			e[0] = b;
			expect(e.options).toBe(options);
			expect(options[0]).toBe(b);
			expect(a.parentNode).toBeNull();
			Reflect.set(e, 0, null);
			expect(options.length).toBe(0);
		},
	);

	context.test('setting length grows with empty options and truncates children', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('select');
		e.options.length = 3;
		expect(e.options.length).toBe(3);
		expect(e.options[2]!.value).toBe('');
		const last = e.options[2]!;
		e.options.length = 1;
		expect(last.parentNode).toBeNull();
		expect(e.options.length).toBe(1);
	});
}
