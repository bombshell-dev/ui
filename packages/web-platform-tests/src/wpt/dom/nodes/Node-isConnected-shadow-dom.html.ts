import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['closed', 'open'] as const) {
		context.test(
			`Node.isConnected in a ${mode} shadow tree`,
			({ document }) => {
				const host = document.createElement('div');
				document.body.appendChild(host);

				const root = host.attachShadow({ mode });

				const node = document.createElement('div');
				root.appendChild(node);

				expect(node.isConnected).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Test of Node.isConnected in a shadow tree</title>\n\n\n\n\n<body>\n\n',
				},
			},
		);
	}
}
