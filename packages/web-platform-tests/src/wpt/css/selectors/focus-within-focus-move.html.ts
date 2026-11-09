import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"Moving focus from its own focus() call doesn't leave stale :focus-within state",
		({ document }) => {
			let wrapper = document.getElementById('wrapper')!;
			let outer = document.getElementById('outer')!;
			let tab = document.getElementById('tab')!;
			let input = document.getElementById('input')!;
			let outside = document.getElementById('outside')!;

			input.focus();
			expect(document.activeElement, 'activeElement after focus').toBe(input);
			expect(outer.matches(':focus-within'), 'outer matches :focus-within').toBe(true);
			expect(wrapper.matches(':focus-within'), 'wrapper matches :focus-within').toBe(true);
			// This ends up shifting to `outside` rather than `tab`.
			tab.focus();
			expect(document.activeElement, 'activeElement after trying to focus sibling').toBe(outside);
			expect(wrapper.matches(':focus-within'), 'wrapper still matches :focus-within').toBe(true);
			expect(outer.matches(':focus-within'), 'outer no longer matches :focus-within').toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!doctype html>
<meta charset="utf-8">
<title>Moving focus from its own focus() call doesn't leave stale :focus-within state</title>






<div id="wrapper">
  <div id="outer">
    <input id="tab">
    <input id="input" onblur="outside.focus()">
  </div>
  <input id="outside">
</div>

`,
			},
		},
	);
}
