import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Storage of "unset" value',
		({ document }) => {
			let properties = ['color', 'border', 'border-left', 'border-color', 'border-right-style'];
			let style = (document.styleSheets[0]!.cssRules[0] as CSSStyleRule).style;
			for (let prop of properties) {
				expect(style.getPropertyValue(prop), `${prop} is expected to be "unset"`).toBe('unset');
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<meta charset="utf-8">
<title>Storage of "unset" value</title>
<meta name="author" title="Xidorn Quan" href="https://www.upsuper.org">



<style>
  div {
    color: unset;
    border: unset;
  }
</style>
<body>
  <div id="log"></div>
\x20\x20
`,
			},
		},
	);
}
