import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Tests that inert elements do not match the :disabled selector.',
		({ document, getComputedStyle }) => {
			const button = document.querySelector('button')!;
			const color = getComputedStyle(button).getPropertyValue('color');
			expect(button.matches(':disabled')).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
<head>


<style>
button {
    color: green;
}

button:disabled {
    color: red;
}

</style>
</head>
<body style="color: green">
<button inert>The test passes if this is in green.</button>

</body>
</html>
`,
			},
		},
	);
}
