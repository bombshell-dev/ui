import type { CompatibilityContext } from '../../context.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element';
const requiredGlobals = ['HTMLSelectElement'] as const;
export { requiredGlobals as globals };
export const requires = ['elements.select.selection', 'node.cloning'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'reconstructs selection from cloned attributes rather than dirty selectedness',
		(fixture) => {
			const document = fixture.document;
			const select = document.createElement('select');
			const first = document.createElement('option');
			first.value = 'first';
			const second = document.createElement('option');
			second.value = 'second';
			select.append(first, second);
			select.value = 'second';
			const copy = select.cloneNode(true);
			const Constructor = fixture.globals('HTMLSelectElement');
			if (!(copy instanceof Constructor)) return expect.unreachable('Unexpected clone interface');
			// HTML has special value-copying steps for input and textarea, not option.
			expect(copy.value).toBe('first');
			expect(copy.options[0]).not.toBe(first);
			expect(copy.options[1]).not.toBe(second);
			copy.value = 'first';
			expect(select.value).toBe('second');
		},
	);

	context.test('deep clone owns independent options and shallow clone has none', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('select');
		e.innerHTML = '<option selected value=a>A</option><option value=b>B</option>';
		const copy = e.cloneNode(true) as HTMLSelectElement;
		expect(copy.value).toBe('a');
		expect(copy.options[0]).not.toBe(e.options[0]);
		copy.value = 'b';
		expect(e.value).toBe('a');
		expect((e.cloneNode(false) as HTMLSelectElement).options.length).toBe(0);
	});
}
