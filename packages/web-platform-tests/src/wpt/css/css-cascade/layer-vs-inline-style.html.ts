import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const testCases = [
			{
				title: 'Normal inline style > normal layered style',
				style: '@layer { #target { background-color: red; }}',
				inlineStyle: 'background-color: green',
			},
			{
				title: 'Normal inline style < important layered style',
				style: '@layer { #target { background-color: green !important; }}',
				inlineStyle: 'background-color: red',
			},
			{
				title: 'Important inline style > normal layered style',
				style: '@layer { #target { background-color: red; }}',
				inlineStyle: 'background-color: green !important',
			},
			{
				title: 'Important inline style > important layered style',
				style: '@layer { #target { background-color: red !important; }}',
				inlineStyle: 'background-color: green !important',
			},
		];
		for (const testCase of testCases) {
			context.test(
				testCase['title'],
				({ document, getComputedStyle }) => {
					const target = document.getElementById('target')!,
						reference = document.getElementById('reference')!;
					var documentStyle = document.createElement('style');
					documentStyle.appendChild(document.createTextNode(testCase['style']));
					document.head.appendChild(documentStyle);

					(target as unknown as { style: string }).style = testCase['inlineStyle'];

					expect(getComputedStyle(target).backgroundColor).toBe(
						getComputedStyle(reference).backgroundColor,
					);
				},
				{
					document: {
						contentType: 'text/html',
						content: `<!DOCTYPE html>




<style>
#target, #reference {
  width: 100px;
  height: 100px;
}

#reference {
  background-color: green;
}
</style>

<div id="target"></div>
<div id="reference"></div>


`,
					},
				},
			);
		}
	}
}
