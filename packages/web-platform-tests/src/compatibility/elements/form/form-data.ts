import type { DOMHTMLElement as DOMHTMLElementContract } from '../../contracts/nodes.ts';
import type { DOMFormElement as DOMFormElementContract } from '../../contracts/elements.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set';
const requiredGlobals = ['FormData'] as const;
export { requiredGlobals as globals };
export const requires = ['elements.input.value', 'elements.input.checkedness'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('collects successful named controls in tree order', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const input = document.createElement('input');
		input.name = 'answer';
		input.value = '42';
		const disabled = document.createElement('input');
		disabled.name = 'excluded';
		disabled.disabled = true;
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.name = 'agreed';
		form.append(input, disabled, checkbox);
		const FormData = fixture.globals('FormData');
		const initial = new FormData(form);
		expect(Array.from(initial.entries())).toEqual([['answer', '42']]);
		checkbox.checked = true;
		const checked = new FormData(form);
		expect(checked.get('agreed')).toBe('on');
	});

	context.test('serializes only successful named controls in tree order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form');
		form.innerHTML =
			'<input name=a value=one><input name=a value=two><input name=b disabled value=no><input value=no><input type=checkbox name=c value=yes><input type=checkbox checked name=d value=ok><button name=submit value=no>submit</button>';
		const FormData = fixture.globals('FormData');
		const data = new FormData(form as unknown as DOMFormElementContract);
		expect([...data.entries()]).toEqual([
			['a', 'one'],
			['a', 'two'],
			['d', 'ok'],
		]);
		expect(data.getAll('a')).toEqual(['one', 'two']);
		expect(data.get('missing')).toBeNull();
	});

	context.test('includes only the selected submitter and rejects invalid submitters', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			button = document.createElement('button'),
			foreign = document.createElement('button');
		button.name = 'go';
		button.value = 'yes';
		form.append(button);
		const FormData = fixture.globals('FormData');
		expect([
			...new FormData(
				form as unknown as DOMFormElementContract,
				button as unknown as DOMHTMLElementContract,
			).entries(),
		]).toEqual([['go', 'yes']]);
		expect(
			() =>
				new FormData(
					form as unknown as DOMFormElementContract,
					foreign as unknown as DOMHTMLElementContract,
				),
		).toThrow(expect.objectContaining({ name: 'NotFoundError' }));
	});
}
