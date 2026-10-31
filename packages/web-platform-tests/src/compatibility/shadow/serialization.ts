import type { CompatibilityContext } from '../context.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-element-gethtml';
export const requires = ['shadow.roots.attachment', 'parsing.serialization'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('serializes explicitly included and serializable shadow roots', ({ document }) => {
		const host = document.createElement('div');
		const root = host.attachShadow({ mode: 'open', serializable: true });
		const child = document.createElement('span');
		child.textContent = 'shadow';
		root.append(child);
		host.append(document.createTextNode('light'));
		expect(host.getHTML()).toBe('light');
		const serialized = host.getHTML({ serializableShadowRoots: true });
		expect(serialized).toContain('shadowrootmode="open"');
		expect(serialized).toContain('<span>shadow</span>');
		expect(serialized.endsWith('light')).toBe(true);
		expect(host.getHTML({ shadowRoots: [root] })).toBe(serialized);
	});

	context.test('innerHTML and outerHTML exclude shadow markup by default', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div');
		host.innerHTML = '<i>light</i>';
		host.attachShadow({ mode: 'open' }).innerHTML = '<b>shadow</b>';
		expect(host.innerHTML).toBe('<i>light</i>');
		expect(host.outerHTML).toBe('<div><i>light</i></div>');
	});
}
