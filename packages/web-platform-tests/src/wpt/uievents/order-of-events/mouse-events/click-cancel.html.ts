import type { CompatibilityContext } from '../../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Default action is canceled if the click event is canceled.',
		async ({ document, step, input }) => {
			let box_clicked = false;
			const box = document.getElementById('checkbox')! as HTMLInputElement;
			box.addEventListener('click', (event) => {
				box_clicked = true;
				event.preventDefault();
			});
			const button = document.getElementById('button')!;
			const clicked = new Promise<void>((resolve) =>
				button.addEventListener(
					'click',
					step(() => {
						expect(box_clicked).toBe(true);
						expect(box.checked).toBe(false);
						resolve();
					}),
				),
			);
			await input.click(box);
			await input.click(button);
			await clicked;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Default action is canceled if the click event is canceled.</title>
    <link rel="help" href="https://w3c.github.io/uievents/#events-clickevent-event-order">
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
  <body>
    <input type="checkbox" id="checkbox">Check me!<br>
    <button type="button" id="button">Button</button>
\x20\x20\x20\x20
  </body>
</html>
`,
			},
		},
	);
}
