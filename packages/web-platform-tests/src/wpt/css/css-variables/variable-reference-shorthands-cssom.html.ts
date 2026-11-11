import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'CSS variable references - shorthand properties - via CSSOM',
		({ document }) => {
			let target = document.getElementById('target')!;

			target.style.setProperty('margin', 'var(--prop)');
			expect(target.style.margin, 'margin property value after calling setProperty').toBe(
				'var(--prop)',
			);
			expect(
				target.style.getPropertyValue('margin'),
				"getPropertyValue('margin') after calling setProperty",
			).toBe('var(--prop)');

			target.style.removeProperty('margin');
			expect(target.style.margin, 'margin property value after calling removeProperty').toBe('');
			expect(
				target.style.getPropertyValue('margin'),
				"getPropertyValue('margin') after calling removeProperty",
			).toBe('');
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
<head>
    <title>CSS variable references - shorthand properties - via CSSOM</title>

    <meta rel="author" title="Kevin Babbitt">
    <meta rel="author" title="Greg Whitworth">
\x20\x20\x20\x20
\x20\x20\x20\x20

\x20\x20\x20\x20
\x20\x20\x20\x20
</head>
<body>

<div id="target"></div>



</body>
</html>
`,
			},
		},
	);
}
