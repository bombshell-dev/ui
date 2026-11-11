import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'inert on Shadow host affects content in shadow',
		({ document }) => {
			const shadowHost = document.getElementById('shadow-host')!;
			const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

			// Button 1 will be slotted
			const slot = document.createElement('slot');
			shadowRoot.appendChild(slot);

			const button2 = document.createElement('button');
			button2.id = 'button-2';
			button2.textContent = 'Button 2 (inert)';
			shadowRoot.appendChild(button2);

			function testCanFocus(selector: string, canFocus: boolean, opt_context?: ParentNode) {
				let context = opt_context || document;
				const element = context.querySelector<HTMLElement>(selector)!;
				let focusedElement: HTMLElement | null = null;
				element.addEventListener(
					'focus',
					function () {
						focusedElement = element;
					},
					false,
				);
				element.focus();
				expect(focusedElement === element).toBe(canFocus);
			}

			testCanFocus('#button-1', false);
			testCanFocus('#button-2', false, shadowRoot);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>inert on Shadow host affects content in shadow</title>
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
</head>
<body>
  <div>Buttons 1 and 2 should be inert.</div>
  <div id="shadow-host" inert>
    <button id="button-1">Button 1 (inert)</button>
  </div>
\x20\x20
</body>
</html>
`,
			},
		},
	);
}
