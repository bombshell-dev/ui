import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import type { CompatibilityContext } from '../context.ts';
export const spec = 'https://drafts.csswg.org/cssom/#the-cssstylesheet-interface';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('exposes live rule lists and inserts/deletes at explicit indices', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('style');
		e.textContent = 'i { color: red }';
		fixture.connect(e as unknown as DOMElementContract);
		const sheet = e.sheet!,
			rules = sheet.cssRules;
		expect(rules.length).toBe(1);
		expect(sheet.insertRule('b { color: blue }', 1)).toBe(1);
		expect(rules.length).toBe(2);
		expect((rules[1] as CSSStyleRule).selectorText).toBe('b');
		sheet.deleteRule(0);
		expect(rules.length).toBe(1);
		expect((rules[0] as CSSStyleRule).style.color).toBe('blue');
	});
	context.test('rejects invalid rules and out of bounds indices without mutation', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('style');
		fixture.connect(e as unknown as DOMElementContract);
		const s = e.sheet!;
		expect(() => s.insertRule('i {}', 1)).toThrow(
			expect.objectContaining({ name: 'IndexSizeError' }),
		);
		expect(() => s.insertRule('not a rule', 0)).toThrow(
			expect.objectContaining({ name: 'SyntaxError' }),
		);
		expect(() => s.deleteRule(0)).toThrow(expect.objectContaining({ name: 'IndexSizeError' }));
		expect(s.cssRules.length).toBe(0);
	});
	context.test('keeps style rules writable and linked to their parent sheet', (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('style');
		e.textContent = 'i {color:red}';
		fixture.connect(e as unknown as DOMElementContract);
		const s = e.sheet!,
			rule = s.cssRules[0] as CSSStyleRule;
		expect(rule.parentStyleSheet).toBe(s);
		rule.style.color = 'blue';
		rule.selectorText = 'b';
		expect(rule.cssText).toContain('b');
		expect(rule.cssText).toContain('blue');
	});
}
