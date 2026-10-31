import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-reactions';
const requiredGlobals = ['HTMLElement', 'customElements', 'Document'] as const;
export { requiredGlobals as globals };
export const requires = ['customElements.registration'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('delivers adoptedCallback with old and new documents', ({ document, globals }) => {
		const HTMLElement = globals('HTMLElement');
		const Document = globals('Document');
		const other = new Document();
		const registry = globals('customElements');
		const name = uniqueName();
		const calls: unknown[][] = [];
		class Item extends HTMLElement {
			adoptedCallback(oldDocument: unknown, newDocument: unknown): void {
				calls.push([oldDocument, newDocument]);
			}
		}
		registry.define(name, Item);
		const item = document.createElement(name);
		other.adoptNode(item);
		expect(item.ownerDocument).toBe(other);
		expect(calls).toEqual([[document, other]]);
	});

	context.test('adoption callback receives exact old and new documents', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement,
			registry = fixture.globals('customElements') as unknown as CustomElementRegistry,
			name = uniqueName();
		const calls: unknown[] = [];
		class Item extends Base {
			adoptedCallback(old: Document, next: Document): void {
				calls.push([old, next]);
			}
		}
		registry.define(name, Item);
		const e = document.createElement(name),
			other = document.implementation.createHTMLDocument('');
		other.adoptNode(e);
		expect(calls).toEqual([[document, other]]);
		expect(e.ownerDocument).toBe(other);
	});
}
