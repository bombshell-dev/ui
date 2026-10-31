import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle';
export const requires = ['style.inline', 'style.stylesheets', 'style.customProperties'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('computes layout independent inherited properties and remains live', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		fixture.connect(p as unknown as DOMElementContract);
		p.style.color = 'rgb(1, 2, 3)';
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
		const s = get(e);
		expect(s.color).toBe('rgb(1, 2, 3)');
		p.style.color = 'rgb(4, 5, 6)';
		expect(s.color).toBe('rgb(4, 5, 6)');
		e.style.color = 'rgb(7, 8, 9)';
		expect(s.color).toBe('rgb(7, 8, 9)');
	});
	context.test(
		'applies specificity, source order, importance and inline declarations',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const style = document.createElement('style'),
				e = document.createElement('i');
			e.id = 'test';
			e.className = 'x';
			style.textContent =
				'i {color:rgb(1, 1, 1)} .x {color:rgb(2, 2, 2)} #test {color:rgb(3, 3, 3)} #test {color:rgb(4, 4, 4)}';
			fixture.connect(style as unknown as DOMElementContract);
			fixture.connect(e as unknown as DOMElementContract);
			const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
			expect(get(e).color).toBe('rgb(4, 4, 4)');
			e.style.color = 'rgb(5, 5, 5)';
			expect(get(e).color).toBe('rgb(5, 5, 5)');
			(style.sheet!.cssRules[0] as CSSStyleRule).style.setProperty(
				'color',
				'rgb(6, 6, 6)',
				'important',
			);
			expect(get(e).color).toBe('rgb(6, 6, 6)');
		},
	);
	context.test('inherits custom properties and resolves variable fallbacks', (fixture) => {
		const document = fixture.document as unknown as Document;
		const p = document.createElement('div'),
			e = document.createElement('i');
		p.append(e);
		fixture.connect(p as unknown as DOMElementContract);
		p.style.setProperty('--ink', 'rgb(1, 2, 3)');
		e.style.color = 'var(--ink)';
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
		expect(get(e).color).toBe('rgb(1, 2, 3)');
		e.style.color = 'var(--missing, rgb(4, 5, 6))';
		expect(get(e).color).toBe('rgb(4, 5, 6)');
	});
	context.test('returns a readonly computed declaration', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		fixture.connect(e as unknown as DOMElementContract);
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
		expect(() => get(e).setProperty('color', 'red')).toThrow(
			expect.objectContaining({ name: 'NoModificationAllowedError' }),
		);
	});
}
