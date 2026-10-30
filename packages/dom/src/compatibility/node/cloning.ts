import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://dom.spec.whatwg.org/#concept-node-clone';
const requiredGlobals = ['Event'] as const;
export { requiredGlobals as globals };
export const requires = ['events.dispatch.target'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'copies descendants without sharing identity or registered listeners',
		({ document, globals }) => {
			const Event = globals('Event');
			const source = document.createElement('div');
			const text = document.createTextNode('one');
			source.appendChild(text);
			let called = 0;
			source.addEventListener('probe', () => {
				called++;
			});
			const shallow = source.cloneNode();
			const deep = source.cloneNode(true);
			expect(shallow.childNodes.length).toBe(0);
			expect(deep.firstChild).not.toBe(text);
			expect(deep.textContent).toBe('one');
			expect(deep.parentNode).toBeNull();
			expect(deep.ownerDocument).toBe(document);
			deep.dispatchEvent(new Event('probe'));
			expect(called).toBe(0);
			source.dispatchEvent(new Event('probe'));
			expect(called).toBe(1);
		},
	);

	context.test('shallow clones copy attributes independently without children', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.setAttribute('title', 'before');
		p.append('text');
		const copy = p.cloneNode() as Element;
		expect(copy).not.toBe(p);
		expect(copy.ownerDocument).toBe(document);
		expect(copy.parentNode).toBeNull();
		expect(copy.childNodes.length).toBe(0);
		expect(copy.getAttribute('title')).toBe('before');
		copy.setAttribute('title', 'after');
		expect(p.getAttribute('title')).toBe('before');
	});

	context.test('does not copy registered event listeners', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		let count = 0;
		p.addEventListener('x', () => count++);
		const copy = p.cloneNode(true);
		const Event = fixture.globals('Event');
		copy.dispatchEvent(new Event('x') as unknown as Event);
		expect(count).toBe(0);
		p.dispatchEvent(new Event('x') as unknown as Event);
		expect(count).toBe(1);
	});
}
