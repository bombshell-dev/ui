import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/css-cascade/#cascade';
export const requires = ['style.computed'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('uses inheritance, initial and unset independently of layout', (fixture) => {
		const document = fixture.document as unknown as Document;
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle,
			p = document.createElement('div'),
			e = document.createElement('i');
		p.style.color = 'rgb(1, 2, 3)';
		p.style.visibility = 'hidden';
		p.append(e);
		fixture.connect(p as unknown as DOMElementContract);
		e.style.color = 'inherit';
		expect(get(e).color).toBe('rgb(1, 2, 3)');
		e.style.visibility = 'initial';
		expect(get(e).visibility).toBe('visible');
		e.style.visibility = 'unset';
		expect(get(e).visibility).toBe('hidden');
	});
	context.test('honors inline important over stylesheet important', (fixture) => {
		const document = fixture.document as unknown as Document;
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle,
			s = document.createElement('style'),
			e = document.createElement('i');
		e.id = 'cascade';
		s.textContent = '#cascade {color:rgb(1, 1, 1)!important}';
		fixture.connect(s as unknown as DOMElementContract);
		fixture.connect(e as unknown as DOMElementContract);
		e.style.setProperty('color', 'rgb(2, 2, 2)', 'important');
		expect(get(e).color).toBe('rgb(2, 2, 2)');
	});
	context.test(
		'resolves custom property cycles to a fallback without changing inline declarations',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const get = fixture.globals('getComputedStyle') as typeof getComputedStyle,
				e = document.createElement('div');
			fixture.connect(e as unknown as DOMElementContract);
			e.style.setProperty('--a', 'var(--b)');
			e.style.setProperty('--b', 'var(--a)');
			e.style.color = 'var(--a, rgb(3, 4, 5))';
			expect(get(e).color).toBe('rgb(3, 4, 5)');
			expect(e.style.getPropertyValue('--a')).toBe('var(--b)');
		},
	);
	context.test('updates cascade after rule removal and style element removal', (fixture) => {
		const document = fixture.document as unknown as Document;
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle,
			p = document.createElement('div'),
			e = document.createElement('i'),
			s = document.createElement('style');
		p.style.color = 'rgb(9, 9, 9)';
		e.className = 'cascade';
		p.append(e);
		s.textContent = '.cascade {color:rgb(1, 1, 1)} .cascade {color:rgb(2, 2, 2)}';
		fixture.connect(p as unknown as DOMElementContract);
		fixture.connect(s as unknown as DOMElementContract);
		expect(get(e).color).toBe('rgb(2, 2, 2)');
		s.sheet!.deleteRule(1);
		expect(get(e).color).toBe('rgb(1, 1, 1)');
		s.remove();
		expect(get(e).color).toBe('rgb(9, 9, 9)');
	});
	context.test(
		'scopes shadow styles and inherits host values into the shadow tree',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const get = fixture.globals('getComputedStyle') as typeof getComputedStyle,
				host = document.createElement('div'),
				root = host.attachShadow({ mode: 'open' }),
				e = document.createElement('i'),
				s = document.createElement('style'),
				outside = document.createElement('i');
			host.style.color = 'rgb(1, 2, 3)';
			root.append(e, s);
			s.textContent = 'i {visibility:hidden}';
			fixture.connect(host as unknown as DOMElementContract);
			fixture.connect(outside as unknown as DOMElementContract);
			expect(get(e).color).toBe('rgb(1, 2, 3)');
			expect(get(e).visibility).toBe('hidden');
			expect(get(outside).visibility).toBe('visible');
		},
		['shadow.roots.attachment'],
	);
}
