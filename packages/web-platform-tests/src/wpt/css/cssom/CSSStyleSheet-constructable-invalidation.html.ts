import type { CompatibilityContext } from '../../../shared/context.ts';

const markup2 = `<!doctype html>
<meta charset="utf-8">
<title>CSSStyleSheet rule mutation invalidation</title>




<span id="span1">Should be green.</span>
<span id="span2">Should be green.</span>

`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'mutating constructed CSSStyleSheet applied to root invalidates styles',
		async ({ document, CSSStyleSheet, getComputedStyle, cleanup }) => {
			const span1 = document.getElementById('span1')!,
				span2 = document.getElementById('span2')!;

			const sheet = new CSSStyleSheet();
			sheet.replaceSync('span {color:var(--color, red);}');
			document.adoptedStyleSheets = [sheet];
			cleanup(() => {
				document.adoptedStyleSheets = [];
			});
			expect(getComputedStyle(span1).color, 'Sheet should apply').toBe('rgb(255, 0, 0)');
			(sheet.rules[0] as CSSStyleRule).style.setProperty('--color', 'green');
			expect(getComputedStyle(span1).color, 'Sheet should invalidate style').toBe('rgb(0, 128, 0)');
			document.adoptedStyleSheets = [];
			expect(getComputedStyle(span1).color, 'Removing sheet should apply').toBe('rgb(0, 0, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'mutating constructed CSSStyleSheet applied to shadowdom invalidates styles',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const span1 = document.getElementById('span1')!,
				span2 = document.getElementById('span2')!;

			span1.attachShadow({ mode: 'open' });
			span1.shadowRoot!.append(document.createElement('slot'));
			const sheet = new CSSStyleSheet();
			sheet.replaceSync(':host {color:var(--color, red);}');
			span1.shadowRoot!.adoptedStyleSheets = [sheet];
			expect(getComputedStyle(span1).color, 'Sheet should apply').toBe('rgb(255, 0, 0)');
			(sheet.rules[0] as CSSStyleRule).style.setProperty('--color', 'green');
			expect(getComputedStyle(span1).color, 'Sheet should invalidate style').toBe('rgb(0, 128, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
	context.test(
		'mutating dependent constructed CSSStyleSheet applied to shadowdom invalidates styles',
		async ({ document, CSSStyleSheet, getComputedStyle }) => {
			const span1 = document.getElementById('span1')!,
				span2 = document.getElementById('span2')!;

			span2.attachShadow({ mode: 'open' });
			span2.shadowRoot!.append(document.createElement('slot'));
			const sheet1 = new CSSStyleSheet();
			const sheet2 = new CSSStyleSheet();
			sheet1.replaceSync(':host {color:var(--color, hotpink);}');
			sheet2.replaceSync(':host {--color: blue}');
			const style2 = (sheet2.rules[0] as CSSStyleRule).style;
			span2.shadowRoot!.adoptedStyleSheets = [sheet1, sheet2];
			expect(getComputedStyle(span2).color, 'Sheet should apply').toBe('rgb(0, 0, 255)');
			style2.setProperty('--color', 'green');
			expect(getComputedStyle(span2).color, 'Sheet should invalidate style').toBe('rgb(0, 128, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup2,
			},
		},
	);
}
