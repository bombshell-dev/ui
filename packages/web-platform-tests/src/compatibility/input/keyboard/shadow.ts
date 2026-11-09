// Adapted from WPT event-composed-path.html and focus-navigation-slot-fallback-default-tabindex.html
// at b719612f963a05ece9c89a7dd7598c1c59618874. Copyright © web-platform-tests contributors.
// Event-path author: Hayato Ito. BSD-3-Clause; see ../../../../test/wpt/LICENSE.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/interaction.html#sequential-focus-navigation';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/shadow-dom/focus-navigation/focus-navigation-slot-fallback-default-tabindex.html';
export const input = ['keyboard'] as const;
export const requires = [
	'input.keyboard.delivery',
	'shadow.focus.retargeting',
	'shadow.events.composedPath',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			`retargets native keys and filters paths outside a ${mode} shadow root`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const host = document.createElement('div');
				const root = host.attachShadow({ mode });
				const target = document.createElement('input');
				root.append(target);
				fixture.connect(host as unknown as DOMElementContract);
				target.focus();
				expect(document.activeElement).toBe(host);
				expect(root.activeElement).toBe(target);
				const calls: unknown[] = [];
				for (const type of ['keydown', 'keyup']) {
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
				await fixture.input.press('ArrowLeft');
				expect(calls).toEqual([
					['keydown', 'inside', target, true, [target, root, host]],
					['keydown', 'outside', host, true, mode === 'open' ? [target, root, host] : [host]],
					['keyup', 'inside', target, true, [target, root, host]],
					['keyup', 'outside', host, true, mode === 'open' ? [target, root, host] : [host]],
				]);
			},
		);
	}

	context.test(
		'canceling a retargeted host keydown prevents editing inside the shadow root',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const target = document.createElement('input');
			target.value = 'abcd';
			root.append(target);
			fixture.connect(host as unknown as DOMElementContract);
			target.focus();
			target.setSelectionRange(2, 2);
			const calls: unknown[] = [];
			host.addEventListener('keydown', (event) => {
				calls.push(['keydown', event.target]);
				event.preventDefault();
			});
			host.addEventListener('keyup', (event) => calls.push(['keyup', event.target]));
			for (const type of ['beforeinput', 'input'])
				target.addEventListener(type, () => calls.push([type]));
			await fixture.input.press('Backspace');
			expect(calls).toEqual([
				['keydown', host],
				['keyup', host],
			]);
			expect(target.value).toBe('abcd');
			expect([target.selectionStart, target.selectionEnd]).toEqual([2, 2]);
		},
		['input.keyboard.editing'],
	);

	context.test(
		'Tab follows slot scopes and skips fallback content replaced by assigned nodes',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const before = document.createElement('input');
			const host = document.createElement('div');
			const after = document.createElement('input');
			const root = host.attachShadow({ mode: 'open' });
			const firstSlot = document.createElement('slot'),
				secondSlot = document.createElement('slot');
			firstSlot.name = 'assigned';
			secondSlot.name = 'fallback';
			const assigned = document.createElement('input');
			assigned.slot = 'assigned';
			const hiddenFallback = document.createElement('input');
			const fallback = document.createElement('input');
			firstSlot.append(hiddenFallback);
			secondSlot.append(fallback);
			root.append(firstSlot, secondSlot);
			host.append(assigned);
			const container = document.createElement('div');
			container.append(before, host, after);
			fixture.connect(container as unknown as DOMElementContract);
			before.focus();
			await fixture.input.press('Tab');
			expect(document.activeElement).toBe(assigned);
			await fixture.input.press('Tab');
			expect(document.activeElement).toBe(host);
			expect(root.activeElement).toBe(fallback);
			await fixture.input.press('Tab');
			expect(document.activeElement).toBe(after);
			await fixture.input.keyDown('Shift');
			await fixture.input.press('Tab');
			expect(root.activeElement).toBe(fallback);
			await fixture.input.press('Tab');
			expect(document.activeElement).toBe(assigned);
			await fixture.input.press('Tab');
			expect(document.activeElement).toBe(before);
			await fixture.input.keyUp('Shift');
		},
		['input.keyboard.navigation', 'shadow.slots.fallback'],
	);

	context.test(
		'keyup follows focus moved from a shadow descendant into the light tree',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const container = document.createElement('div');
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'closed' });
			const inside = document.createElement('input'),
				outside = document.createElement('input');
			root.append(inside);
			container.append(host, outside);
			fixture.connect(container as unknown as DOMElementContract);
			const calls: unknown[] = [];
			container.addEventListener('keydown', (event) => calls.push(['keydown', event.target]));
			container.addEventListener('keyup', (event) => calls.push(['keyup', event.target]));
			inside.focus();
			await fixture.input.keyDown('Shift');
			outside.focus();
			await fixture.input.keyUp('Shift');
			expect(calls).toEqual([
				['keydown', host],
				['keyup', outside],
			]);
			expect(root.activeElement).toBeNull();
			expect(document.activeElement).toBe(outside);
		},
	);
}
