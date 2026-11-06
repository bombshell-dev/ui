import type { CompatibilityContext } from '../context.ts';
import type { DOMEvent } from '../contracts/events.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#invoke-custom-element-reactions';
const requiredGlobals = ['HTMLElement', 'customElements', 'window', 'ErrorEvent'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.observedAttributes'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'reports callback failures as error events without throwing from the mutation',
		({ document, globals, cleanup }) => {
			const HTMLElement = globals('HTMLElement');
			const ErrorEvent = globals('ErrorEvent');
			const window = globals('window');
			const registry = globals('customElements');
			const name = uniqueName();
			const failure = new TypeError('custom element callback failure');
			const errors: unknown[] = [];
			const listener = (event: DOMEvent): void => {
				if (event instanceof ErrorEvent) {
					if (event.error !== failure) return;
					errors.push(event.error);
					event.preventDefault();
				}
			};
			window.addEventListener('error', listener);
			cleanup(() => window.removeEventListener('error', listener));
			class Item extends HTMLElement {
				static observedAttributes = ['observed'];
				attributeChangedCallback(): void {
					throw failure;
				}
			}
			registry.define(name, Item);
			const item = document.createElement(name);
			expect(() => item.setAttribute('observed', 'value')).not.toThrow();
			expect(errors).toEqual([failure]);
		},
	);
}
