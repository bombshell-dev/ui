import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['keyboard'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const [key, keyName] of [
		[' ', 'space'],
		['Enter', 'enter'],
	] as const)
		for (const id of ['button', 'inputbutton'])
			context.test(
				`Test that the Keyboard generated click does not fire pointer or mouse events for ${id} when pressing ${keyName} key`,
				async ({ document, PointerEvent, step, input }) => {
					const button = document.getElementById('button')! as HTMLElement;
					const inputbutton = document.getElementById('inputbutton')! as HTMLElement;
					const eventLog: string[] = [];
					for (const el of [button, inputbutton])
						for (const ev of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click'])
							el.addEventListener(
								ev,
								step((e) => {
									eventLog.push(`${ev}_${el.id}`);
									if (ev === 'click' && e instanceof PointerEvent) {
										expect(e.pointerId, "Click's pointerId has reserved value").toBe(-1);
										expect(e.pointerType, "Click's pointerType has default value").toBe('');
									}
								}),
							);
					const el = document.getElementById(id)! as HTMLElement;
					const waitForClick = new Promise<void>((resolve) =>
						el.addEventListener('click', () => resolve(), { once: true }),
					);
					el.focus();
					el.focus();
					await input.press(key);
					await waitForClick;
					expect(eventLog, 'The Keyboard generated click only sends the click event.').toEqual([
						`click_${el.id}`,
					]);
				},
				{
					document: {
						contentType: 'text/html',
						content: `





<p>Tests that a button pressed by using Space or Enter will fire only the click event</p>
<button id="button">Click Me by pressing Enter or Space</button>
<input id="inputbutton" type="button" value="Click me by pressing Enter or Space">


`,
					},
				},
			);
}
