import type { CompatibilityContext } from '../../../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<meta charset="utf-8">
<title>textarea validation behavior</title>








<textarea id=t1 minlength=5 required></textarea>
<textarea id=t2 minlength=5 required>a</textarea>
<textarea id=t3 required>a</textarea>
<textarea id=t4>a</textarea>


<textarea id=t5 minlength=5 required></textarea>


<textarea id=t6 minlength=5 required></textarea>


<textarea id=t7 minlength=5 required></textarea>


<textarea id=t8 minlength=5 required></textarea>


<style>
  :invalid { background-color: rgb(248, 203, 203); }
</style>
`;

		context.test(
			'Default validity based on emptiness',
			({ document }) => {
				const emptyMinlength = document.getElementById('t1') as HTMLTextAreaElement;
				const nonEmptyMinlength = document.getElementById('t2') as HTMLTextAreaElement;
				const nonEmptyRequired = document.getElementById('t3') as HTMLTextAreaElement;
				const nonEmptyNonRequired = document.getElementById('t4') as HTMLTextAreaElement;
				expect(
					emptyMinlength.validity.valid,
					'Empty textareas with constraints will validate',
				).toBe(false);
				expect(
					nonEmptyMinlength.validity.valid,
					'Non-empty textareas with constraints will *not* validate',
				).toBe(true);
				expect(nonEmptyRequired.validity.valid, 'Textareas without constraints will validate').toBe(
					true,
				);
				expect(
					nonEmptyNonRequired.validity.valid,
					'Textareas without constraints will validate',
				).toBe(true);
				[emptyMinlength, nonEmptyMinlength, nonEmptyRequired, nonEmptyNonRequired].forEach((t) =>
					t.remove(),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Setting textarea.defaultValue should not trigger validation',
			async ({ document }) => {
				const textarea = document.getElementById('t5') as HTMLTextAreaElement;
				document.querySelector('#t1');
				expect(
					textarea.validity.valid,
					'By default, this textarea will validate (and fail) because it started empty',
				).toBe(false);
				textarea.defaultValue = 'abc';
				expect(
					textarea.validity.valid,
					'Programmatically setting defaultValue is not a user edit - automatically valid',
				).toBe(true);
				textarea.replaceChildren('abcd');
				expect(
					textarea.validity.valid,
					'Programmatically replacing children is not a user edit - automatically valid',
				).toBe(true);
				textarea.defaultValue = 'abcde';
				expect(textarea.validity.valid, 'Still valid').toBe(true);
				textarea.remove();
			},
			{ document: { contentType: 'text/html', content } },
		);

		context.test(
			'User keystrokes should trigger validation',
			async ({ document, input }) => {
				for (const id of ['t1', 't2', 't3', 't4', 't5']) document.getElementById(id)!.remove();
				const textarea = document.getElementById('t6') as HTMLTextAreaElement;
				expect(
					textarea.validity.valid,
					'By default, this textarea will validate (and fail) because it started empty',
				).toBe(false);
				textarea.focus();
				for (const key of 'abc') await input.press(key);
				expect(
					textarea.validity.valid,
					'Keystrokes should trigger validation, which will fail (length 3)',
				).toBe(false);
				for (const key of 'de') await input.press(key);
				expect(textarea.value).toBe('abcde');
				expect(textarea.validity.valid, 'Now valid').toBe(true);
				textarea.remove();
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Setting textarea.defaultValue from the input event handler should trigger validation',
			async ({ document, input, step }) => {
				for (const id of ['t1', 't2', 't3', 't4', 't5', 't6'])
					document.getElementById(id)!.remove();
				const textarea = document.getElementById('t7') as HTMLTextAreaElement;
				textarea.addEventListener(
					'input',
					step((event) => {
						const target = event.target as HTMLTextAreaElement;
						target.defaultValue = target.value;
					}),
				);
				expect(
					textarea.validity.valid,
					'By default, this textarea will validate (and fail) because it started empty',
				).toBe(false);
				textarea.focus();
				for (const key of 'abc') await input.press(key);
				expect(textarea.value).toBe('abc');
				expect(textarea.validity.valid, 'Still invalid with 3 characters').toBe(false);
				for (const key of 'de') await input.press(key);
				expect(textarea.value).toBe('abcde');
				expect(textarea.validity.valid, 'With 5 characters, now valid').toBe(true);
				textarea.remove();
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Calling textarea.replaceChildren() from the input event handler should trigger validation',
			async ({ document, input, step }) => {
				for (const id of ['t1', 't2', 't3', 't4', 't5', 't6', 't7'])
					document.getElementById(id)!.remove();
				const textarea = document.getElementById('t8') as HTMLTextAreaElement;
				textarea.addEventListener(
					'input',
					step((event) => {
						const target = event.target as HTMLTextAreaElement;
						target.replaceChildren(target.value);
					}),
				);
				expect(
					textarea.validity.valid,
					'By default, this textarea will validate (and fail) because it started empty',
				).toBe(false);
				textarea.focus();
				for (const key of 'abc') await input.press(key);
				expect(textarea.value).toBe('abc');
				expect(textarea.validity.valid, 'Still invalid with 3 characters').toBe(false);
				for (const key of 'de') await input.press(key);
				expect(textarea.value).toBe('abcde');
				expect(textarea.validity.valid, 'With 5 characters, now valid').toBe(true);
				textarea.remove();
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
