import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'captures non-bubbling events down the path, then delivers both target phases',
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
				node.addEventListener(
					'probe',
					(event) => {
						calls.push([
							label,
							'capture',
							event.eventPhase,
							event.target === target,
							event.currentTarget === node,
						]);
					},
					true,
				);
				node.addEventListener('probe', (event) => {
					calls.push([
						label,
						'bubble',
						event.eventPhase,
						event.target === target,
						event.currentTarget === node,
					]);
				});
			}
			target.dispatchEvent(new Event('probe'));
			expect(calls).toEqual([
				['root', 'capture', 1, true, true],
				['parent', 'capture', 1, true, true],
				['target', 'capture', 2, true, true],
				['target', 'bubble', 2, true, true],
			]);
		},
	);
	context.test(
		'matches removal by capture, whether options are boolean or an object',
		({ document, globals }) => {
			const Event = globals('Event');
			const target = document.createElement('div');
			let count = 0;
			const listener = (): void => {
				count++;
			};
			target.addEventListener('probe', listener, true);
			target.addEventListener('probe', listener, false);
			target.removeEventListener('probe', listener, { capture: true });
			target.dispatchEvent(new Event('probe'));
			expect(count).toBe(1);
			target.removeEventListener('probe', listener, false);
			target.dispatchEvent(new Event('probe'));
			expect(count).toBe(1);
		},
	);

	context.test('orders ancestor capture before target capture and target bubble', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		const seen: string[] = [];
		p.addEventListener('x', () => seen.push('ancestor'), true);
		e.addEventListener('x', () => seen.push('target-bubble'));
		e.addEventListener('x', () => seen.push('target-capture'), true);
		const Event = fixture.globals('Event');
		e.dispatchEvent(new Event('x') as unknown as Event);
		expect(seen).toEqual(['ancestor', 'target-capture', 'target-bubble']);
	});
}
