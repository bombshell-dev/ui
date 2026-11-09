import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'default delegatesFocus value',
		({ document }) => {
			const host = document.getElementById('host1')!;
			const shadowRoot = host.attachShadow({ mode: 'closed' });
			expect(shadowRoot.delegatesFocus).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>ShadowRoot\'s  delegatesFocus attribute</title>\n\n\n<div id="host1"></div>\n<div id="host2"></div>\n<div id="host3"></div>\n\n',
			},
		},
	);
	context.test(
		'delegatesFocus set to false in init dict',
		({ document }) => {
			const host = document.getElementById('host2')!;
			const shadowRoot = host.attachShadow({ mode: 'closed', delegatesFocus: false });
			expect(shadowRoot.delegatesFocus).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>ShadowRoot\'s  delegatesFocus attribute</title>\n\n\n<div id="host1"></div>\n<div id="host2"></div>\n<div id="host3"></div>\n\n',
			},
		},
	);
	context.test(
		'delegatesFocus set to true in init dict',
		({ document }) => {
			const host = document.getElementById('host3')!;
			const shadowRoot = host.attachShadow({ mode: 'closed', delegatesFocus: true });
			expect(shadowRoot.delegatesFocus).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>ShadowRoot\'s  delegatesFocus attribute</title>\n\n\n<div id="host1"></div>\n<div id="host2"></div>\n<div id="host3"></div>\n\n',
			},
		},
	);
}
