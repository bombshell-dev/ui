import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#focusing-steps';
export const requires = ['focus.eligibility', 'events.dispatch.target'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'allows a focus listener to move focus to another element',
		({ document, connect }) => {
			const root = document.createElement('div');
			const first = document.createElement('button');
			const second = document.createElement('button');
			root.append(first, second);
			connect(root);
			const calls: string[] = [];
			first.addEventListener('focus', () => {
				calls.push('first');
				second.focus();
			});
			second.addEventListener('focus', () => calls.push('second'));
			first.focus();
			expect(document.activeElement).toBe(second);
			expect(calls).toEqual(['first', 'second']);
		},
	);

	context.test('focus handlers can synchronously redirect focus to another control', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			a = document.createElement('input'),
			b = document.createElement('input');
		p.append(a, b);
		fixture.connect(p as unknown as DOMElementContract);
		const seen: string[] = [];
		a.addEventListener('focus', () => {
			seen.push('a');
			b.focus();
		});
		b.addEventListener('focus', () => seen.push('b'));
		a.focus();
		expect(document.activeElement).toBe(b);
		expect(seen).toEqual(['a', 'b']);
	});
}
