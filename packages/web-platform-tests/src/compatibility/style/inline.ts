import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/cssom/#the-cssstyledeclaration-interface';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('starts empty and keeps declaration identity', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div'),
			s = e.style;
		expect(s.length).toBe(0);
		expect(s.cssText).toBe('');
		expect(s.item(0)).toBe('');
		expect(s.getPropertyValue('color')).toBe('');
		expect(s.getPropertyPriority('color')).toBe('');
		s.color = 'red';
		expect(e.style).toBe(s);
		expect(s.getPropertyValue('color')).toBe('red');
	});
	context.test('sets, replaces and removes properties with priorities', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.setProperty('color', 'red', 'important');
		s.setProperty('display', 'block');
		expect(s.length).toBe(2);
		expect(s.item(0)).toBe('color');
		expect(s.getPropertyPriority('color')).toBe('important');
		s.setProperty('color', 'blue');
		expect(s.item(0)).toBe('color');
		expect(s.getPropertyPriority('color')).toBe('');
		expect(s.removeProperty('color')).toBe('blue');
		expect(s.item(0)).toBe('display');
		expect(s.removeProperty('missing')).toBe('');
	});
	context.test('ignores invalid declarations and invalid priorities atomically', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.color = 'red';
		s.color = 'not-a-color';
		expect(s.color).toBe('red');
		s.setProperty('color', 'blue', 'urgent');
		expect(s.color).toBe('red');
		s.setProperty('unknown-property', 'x');
		expect(s.length).toBe(1);
		s.setProperty('color', '');
		expect(s.length).toBe(0);
	});
}
