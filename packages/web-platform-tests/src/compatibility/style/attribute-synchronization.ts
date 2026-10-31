import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/cssom/#dom-elementcssinlinestyle-style';
export const requires = ['style.inline', 'element.attributes'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('updates style attribute from declaration mutations', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.style.color = 'red';
		expect(e.getAttribute('style')).toBe('color: red;');
		e.style.removeProperty('color');
		expect(e.getAttribute('style')).toBe('');
	});
	context.test(
		'updates retained declarations from attribute replacement and removal',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div'),
				s = e.style;
			e.setAttribute('style', 'color: red; display: block');
			expect(s.color).toBe('red');
			expect(s.display).toBe('block');
			e.setAttribute('style', 'color: blue');
			expect(s.color).toBe('blue');
			expect(s.display).toBe('');
			e.removeAttribute('style');
			expect(s.length).toBe(0);
			expect(e.style).toBe(s);
		},
	);
	context.test('replaces all declarations when cssText is assigned', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		e.style.cssText = 'color:red; display:block';
		e.style.cssText = 'visibility: hidden';
		expect(e.style.color).toBe('');
		expect(e.style.length).toBe(1);
		expect(e.getAttribute('style')).toBe('visibility: hidden;');
	});
}
