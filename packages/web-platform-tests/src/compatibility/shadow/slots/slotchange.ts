import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#signal-a-slot-change';
export const requires = ['shadow.slots.named', 'events.dispatch.target'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('coalesces slotchange at a microtask checkpoint', async ({ document }) => {
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open' });
		const slot = document.createElement('slot');
		root.append(slot);
		await Promise.resolve();
		let count = 0;
		slot.addEventListener('slotchange', (event) => {
			count++;
			expect(event.bubbles).toBe(true);
			expect(event.composed).toBe(false);
			expect(event.target).toBe(slot);
		});
		host.append(document.createTextNode('one'));
		host.append(document.createTextNode('two'));
		expect(count).toBe(0);
		await Promise.resolve();
		expect(count).toBe(1);
	});

	context.test(
		'coalesces assignment changes into one asynchronous bubbling event',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const host = document.createElement('div'),
				root = host.attachShadow({ mode: 'open' }),
				slot = document.createElement('slot');
			root.append(slot);
			let count = 0;
			const targets: unknown[] = [];
			root.addEventListener('slotchange', (e) => {
				count++;
				targets.push(e.target);
				expect(e.composed).toBe(false);
			});
			host.append(document.createElement('i'), document.createTextNode('x'));
			expect(count).toBe(0);
			await new Promise<void>((resolve) => queueMicrotask(resolve));
			expect(count).toBe(1);
			expect(targets).toEqual([slot]);
		},
	);
}
