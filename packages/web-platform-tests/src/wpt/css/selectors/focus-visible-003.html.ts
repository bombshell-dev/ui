import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['mouse'] as const;

const markup = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CSS Test (Selectors): :focus-visible does not match on non-texty inputs</title>
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
      outline: red solid 5px;
    }

    :focus:not(:focus-visible) {
        outline: 0;
        background-color: lime;
    }
  </style>
</head>
<body>
  This test checks that <code>:focus-visible</code> is <em>not</em> triggered by mouse focus on <code>&lt;input&gt;</code> elements which do not take text input.
  <ol id="instructions">
    <li>If the user-agent does not claim to support the <code>:focus-visible</code> pseudo-class then SKIP this test.</li>
    <li>Click each element element below to focus it.</li>
    <li>If the element has a red outline, then the test result is FAILURE. If the element has a green background, then the test result is SUCCESS.</li>
  </ol>
  <br />
  <div>
    <span class="check" id="el-1" tabindex="1">Focus me</span>
  </div>
  <div>
    <span class="check" id="el-2" tabindex="-1">Focus me</span>
  </div>
  <div>
    <span class="check" id="el-3" tabindex="0">Focus me</span>
  </div>
  <div>
    <button class="check" id="el-4">Focus me</button>
  </div>
  <div>
    <input class="check" id="el-5" type="button" value="Focus me">
  </div>
  <div>
    <input class="check" id="el-6" type="image" alt="Focus me.">
  </div>
  <div>
    <input class="check" id="el-7" type="reset" value="Focus me.">
  </div>
  <div>
    <input class="check" id="el-8" type="submit" value="Focus me.">
  </div>
  <div>
    <label><input class="check" id="el-9" type="checkbox"> Focus me.</label>
  </div>
  <div>
    <label><input class="check" id="el-10" type="radio"> Focus me.</label>
  </div>
  <div>
    <!-- Focusing file input triggers a modal, so only test manually -->
    <input id="el-11" type="file" value="Focus me.">
  </div>
  <div>
    <label><input class="check" id="el-12" type="range"> Focus me.</label>
  </div>
  <div>
    <!-- Ensure the color input is last, as it has a pop-up which obscures other elements -->
    <label><input class="check" id="el-13" type="color"> Focus me.</label>
  </div>
\x20\x20
</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const elements = [
		['SPAN', 'el-1'],
		['SPAN', 'el-2'],
		['SPAN', 'el-3'],
		['BUTTON', 'el-4'],
		['INPUT', 'el-5'],
		['INPUT', 'el-6'],
		['INPUT', 'el-7'],
		['INPUT', 'el-8'],
		['INPUT', 'el-9'],
		['INPUT', 'el-10'],
		['INPUT', 'el-12'],
		['INPUT', 'el-13'],
	];
	for (const [tagName, id] of elements) {
		context.test(
			`Focus element ${tagName}#${id} via mouse should NOT match :focus-visible as it does NOT support keyboard input`,
			async ({ document, input, getComputedStyle }) => {
				const target = document.getElementById(id!)!;
				const focused = new Promise<void>((resolve) =>
					target.addEventListener('focus', () => resolve()),
				);
				await input.click(target);
				await focused;
				expect(
					getComputedStyle(target).backgroundColor,
					`backgroundColor for ${target.tagName}#${target.id} should be lime`,
				).toBe('rgb(0, 255, 0)');
				expect(
					getComputedStyle(target).outlineColor,
					`outlineColor for ${target.tagName}#${target.id} should NOT be red`,
				).not.toBe('rgb(255, 0, 0)');
			},
			{ document: { contentType: 'text/html', content: markup } },
		);
	}
}
