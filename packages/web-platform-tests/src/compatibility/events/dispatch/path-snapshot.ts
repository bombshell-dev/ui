import type { CompatibilityContext } from '../../context.ts';

const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.bubbling'] as const;
export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'keeps the original path when the target is moved during dispatch',
		({ document, globals }) => {
			const Event = globals('Event');
			const root = document.createElement('div');
			const oldParent = document.createElement('div');
			const newParent = document.createElement('div');
			const target = document.createElement('div');
			root.appendChild(oldParent);
			root.appendChild(newParent);
			oldParent.appendChild(target);
			const calls: string[] = [];
			const path: unknown[] = [];
			target.addEventListener('probe', (event) => {
				newParent.appendChild(target);
				path.push(...event.composedPath());
			});
			oldParent.addEventListener('probe', () => {
				calls.push('old');
			});
			newParent.addEventListener('probe', () => {
				calls.push('new');
			});
			root.addEventListener('probe', () => {
				calls.push('root');
			});
			target.dispatchEvent(new Event('probe', { bubbles: true }));
			expect(calls).toEqual(['old', 'root']);
			expect(path.length).toBe(3);
			expect(path[0]).toBe(target);
			expect(path[1]).toBe(oldParent);
			expect(path[2]).toBe(root);
			expect(target.parentNode).toBe(newParent);
		},
	);

	context.test(
		'keeps original ancestor targets after the target moves during dispatch',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const p = document.createElement('div'),
				q = document.createElement('div'),
				e = document.createElement('i');
			p.append(e);
			const seen: unknown[] = [];
			e.addEventListener('x', () => q.append(e));
			p.addEventListener('x', (event) => seen.push(event.target));
			q.addEventListener('x', () => seen.push('new-parent'));
			const Event = fixture.globals('Event');
			e.dispatchEvent(new Event('x', { bubbles: true }) as unknown as Event);
			expect(seen).toEqual([e]);
			expect(e.parentNode).toBe(q);
		},
	);
}
