// Adapted from WPT shadow event paths, related-target tests, and native mouseover/out tests
// at b719612f963a05ece9c89a7dd7598c1c59618874. Copyright © web-platform-tests contributors.
// Shadow test authors: Hayato Ito and Ryosuke Niwa. BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-event-dispatch';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/event-with-related-target.html';
export const input = ['mouse'] as const;
export const requires = [
	'input.mouse.delivery',
	'shadow.events.composedPath',
	'shadow.events.relatedTarget',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			`retargets native mouse down/up/click outside a ${mode} shadow root`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const host = document.createElement('div');
				const root = host.attachShadow({ mode });
				const target = document.createElement('button');
				target.type = 'button';
				target.textContent = 'Shadow target';
				root.append(target);
				fixture.connect(host as unknown as DOMElementContract);
				const calls: unknown[] = [];
				for (const type of ['mousedown', 'mouseup', 'click']) {
					target.addEventListener(type, (event) =>
						calls.push([
							type,
							'inside',
							event.target,
							event.composed,
							event.composedPath().slice(0, 3),
						]),
					);
					host.addEventListener(type, (event) =>
						calls.push([
							type,
							'outside',
							event.target,
							event.composed,
							event
								.composedPath()
								.filter((node) => node === target || node === root || node === host),
						]),
					);
				}
				await fixture.input.click(target as unknown as DOMElementContract);
				const outsidePath = mode === 'open' ? [target, root, host] : [host];
				expect(calls).toEqual([
					['mousedown', 'inside', target, true, [target, root, host]],
					['mousedown', 'outside', host, true, outsidePath],
					['mouseup', 'inside', target, true, [target, root, host]],
					['mouseup', 'outside', host, true, outsidePath],
					['click', 'inside', target, true, [target, root, host]],
					['click', 'outside', host, true, outsidePath],
				]);
			},
		);
	}

	context.test(
		'canceling a retargeted host click rolls back shadow checkbox activation',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'closed' });
			const target = document.createElement('input');
			target.type = 'checkbox';
			target.indeterminate = true;
			root.append(target);
			fixture.connect(host as unknown as DOMElementContract);
			const calls: unknown[] = [];
			target.addEventListener('click', (event) =>
				calls.push(['inside', event.target, target.checked, target.indeterminate]),
			);
			host.addEventListener('click', (event) => {
				calls.push(['outside', event.target, target.checked, target.indeterminate]);
				event.preventDefault();
			});
			for (const type of ['input', 'change'])
				target.addEventListener(type, () => calls.push([type]));
			await fixture.input.click(target as unknown as DOMElementContract);
			expect(calls).toEqual([
				['inside', target, true, false],
				['outside', host, true, false],
			]);
			expect([target.checked, target.indeterminate]).toEqual([false, true]);
		},
		['elements.input.activation', 'events.dispatch.cancellation'],
	);

	context.test(
		'trims internal hover transitions and retargets relatedTarget when leaving shadow',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const container = document.createElement('div');
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'closed' });
			const first = document.createElement('button'),
				second = document.createElement('button'),
				outside = document.createElement('button');
			first.type = second.type = outside.type = 'button';
			first.textContent = 'First';
			second.textContent = 'Second';
			outside.textContent = 'Outside';
			root.append(first, second);
			container.append(host, outside);
			fixture.connect(container as unknown as DOMElementContract);
			await fixture.input.move(first as unknown as DOMElementContract);
			const insideCalls: unknown[] = [],
				outsideCalls: unknown[] = [];
			for (const type of ['mouseover', 'mouseout']) {
				root.addEventListener(type, (event) =>
					insideCalls.push([type, event.target, (event as MouseEvent).relatedTarget]),
				);
				host.addEventListener(type, (event) =>
					outsideCalls.push([type, event.target, (event as MouseEvent).relatedTarget]),
				);
				outside.addEventListener(type, (event) =>
					outsideCalls.push([type, event.target, (event as MouseEvent).relatedTarget]),
				);
			}
			await fixture.input.move(second as unknown as DOMElementContract);
			expect(insideCalls).toEqual([
				['mouseout', first, second],
				['mouseover', second, first],
			]);
			expect(outsideCalls).toEqual([]);
			insideCalls.length = 0;
			await fixture.input.move(outside as unknown as DOMElementContract);
			expect(insideCalls).toEqual([['mouseout', second, outside]]);
			expect(outsideCalls).toEqual([
				['mouseout', host, outside],
				['mouseover', outside, host],
			]);
		},
		['input.mouse.hover'],
	);
}
