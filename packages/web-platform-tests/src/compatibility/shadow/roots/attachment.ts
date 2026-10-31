import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-element-attachshadow';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'exposes open roots and hides closed roots without changing their host',
		({ document }) => {
			for (const mode of ['open', 'closed'] as const) {
				const host = document.createElement('div');
				const root = host.attachShadow({ mode });
				expect(root.host).toBe(host);
				expect(root.mode).toBe(mode);
				expect(root.parentNode).toBeNull();
				expect(root.ownerDocument).toBe(document);
				expect(host.shadowRoot).toBe(mode === 'open' ? root : null);
				expect(() => host.attachShadow({ mode })).toThrow(
					expect.objectContaining({ name: 'NotSupportedError' }),
				);
			}
		},
	);

	context.test('keeps light and shadow trees separate with stable root identity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const host = document.createElement('div'),
			light = document.createElement('i');
		host.append(light);
		const root = host.attachShadow({ mode: 'open' }),
			child = document.createElement('b');
		root.append(child);
		expect(host.firstChild).toBe(light);
		expect(root.firstChild).toBe(child);
		expect(root.getRootNode()).toBe(root);
		expect(child.getRootNode()).toBe(root);
		expect(host.contains(child)).toBe(false);
		expect(host.shadowRoot).toBe(root);
	});
}
