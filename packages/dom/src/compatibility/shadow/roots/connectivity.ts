import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#connected';
export const requires = ['shadow.roots.attachment'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'follows host connectivity while preserving the shadow tree root',
		({ document, connect }) => {
			const host = document.createElement('div');
			const root = host.attachShadow({ mode: 'open' });
			const child = document.createElement('span');
			root.append(child);
			expect(child.isConnected).toBe(false);
			connect(host);
			expect(root.isConnected).toBe(true);
			expect(child.isConnected).toBe(true);
			expect(child.getRootNode()).toBe(root);
			expect(child.getRootNode({ composed: true })).toBe(document);
			expect(host.contains(child)).toBe(false);
			host.remove();
			expect(root.isConnected).toBe(false);
			expect(child.parentNode).toBe(root);
		},
	);

	context.test(
		'composed roots change with host connectivity while ordinary roots stay shadow roots',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const host = document.createElement('div'),
				root = host.attachShadow({ mode: 'open' }),
				child = document.createElement('i');
			root.append(child);
			expect(child.isConnected).toBe(false);
			expect(child.getRootNode({ composed: true })).toBe(host);
			fixture.connect(host as unknown as DOMElementContract);
			expect(root.isConnected).toBe(true);
			expect(child.getRootNode({ composed: true })).toBe(document);
			expect(child.getRootNode()).toBe(root);
			host.remove();
			expect(root.isConnected).toBe(false);
		},
	);
}
