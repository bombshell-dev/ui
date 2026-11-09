import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Keyboard focus should match :focus-visible',
		async ({ document, getComputedStyle, step, input }) => {
			const el = document.getElementById('el')! as HTMLElement;
			const focused = new Promise<void>((resolve) =>
				el.addEventListener(
					'focus',
					step(() => {
						expect(
							getComputedStyle(el).outlineColor,
							`outlineColor for ${el.tagName}#${el.id} should be green`,
						).toBe('rgb(0, 128, 0)');
						expect(
							getComputedStyle(el).backgroundColor,
							`backgroundColor for ${el.tagName}#${el.id} should NOT be red`,
						).not.toBe('rgb(255, 0, 0)');

						let focusVisiblePseudoAll = document.querySelectorAll(':focus-visible');
						expect(focusVisiblePseudoAll.length, "Only 1 element matches ':focus-visible'").toBe(1);
						let focusVisiblePseudo = document.querySelector(':focus-visible');
						expect(el, "${el.tagName}#${el.id} matches ':focus-visible'").toBe(focusVisiblePseudo);
						resolve();
					}),
				),
			);
			el.focus();
			await input.press('Tab');
			await focused;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CSS Test (Selectors): Keyboard focus enables :focus-visible</title>
  <link rel="author" title="Rob Dodson" href="robdodson@chromium.org" />
  <link rel="help" href="https://drafts.csswg.org/selectors-4/#the-focus-visible-pseudo" />
\x20\x20
\x20\x20
\x20\x20
\x20\x20
\x20\x20
  <style>
    @supports not selector(:focus-visible) {
      :focus {
        outline: red solid 5px;
        background-color: red;
      }
    }

    :focus-visible {
      outline: green solid 5px;
    }

    :focus:not(:focus-visible) {
      outline: 0;
      background-color: red;
    }
  </style>
</head>
<body>
  This test checks that using the Tab key to navigate focus to an element triggers <code>:focus-visible</code> matching.
  <ol id="instructions">
    <li>If the user-agent does not claim to support the <code>:focus-visible</code> pseudo-class then SKIP this test.</li>
    <li>Use the TAB key on the keyboard to focus the element below that says "Focus me."</li>
    <li>If the element has a red background, then the test result is FAILURE. If the element has a green outline, then the test result is SUCCESS.</li>
  </ol>
  <br>
  <div id="el" tabindex="0">Focus me.</div>
\x20\x20
</body>
</html>
`,
			},
		},
	);
}
