// Adapted from WPT slotchange-event.html at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. Original authors: Ryosuke Niwa and Hayato Ito.
// BSD-3-Clause; see ../../../../test/wpt/LICENSE.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec = 'https://dom.spec.whatwg.org/#notify-mutation-observers';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/slotchange-event.html';
export const globals = ['MutationObserver'] as const;
export const requires = [
	'shadow.slots.slotchange',
	'mutationObserver.microtaskDelivery',
	'mutationObserver.filtering',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['open', 'closed'] as const) {
		for (const connected of [false, true]) {
			context.test(
				`orders observer callbacks and reentrant slot signals in a ${connected ? 'connected' : 'detached'} ${mode} root`,
				async (fixture) => {
					const document = fixture.document as unknown as Document;
					const MutationObserver = fixture.globals(
						'MutationObserver',
					) as unknown as typeof globalThis.MutationObserver;
					const host = document.createElement('div');
					const root = host.attachShadow({ mode });
					const slot = document.createElement('slot');
					root.append(slot);
					if (connected) fixture.connect(host as unknown as DOMElementContract);
					const observed = document.createElement('div');
					const calls: string[] = [];
					slot.addEventListener('slotchange', () => calls.push('slotchange'));
					const first = new MutationObserver(() => {
						calls.push('observer:id');
						host.append(document.createElement('span'));
						observed.setAttribute('title', 'next');
					});
					const second = new MutationObserver(() => calls.push('observer:title'));
					fixture.cleanup(() => first.disconnect());
					fixture.cleanup(() => second.disconnect());
					first.observe(observed, { attributes: true, attributeFilter: ['id'] });
					second.observe(observed, { attributes: true, attributeFilter: ['title'] });
					observed.id = 'start';
					host.append(document.createElement('div'));
					expect(calls).toEqual([]);
					await new Promise<void>((resolve) => setTimeout(resolve, 0));
					expect(calls).toEqual(['observer:id', 'slotchange', 'observer:title', 'slotchange']);
				},
			);
		}
	}

	context.test(
		'delivers pending slot signals after removal and after observer delivery',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const MutationObserver = fixture.globals(
				'MutationObserver',
			) as unknown as typeof globalThis.MutationObserver;
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const slot = document.createElement('slot');
			root.append(slot);
			const calls: string[] = [];
			const observer = new MutationObserver(() => calls.push('observer'));
			fixture.cleanup(() => observer.disconnect());
			observer.observe(host, { childList: true });
			slot.addEventListener('slotchange', () => calls.push('slotchange'));
			host.append(document.createElement('span'));
			slot.remove();
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			expect(calls).toEqual(['observer', 'slotchange']);
			expect(slot.assignedNodes()).toEqual([]);
		},
	);

	context.test('orders distinct slot signals by their first assignment change', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const MutationObserver = fixture.globals(
			'MutationObserver',
		) as unknown as typeof globalThis.MutationObserver;
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open' });
		const first = document.createElement('slot'),
			second = document.createElement('slot');
		first.name = 'first';
		second.name = 'second';
		root.append(first, second);
		const calls: string[] = [];
		const observer = new MutationObserver(() => calls.push('observer'));
		fixture.cleanup(() => observer.disconnect());
		observer.observe(host, { childList: true });
		first.addEventListener('slotchange', () => calls.push('first'));
		second.addEventListener('slotchange', () => calls.push('second'));
		for (const name of ['second', 'first', 'second']) {
			const node = document.createElement('span');
			node.slot = name;
			host.append(node);
		}
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		expect(calls).toEqual(['observer', 'second', 'first']);
	});
}
