import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
import type { DOMEvent } from '../contracts/events.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/interaction.html#focus-update-steps';
const requiredGlobals = ['FocusEvent'] as const;
export { requiredGlobals as globals };
export const requires = ['focus.eligibility', 'events.dispatch.target'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'delivers focus transitions with related targets and ignores repeated focus',
		({ document, connect, globals, cleanup }) => {
			const FocusEvent = globals('FocusEvent');
			const root = document.createElement('div');
			const first = document.createElement('button');
			const second = document.createElement('button');
			root.append(first, second);
			connect(root);
			first.focus();
			const calls: string[] = [];
			for (const node of [first, second])
				for (const type of ['blur', 'focusout', 'focus', 'focusin']) {
					const listener = (event: DOMEvent): void => {
						if (!(event instanceof FocusEvent)) return expect.fail('Expected FocusEvent');
						expect(event.relatedTarget).toBe(node === first ? second : first);
						calls.push(type);
					};
					node.addEventListener(type, listener);
					cleanup(() => node.removeEventListener(type, listener));
				}
			second.focus();
			expect(document.activeElement).toBe(second);
			expect(calls).toEqual(['blur', 'focusout', 'focus', 'focusin']);
			second.focus();
			first.blur();
			expect(calls).toHaveLength(4);
		},
	);

	context.test(
		'repeated focus does not refire focus or blur and blur releases activeElement',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('input');
			fixture.connect(e as unknown as DOMElementContract);
			const seen: string[] = [];
			e.addEventListener('focus', () => seen.push('focus'));
			e.addEventListener('blur', () => seen.push('blur'));
			e.focus();
			e.focus();
			expect(seen).toEqual(['focus']);
			e.blur();
			expect(seen).toEqual(['focus', 'blur']);
			expect(document.activeElement).not.toBe(e);
		},
	);
}
