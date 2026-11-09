import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#concept-node-clone';
const requiredGlobals = ['Element'] as const;
export { requiredGlobals as globals };
export const requires = ['shadow.roots.attachment', 'node.cloning'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('clones clonable roots and omits ordinary shadow roots', ({ document, globals }) => {
		const Element = globals('Element');
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open', clonable: true });
		root.append(document.createTextNode('shadow'));
		const clone = host.cloneNode(true);
		if (!(clone instanceof Element)) return expect.fail('Element clone expected');
		expect(clone.shadowRoot?.clonable).toBe(true);
		expect(clone.shadowRoot?.textContent).toBe('shadow');
		expect(clone.shadowRoot).not.toBe(root);
		const ordinary = document.createElement('div');
		ordinary.attachShadow({ mode: 'open' });
		const other = ordinary.cloneNode(true);
		if (!(other instanceof Element)) return expect.fail('Element clone expected');
		expect(other.shadowRoot).toBeNull();
	});

	context.test('ordinary shadow roots are not cloned without the clonable option', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div');
		host.attachShadow({ mode: 'open' }).append(document.createElement('i'));
		expect((host.cloneNode(true) as Element).shadowRoot).toBeNull();
	});

	context.test('clonable roots clone contents independently while keeping mode', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div'),
			root = host.attachShadow({ mode: 'open', clonable: true });
		root.innerHTML = '<i>x</i>';
		const copy = host.cloneNode(true) as Element;
		expect(copy.shadowRoot!.mode).toBe('open');
		expect(copy.shadowRoot!.innerHTML).toBe('<i>x</i>');
		expect(copy.shadowRoot!.firstChild).not.toBe(root.firstChild);
	});
}
