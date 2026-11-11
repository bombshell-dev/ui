import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test("textarea element's value should be cloned", ({ document }) => {
		let textarea = document.createElement('textarea');
		textarea.value = 'foo bar';

		let copy = textarea.cloneNode() as HTMLTextAreaElement;
		expect(copy.value).toBe('foo bar');
	});
	context.test(
		"textarea element's dirty value flag should be cloned, so setAttribute doesn't affect the cloned textarea's value",
		({ document }) => {
			let textarea = document.createElement('textarea');
			textarea.value = 'foo bar';

			let copy = textarea.cloneNode() as HTMLTextAreaElement;
			copy.setAttribute('value', 'something else');

			expect(copy.value).toBe('foo bar');
		},
	);
}
