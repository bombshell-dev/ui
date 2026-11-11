import type { CompatibilityContext } from '../../../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"Elements with different tabindex must be focused sequentially when pressing 'Tab' keys",
		async ({ document, input, step }) => {
			let i = 0;
			const expectation = ['btn9', 'btn6', 'btn7', 'btn8', 'btn5', 'btn0', 'btn1', 'btn2', 'btn4'];
			const results: string[] = [];
			document.body.focus();
			let queue = Promise.resolve();
			let finish!: () => void;
			const finished = new Promise<void>((resolve) => (finish = resolve));
			function tab() {
				queue = queue.then(async () => {
					document.body.focus();
					await input.press('Tab');
				});
			}
			document.forms.namedItem('fm')!.addEventListener(
				'focus',
				step((evt) => {
					results.push((evt.target as Element).id);
					if (i >= 8) {
						expect(results).toEqual(expectation);
						finish();
					} else tab();
					i++;
				}),
				true,
			);
			document.addEventListener(
				'keydown',
				step((evt) => expect(evt.keyCode, "Please press 'Tab' key.").toBe(9)),
				true,
			);
			tab();
			await finished;
			await queue;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<meta charset="utf-8">
<title>HTML Test: focus - the sequential focus navigation order</title>
<meta name="timeout" content="long">
<link rel="author" title="Intel" href="http://www.intel.com/">
<link rel="help" href="https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation">
<meta assert="flag" content="interact">
<meta assert="assert" content="Check the sequential focus navigation order">




<div id="log"></div>
<form id="fm">
  <button id="btn0">tabindex(omitted)</button>
  <button id="btn1" tabindex="">tabindex(empty)</button>
  <button id="btn2" tabindex="a">tabindex(a)</button>
  <button id="btn3" tabindex="-1">tabindex(-1)</button>
  <button id="btn4" tabindex="0">tabindex(0)</button>
  <button id="btn5" tabindex="3">tabindex(3)</button>
  <button id="btn6" tabindex="2">tabindex(2)</button>
  <button id="btn7" tabindex="2">tabindex(2)</button>
  <button id="btn8" tabindex="2">tabindex(2)</button>
  <button id="btn9" tabindex="1">tabindex(1)</button>
</form>

`,
			},
		},
	);
}
