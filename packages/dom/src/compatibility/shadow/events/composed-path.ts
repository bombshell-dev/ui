// Adapted from WPT event-composed-path.html at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. Original author: Hayato Ito.
// BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt.
import type { CompatibilityContext } from '../../context.ts';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/event-composed-path.html';
export const spec = 'https://dom.spec.whatwg.org/#dom-event-composedpath';
const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['shadow.events.retargeting'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'hides closed-root internals from listeners outside the root',
		({ document, globals }) => {
			const Event = globals('Event');
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'closed' });
			const child = document.createElement('span');
			root.append(child);
			const paths: unknown[] = [];
			child.addEventListener('probe', (event) => {
				paths.push(event.composedPath());
			});
			host.addEventListener('probe', (event) => {
				paths.push(event.composedPath());
			});
			const event = new Event('probe', { bubbles: true, composed: true });
			child.dispatchEvent(event);
			expect(paths).toEqual([[child, root, host], [host]]);
			expect(event.composedPath()).toEqual([]);
		},
	);

	context.test('hides closed-root internals from outside composedPath', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div'),
			root = host.attachShadow({ mode: 'closed' }),
			child = document.createElement('i');
		root.append(child);
		let inside: EventTarget[] = [],
			outside: EventTarget[] = [];
		child.addEventListener('x', (e) => (inside = e.composedPath()));
		host.addEventListener('x', (e) => (outside = e.composedPath()));
		const Event = fixture.globals('Event');
		child.dispatchEvent(new Event('x', { bubbles: true, composed: true }) as unknown as Event);
		expect(inside).toContain(child);
		expect(inside).toContain(root);
		expect(outside).not.toContain(child);
		expect(outside).not.toContain(root);
		expect(outside[0]).toBe(host);
	});

	for (const outerMode of ['open', 'closed'] as const) {
		for (const innerMode of ['open', 'closed'] as const) {
			context.test(
				`retargets and filters every listener path through ${outerMode}/${innerMode} nested roots`,
				(fixture) => {
					const document = fixture.document as unknown as Document;
					const Event = fixture.globals('Event') as unknown as typeof globalThis.Event;
					const outerHost = document.createElement('div');
					const outerRoot = outerHost.attachShadow({ mode: outerMode });
					const innerHost = document.createElement('div');
					const innerRoot = innerHost.attachShadow({ mode: innerMode });
					const target = document.createElement('span');
					outerRoot.append(innerHost);
					innerRoot.append(target);
					const fullPath = [target, innerRoot, innerHost, outerRoot, outerHost];
					const calls: unknown[] = [];
					for (const current of fullPath)
						current.addEventListener('probe', (event) => {
							calls.push([current, event.target, event.composedPath()]);
						});
					const event = new Event('probe', { bubbles: true, composed: true });
					target.dispatchEvent(event);
					const middlePath = innerMode === 'closed' ? fullPath.slice(2) : fullPath;
					const outsidePath = outerMode === 'closed' ? [outerHost] : middlePath;
					expect(calls).toEqual([
						[target, target, fullPath],
						[innerRoot, target, fullPath],
						[innerHost, innerHost, middlePath],
						[outerRoot, innerHost, middlePath],
						[outerHost, outerHost, outsidePath],
					]);
					expect(event.composedPath()).toEqual([]);
				},
			);

			context.test(
				`preserves a light-tree target through slots in ${outerMode}/${innerMode} nested roots`,
				(fixture) => {
					const document = fixture.document as unknown as Document;
					const Event = fixture.globals('Event') as unknown as typeof globalThis.Event;
					const outerHost = document.createElement('div');
					const outerRoot = outerHost.attachShadow({ mode: outerMode });
					const innerHost = document.createElement('div');
					const innerRoot = innerHost.attachShadow({ mode: innerMode });
					const outerSlot = document.createElement('slot');
					const innerSlot = document.createElement('slot');
					const target = document.createElement('span');
					outerRoot.append(innerHost);
					innerHost.append(outerSlot);
					innerRoot.append(innerSlot);
					outerHost.append(target);
					const fullPath = [
						target,
						outerSlot,
						innerSlot,
						innerRoot,
						innerHost,
						outerRoot,
						outerHost,
					];
					const middlePath =
						innerMode === 'closed'
							? [target, outerSlot, innerHost, outerRoot, outerHost]
							: fullPath;
					const outsidePath = outerMode === 'closed' ? [target, outerHost] : middlePath;
					const calls: unknown[] = [];
					for (const current of fullPath)
						current.addEventListener('probe', (event) => {
							calls.push([current, event.target, event.composedPath()]);
						});
					const event = new Event('probe', { bubbles: true, composed: true });
					target.dispatchEvent(event);
					expect(calls).toEqual([
						[target, target, outsidePath],
						[outerSlot, target, middlePath],
						[innerSlot, target, fullPath],
						[innerRoot, target, fullPath],
						[innerHost, target, middlePath],
						[outerRoot, target, middlePath],
						[outerHost, target, outsidePath],
					]);
					expect(event.composedPath()).toEqual([]);
				},
				['shadow.slots.named'],
			);
		}
	}
}
