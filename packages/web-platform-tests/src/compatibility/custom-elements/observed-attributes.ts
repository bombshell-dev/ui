import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.registration'] as const;
// Coverage reference; this leaf is independently authored, not an imported WPT file.
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/custom-elements/reactions/Element.html';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'observes requested attributes including equal-value writes and removal',
		({ document, globals }) => {
			const HTMLElement = globals('HTMLElement');
			const registry = globals('customElements');
			const name = uniqueName();
			const calls: unknown[][] = [];
			class Item extends HTMLElement {
				static observedAttributes = ['watched'];
				attributeChangedCallback(
					attributeName: string,
					old: string | null,
					value: string | null,
					namespace: string | null,
				): void {
					calls.push([attributeName, old, value, namespace]);
				}
			}
			registry.define(name, Item);
			const item = document.createElement(name);
			item.setAttribute('other', 'ignored');
			item.setAttribute('watched', 'one');
			item.setAttribute('watched', 'one');
			item.removeAttribute('watched');
			expect(calls).toEqual([
				['watched', null, 'one', null],
				['watched', 'one', 'one', null],
				['watched', 'one', null, null],
			]);
		},
	);

	context.test('initial upgrade reactions follow attribute order before connection', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement,
			registry = fixture.globals('customElements') as unknown as CustomElementRegistry,
			name = uniqueName();
		const e = document.createElement(name);
		e.setAttribute('b', '2');
		e.setAttribute('a', '1');
		fixture.connect(e as unknown as DOMElementContract);
		const calls: unknown[] = [];
		class Item extends Base {
			static observedAttributes = ['a', 'b'];
			attributeChangedCallback(attribute: string, old: string | null, value: string | null): void {
				calls.push([attribute, old, value]);
			}
			connectedCallback(): void {
				calls.push('connected');
			}
		}
		registry.define(name, Item);
		expect(calls).toEqual([['b', null, '2'], ['a', null, '1'], 'connected']);
	});
}
