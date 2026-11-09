import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty';
export const requires = ['style.inline'] as const;
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('preserves case sensitive custom properties and priorities', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.setProperty('--A', 'one');
		s.setProperty('--a', 'two', 'important');
		expect(s.getPropertyValue('--A')).toBe('one');
		expect(s.getPropertyValue('--a')).toBe('two');
		expect(s.getPropertyPriority('--a')).toBe('important');
		expect(s.removeProperty('--A')).toBe('one');
		expect(s.getPropertyValue('--a')).toBe('two');
	});
	context.test('round trips variable references without resolving inline values', (fixture) => {
		const document = fixture.document as unknown as Document;
		const s = document.createElement('div').style;
		s.setProperty('--size', '12px');
		s.setProperty('width', 'var(--size, 1px)');
		expect(s.getPropertyValue('width')).toBe('var(--size, 1px)');
		s.setProperty('--size', '20px');
		expect(s.getPropertyValue('width')).toBe('var(--size, 1px)');
	});
}
