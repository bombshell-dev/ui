import type { CompatibilityContext } from '../../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<html>
<head>
    <title>CSS variable references - via CSSOM</title>

    <meta rel="author" title="Kevin Babbitt">
    <meta rel="author" title="Greg Whitworth">
\x20\x20\x20\x20
    <!-- This is not directly specified in the spec but should work -->
\x20\x20\x20\x20

\x20\x20\x20\x20
\x20\x20\x20\x20
</head>
<body>

<div id="target1"></div>
<div id="target2" style="background-color: red;"></div>



</body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Verify correct results using CSSOM',
		({ document }) => {
			let target = document.getElementById('target1')!;

			target.style.setProperty('background-color', 'var(--prop)');
			expect(
				target.style.backgroundColor,
				'background-color property value after calling setProperty',
			).toBe('var(--prop)');
			expect(
				target.style.getPropertyValue('background-color'),
				"getPropertyValue('background-color') after calling setProperty",
			).toBe('var(--prop)');

			target.style.removeProperty('background-color');
			expect(
				target.style.backgroundColor,
				'background-color property value after calling removeProperty',
			).toBe('');
			expect(
				target.style.getPropertyValue('background-color'),
				"getPropertyValue('background-color') after calling removeProperty",
			).toBe('');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		'Verify correct results with CSSOM overriding markup-set values',
		({ document }) => {
			let target = document.getElementById('target1')!;

			target.style.setProperty('background-color', 'var(--prop)');
			expect(
				target.style.backgroundColor,
				'background-color property value after calling setProperty',
			).toBe('var(--prop)');
			expect(
				target.style.getPropertyValue('background-color'),
				"getPropertyValue('background-color') after calling setProperty",
			).toBe('var(--prop)');

			target.style.removeProperty('background-color');
			expect(
				target.style.backgroundColor,
				'background-color property value after calling removeProperty',
			).toBe('');
			expect(
				target.style.getPropertyValue('background-color'),
				"getPropertyValue('background-color') after calling removeProperty",
			).toBe('');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
