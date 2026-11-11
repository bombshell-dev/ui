import type { CompatibilityContext } from '../../../../shared/context.ts';

const markup = `<!DOCTYPE html>



<body>
<div id="default-samples">
<a></a>
<a href=""></a>
<button></button>
<input type="hidden">
<input type="button">
<select><option>abc</option></select>
<textarea></textarea>
<summary id="summary-out"></summary>
<details open><summary id="summary-first"></summary><summary id="summary-second"></summary></details>
<div contenteditable="true"></div>
<iframe></iframe>
<svg><a id="svg-a"></a></svg>
<svg><text id="svg-text"></text></svg>
<img>
</div>


<div id="tabindex-0">
<a tabindex="0"></a>
<svg><a tabindex="0"></a></svg>
<svg><text tabindex="0"></text></svg>
<summary tabindex="0" id="summary-out-tabindex0"></summary>
<details open><summary id="summary-first"></summary><summary tabindex="0" id="summary-second-tabindex0"></summary></details>
<img tabindex="0">
</div>


<div id="tabindex-negative">
<a tabindex="-1"></a>
<svg><a tabindex="-1"></a></svg>
<svg><text tabindex="-1"></text></svg>
<summary tabindex="-1" id="summary-out-tabindex-negative"></summary>
<details open><summary id="summary-first"></summary><summary tabindex="0" id="summary-second-tabindex-negative"></summary></details>
<img tabindex="-1">
</div>


<div id="tabindex-invalid">
<a tabindex="invalid"></a>
<a href="#" tabindex="invalid" id="with-href" data-focusable=true></a>
<svg><a tabindex="invalid"></a></svg>
<svg><a href="#" tabindex="invalid" id="with-href" data-focusable=true></a></svg>
<svg><text tabindex="invalid"></text></svg>
<div tabindex="invalid"></div>
<summary tabindex="invalid" id="summary-out-tabindex-invalid"></summary>
<img tabindex="invalid">
</div>

</body>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const entry of [
		['a', false],
		['a[href]', true],
		['button', true],
		['input[type="hidden"]', false],
		['input[type="button"]', true],
		['select', true],
		['textarea', true],
		['#summary-out', false],
		['#summary-first', true],
		['#summary-second', false],
		['[contenteditable]', true],
		['iframe', true],
		['#svg-a', false],
		['#svg-text', false],
		['img', false],
	] as const) {
		context.test(
			entry[0] + ' should ' + (entry[1] ? '' : 'not ') + 'be focusable by default.',
			({ document }) => {
				let element = document.querySelector<HTMLElement>('#default-samples ' + entry[0])!;
				element.focus();
				if (entry[1]) expect(document.activeElement).toBe(element);
				else expect(document.activeElement).not.toBe(element);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
	}
	for (const [index, elementDesc, focusable] of [
		[0, 'A', false],
		[1, 'a', false],
		[2, 'text', false],
		[3, 'SUMMARY#summary-out-tabindex0', false],
		[4, 'SUMMARY#summary-second-tabindex0', false],
		[5, 'IMG', false],
	] as const) {
		context.test(
			elementDesc + ' with tabindex=0 should be focusable.',
			({ document }) => {
				const element = document.querySelectorAll<HTMLElement>('#tabindex-0 [tabindex]')[index]!;

				element.focus();
				expect(document.activeElement).toBe(element);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
	}
	for (const [index, elementDesc, focusable] of [
		[0, 'A', false],
		[1, 'a', false],
		[2, 'text', false],
		[3, 'SUMMARY#summary-out-tabindex-negative', false],
		[4, 'SUMMARY#summary-second-tabindex-negative', false],
		[5, 'IMG', false],
	] as const) {
		context.test(
			elementDesc + ' with tabindex=-1 should be focusable.',
			({ document }) => {
				const element = document.querySelectorAll<HTMLElement>('#tabindex-negative [tabindex]')[
					index
				]!;

				element.focus();
				expect(document.activeElement).toBe(element);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
	}
	for (const [index, elementDesc, focusable] of [
		[0, 'A', false],
		[1, 'A#with-href', true],
		[2, 'a', false],
		[3, 'a#with-href', true],
		[4, 'text', false],
		[5, 'DIV', false],
		[6, 'SUMMARY#summary-out-tabindex-invalid', false],
		[7, 'IMG', false],
	] as const) {
		context.test(
			`${elementDesc} with tabindex=invalid should ${focusable ? 'be' : 'not be'} focusable.`,
			({ document }) => {
				const element = document.querySelectorAll<HTMLElement>('#tabindex-invalid [tabindex]')[
					index
				]!;

				element.focus();
				focusable
					? expect(document.activeElement).toBe(element)
					: expect(document.activeElement).not.toBe(element);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
	}
}
