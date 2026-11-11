import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (let i = 0; i < 14; i++)
		context.test(
			`Focus element ${i === 13 ? 'TEXTAREA' : 'INPUT'}#input${i + 1} via mouse should match :focus-visible as it supports keyboard input`,
			async (fixture) => {
				const { document } = fixture;
				const target = document.getElementById('input' + (i + 1))!;
				const getComputedStyle = fixture.getComputedStyle;
				const focused = new Promise<void>((resolve) =>
					target.addEventListener('focus', () => resolve()),
				);
				await fixture.input.click(target);
				await focused;
				expect(
					getComputedStyle(target).outlineColor,
					`outlineColor for ${target.tagName}#${target.id} should be green`,
				).toBe('rgb(0, 128, 0)');
				expect(
					getComputedStyle(target).backgroundColor,
					`backgroundColor for ${target.tagName}#${target.id} should NOT be red`,
				).not.toBe('rgb(255, 0, 0)');
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CSS Test (Selectors): :focus-visible always matches on texty input elements</title>
  <meta name="timeout" content="long">
  <link rel="author" title="Alice Boxhall" href="aboxhall@chromium.org" />
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
  This test checks that <code>:focus-visible</code> always matches on <code>&lt;input&gt;</code> elements which take text input, regardless of focus mechanism.
  <ol id="instructions">
    <li>If the user-agent does not claim to support the <code>:focus-visible</code> pseudo-class then SKIP this test.</li>
    <li><strong>Click</strong> each form element below to focus it.</li>
    <li>If the element has a red background, then the test result is FAILURE. If the element has a green outline, then the test result is SUCCESS.</li>
  </ol>
  <br>
  <div>
    <input class="check" id="input1" value="Focus me.">
  </div>
  <div>
    <input class="check" id="input2" type="text" value="Focus me.">
  </div>
  <div>
    <input class="check" id="input3" type="email" value="Focus me.">
  </div>
   <div>
    <input class="check" id="input4" type="password" value="Focus me.">
  </div>
  <div>
    <input class="check" id="input5" type="search" value="Focus me.">
  </div>
  <div>
    <input class="check" id="input6" type="telephone" value="Focus me.">
  </div>
  <div>
    <input class="check" id="input7" type="url" value="Focus me.">
  </div>
  <div>
    <input class="check" id="input8" type="number" value="10000">
  </div>
  <div>
    <input class="check" id="input9" type="date">
  </div>
  <div>
    <input class="check" id="input10" type="datetime-local">
  </div>
  <div>
    <input class="check" id="input11" type="month">
  </div>
  <div>
    <input class="check" id="input12" type="time">
  </div>
  <div>
    <input class="check" id="input13" type="week">
  </div>
  <div>
    <textarea class="check" id="input14">Focus me.</textarea>
  </div>
\x20\x20
</body>
</html>
`,
				},
			},
		);
}
