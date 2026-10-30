import type { CompatibilityContext } from '../../context.ts';
import type { DOMEvent } from '../../contracts/events.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-event-istrusted';
export const input = ['mouse'] as const;
export const requires = ['input.mouse.delivery', 'input.mouse.hover'] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('input-generated down, up, and click events are trusted', async (fixture) => {
		const button = fixture.connect(fixture.document.createElement('button'));
		button.type = 'button';
		button.textContent = 'Trusted click';
		const events: DOMEvent[] = [];
		for (const type of ['mousedown', 'mouseup', 'click'])
			button.addEventListener(type, (event) => events.push(event));
		await fixture.input.click(button);
		expect(events.map((event) => [event.type, event.isTrusted])).toEqual([
			['mousedown', true],
			['mouseup', true],
			['click', true],
		]);
	});

	context.test('input-generated hover and movement events are trusted', async (fixture) => {
		const root = fixture.document.createElement('div');
		const first = fixture.document.createElement('button');
		const second = fixture.document.createElement('button');
		first.type = second.type = 'button';
		first.textContent = 'Start';
		second.textContent = 'Destination';
		root.append(first, second);
		fixture.connect(root);
		await fixture.input.move(first);
		const events: DOMEvent[] = [];
		for (const target of [first, second])
			for (const type of ['mouseout', 'mouseleave', 'mouseover', 'mouseenter', 'mousemove'])
				target.addEventListener(type, (event) => events.push(event));
		await fixture.input.move(second);
		for (const type of ['mouseout', 'mouseleave', 'mouseover', 'mouseenter', 'mousemove']) {
			const matching = events.filter((event) => event.type === type);
			expect(matching.length).toBeGreaterThan(0);
			expect(matching.every((event) => event.isTrusted)).toBe(true);
		}
	});
}
