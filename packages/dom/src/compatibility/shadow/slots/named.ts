import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#find-slot';
export const requires = ['shadow.roots.attachment'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('assigns matching light children to the first named slot', ({ document }) => {
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open' });
		const first = document.createElement('slot');
		const duplicate = document.createElement('slot');
		first.name = duplicate.name = 'named';
		root.append(first, duplicate);
		const child = document.createElement('span');
		child.slot = 'named';
		const text = document.createTextNode('unmatched');
		host.append(child, text);
		expect(first.assignedNodes()).toEqual([child]);
		expect(first.assignedElements()).toEqual([child]);
		expect(duplicate.assignedNodes()).toEqual([]);
		expect(child.assignedSlot).toBe(first);
		child.slot = 'other';
		expect(first.assignedNodes()).toEqual([]);
		expect(child.assignedSlot).toBeNull();
	});

	context.test('assigns to the first matching slot and redistributes on renaming', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div'),
			root = host.attachShadow({ mode: 'open' }),
			first = document.createElement('slot'),
			second = document.createElement('slot'),
			light = document.createElement('i');
		first.name = second.name = 'x';
		root.append(first, second);
		light.slot = 'x';
		host.append(light);
		expect(first.assignedNodes()).toEqual([light]);
		expect(second.assignedNodes()).toEqual([]);
		expect(light.assignedSlot).toBe(first);
		first.name = 'y';
		expect(second.assignedNodes()).toEqual([light]);
		expect(light.assignedSlot).toBe(second);
	});
}
