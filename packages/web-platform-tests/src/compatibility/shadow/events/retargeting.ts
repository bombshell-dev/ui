import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#retarget';
const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['shadow.roots.attachment', 'events.dispatch.bubbling'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'retargets composed events to the host outside the shadow tree',
		({ document, globals }) => {
			const Event = globals('Event');
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const child = document.createElement('span');
			root.append(child);
			const targets: unknown[] = [];
			child.addEventListener('probe', (event) => {
				targets.push(event.target);
			});
			host.addEventListener('probe', (event) => {
				targets.push(event.target);
			});
			child.dispatchEvent(new Event('probe', { bubbles: true, composed: true }));
			expect(targets).toEqual([child, host]);
			targets.length = 0;
			child.dispatchEvent(new Event('probe', { bubbles: true }));
			expect(targets).toEqual([child]);
		},
	);

	context.test('prevents noncomposed events from escaping a shadow root', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div'),
			root = host.attachShadow({ mode: 'open' }),
			child = document.createElement('i');
		root.append(child);
		const seen: unknown[] = [];
		root.addEventListener('x', (e) => seen.push(e.target));
		host.addEventListener('x', () => seen.push('host'));
		const Event = fixture.globals('Event');
		child.dispatchEvent(new Event('x', { bubbles: true }) as unknown as Event);
		expect(seen).toEqual([child]);
	});
}
