import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'MouseEvent attributes',
		async ({ document, MouseEvent, input }) => {
			const event_list = [
				'mouseover',
				'mouseenter',
				'mousemove',
				'mousedown',
				'mouseup',
				'mouseout',
				'mouseleave',
			];
			function getEvent(event_type: string, target: EventTarget | null) {
				return new Promise<MouseEvent>((resolve) =>
					target!.addEventListener(event_type, (e) => resolve(e as MouseEvent), { once: true }),
				);
			}

			let left = document.getElementById('left')!;
			let right = document.getElementById('right')!;

			const event_promises: Promise<MouseEvent>[] = [];
			event_list.forEach((ename) => event_promises.push(getEvent(ename, right)));

			await input.click(left);
			await input.click(right);
			await input.click(left);

			for (let i = 0; i < event_promises.length; i++) {
				let e = await event_promises[i]!;

				expect(e.constructor, e.type + ' should use a MouseEvent constructor').toBe(MouseEvent);
				expect(e instanceof MouseEvent, e.type + ' should be a MouseEvent').toBe(true);

				expect(e.isTrusted, e.type + '.isTrusted attribute').toBe(true);

				expect(e.composed, e.type + '.composed attribute').toBe(
					e.type != 'mouseenter' && e.type != 'mouseleave',
				);

				expect(e.bubbles, e.type + '.bubbles attribute').toBe(
					e.type != 'mouseenter' && e.type != 'mouseleave',
				);

				expect(e.cancelable, e.type + '.cancelable attribute').toBe(
					e.type != 'mouseenter' && e.type != 'mouseleave',
				);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!DOCTYPE HTML>\n<title>MouseEvent attributes</title>\n\n\n\n\n\n\n\n<span id="left">Left</span> <span id="right">Right</span>\n\n\n',
			},
		},
	);
}
