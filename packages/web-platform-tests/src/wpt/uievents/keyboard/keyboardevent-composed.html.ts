import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const type of ['keydown', 'keypress', 'keyup'])
		context.test(
			type + ' event must be composed',
			async ({ document, input }) => {
				const target = document.getElementById('target')! as HTMLElement;
				target.focus();
				const received = new Promise<KeyboardEvent>((resolve) =>
					target.addEventListener(type, (event) => resolve(event as KeyboardEvent)),
				);
				await input.keyDown('a');
				await input.keyUp('a');
				const event = await received;
				expect(event.composed).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<meta charset="utf-8" />
<title>keydown and keypress and keyup events must be composed</title>
<link rel="author" title="Simon Wülker" href="simon.wuelker@arcor.de">






<div id="target" tabindex="0">Target</div>


`,
				},
			},
		);
}
