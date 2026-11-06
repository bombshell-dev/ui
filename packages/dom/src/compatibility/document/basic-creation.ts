import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-document-createelement';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('creates independent elements and text with stable names', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createElement('div'),
			b = document.createElement('div');
		expect(a).not.toBe(b);
		expect(a.nodeName).toBe('DIV');
		const t = document.createTextNode('abc');
		expect(t.nodeName).toBe('#text');
		expect(t.data).toBe('abc');
		expect(document.createTextNode('')).not.toBe(t);
	});
	context.test('stores Unicode and empty text without sharing state', (fixture) => {
		const document = fixture.document as unknown as Document;
		const a = document.createTextNode('😀\n'),
			b = document.createTextNode('');
		a.data = 'changed';
		expect(b.data).toBe('');
		expect(a.data).toBe('changed');
	});
}
