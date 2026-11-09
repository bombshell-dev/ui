import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#enqueue-a-custom-element-upgrade-reaction';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
export const requires = [
	'customElements.upgrading',
	'customElements.observedAttributes',
	'customElements.connection',
] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'upgrades connected candidates with existing attributes before connection callbacks',
		({ document, globals, connect }) => {
			const HTMLElement = globals('HTMLElement');
			const registry = globals('customElements');
			const name = uniqueName();
			const root = document.createElement('div');
			const item = document.createElement(name);
			item.setAttribute('observed', 'value');
			root.append(item);
			connect(root);
			const calls: string[] = [];
			class Item extends HTMLElement {
				static observedAttributes = ['observed'];
				constructor() {
					super();
					calls.push('constructor');
				}
				attributeChangedCallback(): void {
					calls.push('attribute');
				}
				connectedCallback(): void {
					calls.push('connected');
				}
			}
			registry.define(name, Item);
			expect(calls).toEqual(['constructor', 'attribute', 'connected']);
			expect(root.firstChild).toBe(item);
		},
	);
}
