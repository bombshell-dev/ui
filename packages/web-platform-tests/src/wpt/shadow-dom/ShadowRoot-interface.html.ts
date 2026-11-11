import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			'ShadowRoot.activeElement must return the focused element of the context object when shadow root is ' +
				mode +
				'.',
			({ document }) => {
				var host = document.createElement('div');
				document.body.appendChild(host);
				var shadowRoot = host.attachShadow({ mode: mode });
				shadowRoot.appendChild(document.createElement('input'));
				expect(
					shadowRoot.activeElement,
					'ShadowRoot.host must return null if an ' +
						mode +
						' shadow tree does not have a focused element',
				).toBe(null);
				(shadowRoot.firstChild as HTMLElement).focus();
				expect(
					shadowRoot.activeElement,
					'ShadowRoot.host must return the focused element of an ' + mode + ' shadow tree',
				).toBe(shadowRoot.firstChild);
				host.remove();
				expect(
					shadowRoot.activeElement,
					'ShadowRoot.host must return null if an ' + mode + ' shadow tree lost focus',
				).toBe(null);
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: ShadowRoot interface</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="assert" content="ShadowRoot interface and its attributes must be defined">



</head>
<body>
<div id="log"></div>

</body>
</html>
`,
				},
			},
		);
	}
}
