import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflect';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('reflects string properties and attribute removal', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		expect(e.id).toBe('');
		expect(e.title).toBe('');
		e.id = 'a';
		expect(e.getAttribute('id')).toBe('a');
		e.setAttribute('title', 'hello');
		expect(e.title).toBe('hello');
		e.removeAttribute('title');
		expect(e.title).toBe('');
		e.lang = 'en';
		expect(e.getAttribute('lang')).toBe('en');
	});
	context.test('reflects boolean presence independently of attribute spelling', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		expect(e.hidden).toBe(false);
		e.setAttribute('hidden', 'false');
		expect(e.hidden).toBe(true);
		e.hidden = false;
		expect(e.hasAttribute('hidden')).toBe(false);
		e.hidden = true;
		expect(e.getAttribute('hidden')).toBe('');
	});
	context.test('reflects tabIndex integer defaults and invalid input', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('div');
		expect(e.tabIndex).toBe(-1);
		e.tabIndex = 3;
		expect(e.getAttribute('tabindex')).toBe('3');
		e.setAttribute('tabindex', 'bad');
		expect(e.tabIndex).toBe(-1);
		expect(document.createElement('button').tabIndex).toBe(0);
	});
}
