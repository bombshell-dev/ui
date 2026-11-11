import type { CompatibilityContext } from '../../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Clicking on a div element and having a click event listener on only document',
		async ({ document, Event, step, input }) => {
			const clicked = new Promise<void>((resolve) =>
				document.addEventListener(
					'click',
					function (event) {
						const square = document.getElementById('square')! as HTMLElement;
						step(function () {
							expect(event.target, 'target of click event must be the test square').toBe(square);
							expect(
								event.eventPhase,
								'click event must propagate to the document object during the Bubbling Phase',
							).toBe(Event.BUBBLING_PHASE);
							square.textContent = 'PASS';
							square.style.backgroundColor = 'green';
							resolve();
						})();
					},
					false,
				),
			);

			await input.click(document.getElementById('square')!);
			await clicked;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Clicking on a div element that has no click event handler fires a click event</title>
    <link rel="author" title="Chris Rebert" href="http://chrisrebert.com">
    <link rel="help" href="https://w3c.github.io/uievents/#event-type-click">
    <link rel="help" href="https://dom.spec.whatwg.org/#concept-event-dispatch">
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
    <style>
#square {
  width: 100px;
  height: 100px;
  background-color: blue;
  color: white;
  /* Center the "Click me" text */
  line-height: 100px;
  text-align: center;
}
    </style>
  </head>
  <body>
    <p>Click on the blue square below.</p>
    <div id="square">Click me</div>
\x20\x20\x20\x20
  </body>
</html>
`,
			},
		},
	);
}
