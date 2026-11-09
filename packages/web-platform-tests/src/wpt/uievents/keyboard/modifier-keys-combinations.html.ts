import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const key of ['Shift', 'Control', 'Alt', 'Meta']) {
		context.test(
			`Check sending "${key} + y" key combination`,
			async ({ document, input }) => {
				const target = document.getElementById('target')! as HTMLElement;
				const received = new Promise<KeyboardEvent>((resolve) =>
					target.addEventListener('keydown', (event) => {
						if ((event as KeyboardEvent).key !== key) resolve(event as KeyboardEvent);
					}),
				);
				target.focus();
				await input.keyDown(key);
				await input.press('y');
				await input.keyUp(key);
				const event = await received;
				if (event.shiftKey) expect(event.key == 'y' || event.key == 'Y').toBe(true);
				else expect(event.key).toBe('y');
				expect(event.shiftKey).toBe(key === 'Shift');
				expect(event.ctrlKey).toBe(key === 'Control');
				expect(event.altKey).toBe(key === 'Alt');
				expect(event.metaKey).toBe(key === 'Meta');
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<meta charset="utf-8" />
<title>UI Events Test: Modifier keys combinations</title>
<link rel="author" title="Manuel Rego Casasnovas" href="mailto:rego@igalia.com">
<link rel="help" href="https://w3c.github.io/uievents/#idl-keyboardevent" />
<meta name="assert" content="This test checks that modifier keys combinations are properly detected in 'keydown' event.">




<div id="target" tabindex="0">Target</div>

`,
				},
			},
		);
	}
}
