import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#dom-customelementregistry-upgrade';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.registration'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'upgrades a detached element in place, preserving its descendants',
		({ document, globals }) => {
			const HTMLElement = globals('HTMLElement');
			const registry = globals('customElements');
			const name = uniqueName();
			const root = document.createElement('div');
			const element = document.createElement(name);
			const text = document.createTextNode('preserved');
			element.append(text);
			root.append(element);
			let constructed = 0;
			class Item extends HTMLElement {
				constructor() {
					super();
					constructed++;
				}
			}
			registry.define(name, Item);
			expect(constructed).toBe(0);
			registry.upgrade(root);
			expect(root.firstChild).toBe(element);
			expect(element).toBeInstanceOf(Item);
			expect(element.firstChild).toBe(text);
			expect(constructed).toBe(1);
			registry.upgrade(root);
			expect(constructed).toBe(1);
		},
	);

	context.test('upgrades connected candidates automatically in tree order', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement,
			registry = fixture.globals('customElements') as unknown as CustomElementRegistry,
			name = uniqueName();
		const p = document.createElement('div'),
			a = document.createElement(name),
			b = document.createElement(name);
		p.append(a, b);
		fixture.connect(p as unknown as DOMElementContract);
		const seen: unknown[] = [];
		class Item extends Base {
			constructor() {
				super();
				seen.push(this);
			}
		}
		registry.define(name, Item);
		expect(seen).toEqual([a, b]);
		expect(p.firstChild).toBe(a);
		registry.upgrade(p);
		expect(seen).toEqual([a, b]);
	});
}
