import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const testCases = [
			{
				title: 'A1 Unlayered !important style',
				style: `
            target { color: green !important; }
            target { color: red; }
        `,
			},
			{
				title: 'B1 Same specificity, layered !important first',
				style: `
            @layer { target { color: green !important; } }
            target { color: red; }
        `,
			},
			{
				title: 'C1 Same specificity, layered !important second',
				style: `
            target { color: red; }
            @layer { target { color: green !important; } }
        `,
			},
			{
				title: 'D1 Same specificity, all !important',
				style: `
            @layer { target { color: green !important; } }
            @layer { target { color: red !important; } }
            target { color: red !important; }
        `,
			},
			{
				title: 'D2 Same specificity, all !important',
				style: `
            @layer { target { color: green !important; } }
            target { color: red !important; }
            @layer { target { color: red !important; } }
        `,
			},
			{
				title: 'D3 Same specificity, all !important',
				style: `
            target { color: red !important; }
            @layer { target { color: green !important; } }
            @layer { target { color: red !important; } }
        `,
			},
			{
				title: 'D4 Same specificity, all !important',
				style: `
            @layer A, B;
            @layer B { target { color: red !important; } }
            @layer A { target { color: green !important; } }
            target { color: red !important; }
        `,
			},
			{
				title: 'E1 Different specificity, all !important',
				style: `
            @layer { target { color: green !important; } }
            @layer { target { color: red !important; } }
            target.first { color: red !important; }
        `,
			},
			{
				title: 'E2 Different specificity, all !important',
				style: `
            @layer { target { color: green !important; } }
            @layer { target.first { color: red !important; } }
            target { color: red !important; }
        `,
			},
		];
		for (const testCase of testCases) {
			context.test(
				testCase['title'],
				({ document, getComputedStyle }) => {
					const styleElement = document.createElement('style');
					styleElement.textContent = testCase['style'];
					document.head.append(styleElement);

					let targets = document.querySelectorAll('target');
					for (const target of targets)
						expect(
							getComputedStyle(target).color,
							testCase['title'] + ", target '" + target.classList[0] + "'",
						).toBe('rgb(0, 128, 0)');
				},
				{
					document: {
						contentType: 'text/html',
						content: `<!DOCTYPE html>
<html>
<head>
<title>CSS Cascade Layers: !important </title>
<meta name="assert" content="!important functionality of CSS Cascade Layers">




</head>
<body>
<target class="first"></target>
<target class="second"></target>
<div id="log"></div>

</body>
</html>
`,
					},
				},
			);
		}
	}
}
