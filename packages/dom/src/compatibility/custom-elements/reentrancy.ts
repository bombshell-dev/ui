import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/custom-elements.html#cereactions';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.observedAttributes'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'delivers nested attribute reactions before the nested mutation returns',
		({ document, globals }) => {
			const HTMLElement = globals('HTMLElement');
			const registry = globals('customElements');
			const name = uniqueName();
			const calls: string[] = [];
			class Item extends HTMLElement {
				static observedAttributes = ['first', 'second'];
				attributeChangedCallback(attributeName: string): void {
					calls.push(attributeName + ':start');
					if (attributeName === 'first') {
						this.setAttribute('second', 'value');
					}
					calls.push(attributeName + ':end');
				}
			}
			registry.define(name, Item);
			const item = document.createElement(name);
			item.setAttribute('first', 'value');
			expect(calls).toEqual(['first:start', 'second:start', 'second:end', 'first:end']);
		},
	);
}
