import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#interface-nodeiterator';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('iterates inclusive root in order and applies masks', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<i>a</i><b>b</b>';
		const it = document.createNodeIterator(p, 1);
		expect(it.nextNode()).toBe(p);
		expect(it.nextNode()).toBe(p.firstChild);
		expect(it.nextNode()).toBe(p.lastChild);
		expect(it.nextNode()).toBeNull();
		expect(it.previousNode()).toBe(p.lastChild);
	});
	context.test('skips rejected nodes but traverses their descendants', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<i><b></b></i>';
		const it = document.createNodeIterator(p, 1, (n) => (n.nodeName === 'I' ? 2 : 1));
		expect(it.nextNode()).toBe(p);
		expect(it.nextNode()).toBe(p.querySelector('b'));
		expect(it.nextNode()).toBeNull();
	});
	context.test('updates its reference after removing the current node', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<i></i><b></b>';
		const it = document.createNodeIterator(p, 1);
		it.nextNode();
		const first = it.nextNode()!;
		first.parentNode!.removeChild(first);
		expect(it.nextNode()).toBe(p.firstChild);
	});
}
