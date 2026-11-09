import type { CompatibilityContext } from '../context.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-element-insertadjacenthtml';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('inserts markup in all four adjacent positions', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		e.insertAdjacentHTML('beforebegin', '<a></a>');
		e.insertAdjacentHTML('afterbegin', '<b></b>');
		e.insertAdjacentHTML('beforeend', '<em></em>');
		e.insertAdjacentHTML('afterend', '<u></u>');
		expect(Array.from(p.children).map((n) => n.localName)).toEqual(['a', 'i', 'u']);
		expect(Array.from(e.children).map((n) => n.localName)).toEqual(['b', 'em']);
	});
	context.test('replaces outerHTML without changing the removed node', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		e.textContent = 'old';
		p.append(e);
		e.outerHTML = '<b>new</b><u></u>';
		expect(e.parentNode).toBeNull();
		expect(e.textContent).toBe('old');
		expect(p.children.length).toBe(2);
		expect(p.firstChild!.textContent).toBe('new');
	});
	context.test('rejects invalid insertion positions without mutating', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.innerHTML = '<i></i>';
		expect(() => e.insertAdjacentHTML('invalid' as InsertPosition, 'x')).toThrow(
			expect.objectContaining({ name: 'SyntaxError' }),
		);
		expect(e.innerHTML).toBe('<i></i>');
	});
}
