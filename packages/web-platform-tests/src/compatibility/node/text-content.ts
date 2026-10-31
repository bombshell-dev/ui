import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#dom-node-textcontent';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'excludes comments and replaces children while document textContent stays null',
		({ document }) => {
			const parent = document.createElement('div');
			const text = document.createTextNode('one');
			const span = document.createElement('span');
			span.textContent = 'two';
			parent.append(text, document.createComment('ignored'), span);
			expect(parent.textContent).toBe('onetwo');
			parent.textContent = 'replacement';
			expect(parent.childNodes.length).toBe(1);
			expect(parent.firstChild?.nodeType).toBe(3);
			expect(text.parentNode).toBeNull();
			parent.textContent = null;
			expect(parent.childNodes.length).toBe(0);
			expect(parent.textContent).toBe('');
			expect(document.textContent).toBeNull();
		},
	);

	context.test('excludes comments and replaces descendants with one text node', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.append('a', document.createComment('ignored'), document.createElement('i'));
		p.lastChild!.textContent = 'b';
		expect(p.textContent).toBe('ab');
		const old = p.firstChild!;
		p.textContent = 'next';
		expect(p.childNodes.length).toBe(1);
		expect(p.textContent).toBe('next');
		expect(old.parentNode).toBeNull();
		p.textContent = null;
		expect(p.childNodes.length).toBe(0);
	});

	context.test('keeps Document textContent null with no setter mutation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const before = Array.from(document.childNodes);
		expect(document.textContent).toBeNull();
		Reflect.set(document, 'textContent', 'ignored');
		expect(document.textContent).toBeNull();
		expect(Array.from(document.childNodes)).toEqual(before);
	});
}
