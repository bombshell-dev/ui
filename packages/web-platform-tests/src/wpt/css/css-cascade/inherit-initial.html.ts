import type { CompatibilityContext } from '../../../shared/context.ts';

const markup1 = `<!DOCTYPE html>
<meta charset=utf-8>
<title>CSS Cascading and Inheritance test: Root element inherits from initial values</title>




<style>
html {
  z-index: inherit;
  position: inherit;
  overflow: inherit;
  background-color: inherit;
}
body {
  overflow: scroll;
  background-color: pink;
}
</style>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		"z-index:inherit on root element should compute to 'auto'.",
		({ document, getComputedStyle }) => {
			expect(getComputedStyle(document.documentElement).zIndex).toBe('auto');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		"position:inherit on root element should compute to 'static'.",
		({ document, getComputedStyle }) => {
			expect(getComputedStyle(document.documentElement).position).toBe('static');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		"overflow:inherit on root element should compute to 'visible'.",
		({ document, getComputedStyle }) => {
			expect(getComputedStyle(document.documentElement).overflow).toBe('visible');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
	context.test(
		"background-color:inherit on root element should compute to 'rgba(0, 0, 0, 0)'.",
		({ document, getComputedStyle }) => {
			expect(getComputedStyle(document.documentElement).backgroundColor).toBe('rgba(0, 0, 0, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup1,
			},
		},
	);
}
