import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/cssom/#serialize-a-css-declaration-block';
export const requires = ['style.inline'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('recovers from invalid values and resolves duplicate priority', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.cssText = 'color:red; invalid: x; color:blue!important; color:green; display: block';
		expect(s.color).toBe('blue');
		expect(s.getPropertyPriority('color')).toBe('important');
		expect(s.display).toBe('block');
		expect(s.length).toBe(2);
	});
	context.test('expands and serializes shorthands', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.margin = '1px 2px';
		expect(s.marginTop).toBe('1px');
		expect(s.marginRight).toBe('2px');
		expect(s.marginBottom).toBe('1px');
		expect(s.marginLeft).toBe('2px');
		expect(s.getPropertyValue('margin')).toBe('1px 2px');
		s.removeProperty('margin');
		expect(s.marginTop).toBe('');
	});
	context.test('handles comments, quoted separators and case insensitive names', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.cssText = 'COLOR: /* comment */ red; font-family: "a;b";';
		expect(s.color).toBe('red');
		expect(s.fontFamily).toBe('"a;b"');
		expect(s.cssText).toContain('color: red;');
	});
}
