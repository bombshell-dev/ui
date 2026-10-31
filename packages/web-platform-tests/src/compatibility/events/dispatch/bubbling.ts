import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'bubbles from the target through ancestors only when requested',
		({ document, globals }) => {
			const Event = globals('Event');
			const root = document.createElement('div');
			const parent = document.createElement('div');
			const target = document.createElement('div');
			root.appendChild(parent);
			parent.appendChild(target);
			const calls: unknown[] = [];
			for (const [node, label] of [
				[root, 'root'],
				[parent, 'parent'],
				[target, 'target'],
			] as const) {
				node.addEventListener('probe', (event) => {
					calls.push([
						label,
						event.eventPhase,
						event.target === target,
						event.currentTarget === node,
					]);
				});
			}
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual([['target', 2, true, true]]);
			calls.length = 0;
			target.dispatchEvent(new Event('probe', { bubbles: true }));
			expect(calls).toEqual([
				['target', 2, true, true],
				['parent', 3, true, true],
				['root', 3, true, true],
			]);
		},
	);

	context.test('nonbubbling events reach target but not bubble ancestors', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		const seen: string[] = [];
		p.addEventListener('x', () => seen.push('parent'));
		e.addEventListener('x', () => seen.push('target'));
		const Event = fixture.globals('Event');
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(seen).toEqual(['target']);
	});
}
