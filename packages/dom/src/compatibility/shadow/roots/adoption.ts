import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#concept-node-adopt';
const requiredGlobals = ['Document'] as const;
export { requiredGlobals as globals };
export const requires = ['shadow.roots.attachment', 'node.adoption'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('adopts shadow descendants with their host', ({ document, globals }) => {
		const Document = globals('Document');
		const other = new Document();
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'closed' });
		const child = document.createElement('span');
		root.append(child);
		other.adoptNode(host);
		expect(host.ownerDocument).toBe(other);
		expect(root.ownerDocument).toBe(other);
		expect(child.ownerDocument).toBe(other);
		expect(root.host).toBe(host);
		expect(root.firstChild).toBe(child);
	});

	context.test('updates shadow descendants ownership when the host is adopted', (fixture) => {
		const document = fixture.document as unknown as Document;
		const other = document.implementation.createHTMLDocument(''),
			host = other.createElement('div'),
			root = host.attachShadow({ mode: 'open' }),
			e = other.createElement('i');
		root.append(e);
		document.adoptNode(host);
		expect(root.ownerDocument).toBe(document);
		expect(e.ownerDocument).toBe(document);
		expect(root.host).toBe(host);
	});
}
