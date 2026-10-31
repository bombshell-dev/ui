import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/scripting.html#dom-slot-assign';
export const requires = ['shadow.roots.attachment'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('honors manual assignment order without duplicating slottables', ({ document }) => {
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open', slotAssignment: 'manual' });
		const slot = document.createElement('slot');
		root.append(slot);
		const first = document.createElement('span');
		const second = document.createTextNode('second');
		host.append(first, second);
		expect(slot.assignedNodes()).toEqual([]);
		slot.assign(second, first, second);
		expect(root.slotAssignment).toBe('manual');
		expect(slot.assignedNodes()).toEqual([second, first]);
		expect(first.assignedSlot).toBe(slot);
		slot.assign();
		expect(slot.assignedNodes()).toEqual([]);
	});

	context.test(
		'manual assignments replace previous assignments and update assignedSlot',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const host = document.createElement('div'),
				root = host.attachShadow({ mode: 'open', slotAssignment: 'manual' }),
				slot = document.createElement('slot'),
				a = document.createElement('i'),
				b = document.createTextNode('b');
			root.append(slot);
			host.append(a, b);
			slot.assign(a, b);
			expect(slot.assignedNodes()).toEqual([a, b]);
			slot.assign(b);
			expect(slot.assignedNodes()).toEqual([b]);
			expect(a.assignedSlot).toBeNull();
			expect(b.assignedSlot).toBe(slot);
			slot.assign();
			expect(slot.assignedNodes()).toEqual([]);
		},
	);
}
