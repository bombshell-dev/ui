import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement } from '../../contracts/nodes.ts';

export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#click-focusable';
export const input = ['mouse'] as const;
// Click focusability is a host/platform policy. Enable this leaf for hosts that
// focus enabled buttons on primary mousedown.
export const requires = [
	'input.mouse.delivery',
	'focus.eligibility',
	'focus.transitions',
	'events.dispatch.cancellation',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('primary mousedown transfers focus before mouseup and click', async (fixture) => {
		const root = fixture.document.createElement('div');
		const first = fixture.document.createElement('button');
		const second = fixture.document.createElement('button');
		first.type = second.type = 'button';
		first.textContent = 'Previously focused';
		second.textContent = 'Mouse target';
		root.append(first, second);
		fixture.connect(root);
		first.focus();
		const calls: string[] = [];
		const activeDuringRelease: (DOMElement | null)[] = [];
		first.addEventListener('blur', () => calls.push('blur'));
		second.addEventListener('focus', () => calls.push('focus'));
		for (const type of ['mouseup', 'click'])
			second.addEventListener(type, () => activeDuringRelease.push(fixture.document.activeElement));
		await fixture.input.move(second);
		await fixture.input.down();
		expect(fixture.document.activeElement).toBe(second);
		expect(calls).toEqual(['blur', 'focus']);
		await fixture.input.up();
		expect(activeDuringRelease).toEqual([second, second]);
	});

	context.test(
		'canceling mousedown preserves focus while still allowing click delivery',
		async (fixture) => {
			const root = fixture.document.createElement('div');
			const first = fixture.document.createElement('button');
			const second = fixture.document.createElement('button');
			first.type = second.type = 'button';
			first.textContent = 'Keep focus';
			second.textContent = 'Cancel mousedown';
			root.append(first, second);
			fixture.connect(root);
			first.focus();
			const transitions: string[] = [];
			let clicks = 0;
			first.addEventListener('blur', () => transitions.push('blur'));
			second.addEventListener('focus', () => transitions.push('focus'));
			second.addEventListener('mousedown', (event) => event.preventDefault());
			second.addEventListener('click', () => clicks++);
			await fixture.input.click(second);
			expect(fixture.document.activeElement).toBe(first);
			expect(transitions).toEqual([]);
			expect(clicks).toBe(1);
		},
	);

	context.test(
		'clicking the focused control does not repeat focus transitions',
		async (fixture) => {
			const button = fixture.connect(fixture.document.createElement('button'));
			button.type = 'button';
			button.textContent = 'Already focused';
			button.focus();
			const transitions: string[] = [];
			let clicks = 0;
			for (const type of ['blur', 'focusout', 'focus', 'focusin'])
				button.addEventListener(type, (event) => transitions.push(event.type));
			button.addEventListener('click', () => clicks++);
			await fixture.input.click(button);
			expect(fixture.document.activeElement).toBe(button);
			expect(transitions).toEqual([]);
			expect(clicks).toBe(1);
		},
	);
}
