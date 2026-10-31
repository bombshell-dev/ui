import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-node-isconnected';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('updates connectivity on attachment and removal', ({ document, connect }) => {
		const parent = document.createElement('div');
		const child = document.createTextNode('child');
		parent.appendChild(child);
		expect(parent.isConnected).toBe(false);
		expect(child.getRootNode()).toBe(parent);
		connect(parent);
		expect(child.isConnected).toBe(true);
		expect(child.getRootNode()).toBe(document);
		parent.remove();
		expect(child.isConnected).toBe(false);
		expect(child.getRootNode()).toBe(parent);
	});

	context.test('updates connected state recursively on insertion and removal', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			child = document.createElement('i');
		p.append(child);
		expect(child.isConnected).toBe(false);
		fixture.connect(p as unknown as DOMElementContract);
		expect(child.isConnected).toBe(true);
		expect(child.getRootNode()).toBe(document);
		p.remove();
		expect(child.isConnected).toBe(false);
		expect(child.getRootNode()).toBe(p);
	});
}
