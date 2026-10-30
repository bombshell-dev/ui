import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://dom.spec.whatwg.org/#dom-parentnode-queryselector';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('returns tree-ordered static snapshots and first match', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<i class=x></i><b class=x></b>';
		const found = p.querySelectorAll('.x');
		expect(found.length).toBe(2);
		expect(p.querySelector('.x')).toBe(found[0]);
		p.appendChild(document.createElement('i')).className = 'x';
		expect(found.length).toBe(2);
		expect(p.querySelectorAll('.x').length).toBe(3);
		expect(p.querySelector('.missing')).toBeNull();
	});
	context.test('handles combinators, attributes, scope, matches and closest', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		p.innerHTML = '<section><i data-x="A" class=x></i><b></b></section>';
		const i = p.querySelector('i')!;
		expect(i.matches('section > i[data-x="A"]:first-child')).toBe(true);
		expect(i.closest('section')).toBe(p.firstChild);
		expect(i.closest('.x')).toBe(i);
		expect(p.querySelector(':scope > section > i + b')).toBe(i.nextSibling);
		expect(i.closest('aside')).toBeNull();
	});
	context.test('rejects invalid selectors consistently', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div');
		for (const operation of [
			() => p.querySelector('['),
			() => p.querySelectorAll('['),
			() => p.matches('['),
			() => p.closest('['),
		])
			expect(operation).toThrow(expect.objectContaining({ name: 'SyntaxError' }));
	});
}
