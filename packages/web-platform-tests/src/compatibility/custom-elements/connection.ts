import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.registration'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'delivers connection and disconnection when a defined element moves',
		({ document, globals, connect }) => {
			const HTMLElement = globals('HTMLElement');
			const registry = globals('customElements');
			const name = uniqueName();
			const calls: string[] = [];
			class Item extends HTMLElement {
				connectedCallback(): void {
					calls.push('connected');
				}
				disconnectedCallback(): void {
					calls.push('disconnected');
				}
			}
			registry.define(name, Item);
			const root = document.createElement('div');
			connect(root);
			const item = document.createElement(name);
			expect(calls).toEqual([]);
			root.append(item);
			item.remove();
			root.append(item);
			expect(calls).toEqual(['connected', 'disconnected', 'connected']);
		},
	);

	context.test('moving connected elements invokes disconnect then reconnect', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement,
			registry = fixture.globals('customElements') as unknown as CustomElementRegistry,
			name = uniqueName();
		const seen: string[] = [];
		class Item extends Base {
			connectedCallback(): void {
				seen.push('connected');
			}
			disconnectedCallback(): void {
				seen.push('disconnected');
			}
		}
		registry.define(name, Item);
		const p = document.createElement('div'),
			q = document.createElement('div');
		fixture.connect(p as unknown as DOMElementContract);
		fixture.connect(q as unknown as DOMElementContract);
		const e = document.createElement(name);
		p.append(e);
		q.append(e);
		e.remove();
		expect(seen).toEqual(['connected', 'disconnected', 'connected', 'disconnected']);
	});
}
