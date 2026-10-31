import type { CompatibilityContext } from '../../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-range-stringifier';
export const requires = ['selection.range.boundaries'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('stringifies selected text but excludes comments', ({ document }) => {
		const root = document.createElement('div');
		const text = document.createTextNode('A😀B');
		root.append(text, document.createComment('ignored'), document.createTextNode('tail'));
		const range = document.createRange();
		range.selectNodeContents(root);
		expect(range.toString()).toBe('A😀Btail');
		range.setStart(text, 1);
		range.setEnd(text, 3);
		expect(range.toString()).toBe('😀');
	});

	context.test('stringifies only text portions and excludes comments', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = 'a<i>bc</i><!--ignored-->de';
		const r = document.createRange();
		r.setStart(p.firstChild!, 0);
		r.setEnd(p.lastChild!, 1);
		expect(r.toString()).toBe('abcd');
		r.collapse(true);
		expect(r.toString()).toBe('');
	});
}
