import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"Removing an element from its own focus() call doesn't leave stale :focus-within state",
		({ document }) => {
			let root = document.getElementById('root')!;
			let container = document.getElementById('container')!;
			let input = document.querySelector('input')!;

			input.focus();
			expect(document.activeElement, 'activeElement after focus').toBe(input);
			expect(container.matches(':focus-within'), 'container matches :focus-within').toBe(true);
			expect(root.matches(':focus-within'), 'root also matches :focus-within').toBe(true);
			// This fires from within the next focus() call
			input.addEventListener('focusout', () => {
				root.innerHTML = '';
			});
			// container is focusable, but gets removed before we get a chance at focusing it.
			container.focus();
			expect(document.activeElement, 'activeElement after trying to focus sibling').toBe(
				document.body,
			);
			expect(container.parentNode, 'container should get removed').toBe(null);
			expect(container.matches(':focus-within'), 'container no longer matches :focus-within').toBe(
				false,
			);
			expect(root.matches(':focus-within'), 'root no longer matches :focus-within').toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!doctype html>
<meta charset="utf-8">
<title>Removing an element from its own focus() call doesn't leave stale :focus-within state</title>






<div id="root">
  <div id="container" tabindex="-1">
    <input type="text">
  </div>
</div>

`,
			},
		},
	);
}
