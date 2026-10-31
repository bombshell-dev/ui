import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#find-flattened-slotables';
export const requires = ['shadow.slots.named'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'includes fallback children only in flattened assignment results',
		({ document }) => {
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const slot = document.createElement('slot');
			const fallback = document.createElement('span');
			slot.append(fallback);
			root.append(slot);
			expect(slot.assignedNodes()).toEqual([]);
			expect(slot.assignedNodes({ flatten: true })).toEqual([fallback]);
			const child = document.createTextNode('assigned');
			host.append(child);
			expect(slot.assignedNodes({ flatten: true })).toEqual([child]);
		},
	);

	context.test('uses fallback only for flattened assignment and excludes comments', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div'),
			root = host.attachShadow({ mode: 'open' }),
			slot = document.createElement('slot'),
			fallback = document.createTextNode('fallback');
		slot.append(fallback);
		root.append(slot);
		host.append(document.createComment('ignored'));
		expect(slot.assignedNodes()).toEqual([]);
		expect(slot.assignedNodes({ flatten: true })).toEqual([fallback]);
		const light = document.createTextNode('light');
		host.append(light);
		expect(slot.assignedNodes({ flatten: true })).toEqual([light]);
		expect(light.assignedSlot).toBe(slot);
	});
}
