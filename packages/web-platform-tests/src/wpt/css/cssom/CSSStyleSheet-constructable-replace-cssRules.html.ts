import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const sync of [true, false]) {
		context.test(
			`cssRules tests (sync: ${sync})`,
			async ({ document, CSSStyleSheet, getComputedStyle }) => {
				let sheet = new CSSStyleSheet();
				let rules = sheet.cssRules;
				function replace(text: string) {
					return sync ? sheet.replaceSync(text) : sheet.replace(text);
				}
				function assert_color(color: string) {
					expect(sheet.cssRules, 'StyleSheet.cssRules is [SameObject]').toBe(rules);
					expect(rules.length, 'Should have one rule').toBe(1);
					expect((rules[0] as CSSStyleRule).style.color, 'Should be the right css rule').toBe(
						color,
					);
				}
				async function replace_and_test(color: string) {
					await replace(`p { color: ${color} }`);
					expect(sheet.cssRules, 'StyleSheet.cssRules is [SameObject]').toBe(rules);
					expect(rules.length, 'Should have one rule').toBe(1);
					expect((rules[0] as CSSStyleRule).style.color, 'Should be the right css rule').toBe(
						color,
					);
				}

				await replace_and_test('red');
				await replace_and_test('green');
				document.adoptedStyleSheets.push(sheet);
				expect(getComputedStyle(document.querySelector('p')!).color, 'Sheet should apply').toBe(
					'rgb(0, 128, 0)',
				);
				(document.adoptedStyleSheets.pop as (...args: unknown[]) => CSSStyleSheet | undefined)(
					sheet,
				);
				expect(
					getComputedStyle(document.querySelector('p')!).color,
					'Sheet should stop applying',
				).not.toBe('rgb(0, 128, 0)');
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<meta charset="utf-8">\n<title>CSSStyleSheet.replace reflects the right cssRules.</title>\n\n\n\n\n\n\n<p></p>\n\n',
				},
			},
		);
	}
}
