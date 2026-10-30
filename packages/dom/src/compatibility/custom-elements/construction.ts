import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/dom.html#htmlconstructor';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.registration'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'constructs defined autonomous elements directly and through createElement',
		({ document, globals }) => {
			const HTMLElement = globals('HTMLElement');
			const registry = globals('customElements');
			const name = uniqueName();
			let constructions = 0;
			class Item extends HTMLElement {
				constructor() {
					super();
					constructions++;
				}
			}
			registry.define(name, Item);
			const direct = new Item();
			const created = document.createElement(name);
			expect(direct.localName).toBe(name);
			expect(direct.ownerDocument).toBe(document);
			expect(created).toBeInstanceOf(Item);
			expect(created.ownerDocument).toBe(document);
			expect(constructions).toBe(2);
		},
	);

	context.test(
		'creates distinct registered instances owned by the requesting document',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement,
				registry = fixture.globals('customElements') as unknown as CustomElementRegistry,
				name = uniqueName();
			class Item extends Base {}
			registry.define(name, Item);
			const a = document.createElement(name),
				b = document.createElement(name);
			expect(a).toBeInstanceOf(Item);
			expect(b).toBeInstanceOf(Item);
			expect(a).not.toBe(b);
			expect(a.ownerDocument).toBe(document);
			expect(a.localName).toBe(name);
		},
	);
}
