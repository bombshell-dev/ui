import type { CompatibilityContext } from '../context.ts';
import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';

export const spec = 'https://drafts.csswg.org/cssom/#dom-cssstylesheet-replace';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/cssom/CSSStyleSheet-constructable-replace-cssRules.html';
export const globals = ['CSSStyleSheet', 'getComputedStyle'] as const;
export const requires = ['style.stylesheets', 'style.computed'] as const;

// Adapted from WPT at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. Authors: Emilio Cobos Álvarez,
// Mozilla, Rakina Zata Amni. BSD-3-Clause; see ../../../test/wpt/LICENSE
// and ../../../docs/wpt-css-forms.md for the complete source inventory.

/** Registers constructed stylesheet identity, adoption and mutation cases. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'constructs empty ownerless sheets with explicit media and disabled state',
		(fixture) => {
			const Sheet = fixture.globals('CSSStyleSheet') as typeof CSSStyleSheet;
			const sheet = new Sheet();
			expect(sheet.ownerNode).toBeNull();
			expect(sheet.ownerRule).toBeNull();
			expect(sheet.href).toBeNull();
			expect(sheet.title).toBeNull();
			expect(sheet.disabled).toBe(false);
			expect(sheet.cssRules.length).toBe(0);
			expect(sheet.media.length).toBe(0);
			const configured = new Sheet({ disabled: true, media: 'screen, print' });
			expect(configured.disabled).toBe(true);
			expect(Array.from(configured.media)).toEqual(['screen', 'print']);
		},
	);
	for (const sync of [true, false]) {
		context.test(
			`retains live cssRules across ${sync ? 'replaceSync' : 'replace'} and adoption`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const Sheet = fixture.globals('CSSStyleSheet') as typeof CSSStyleSheet;
				const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
				const sheet = new Sheet(),
					rules = sheet.cssRules;
				const parent = document.createElement('div'),
					target = document.createElement('i');
				parent.style.color = 'rgb(1, 2, 3)';
				target.className = 'constructed-target';
				parent.append(target);
				fixture.connect(parent as unknown as DOMElementContract);
				const previous = [...document.adoptedStyleSheets];
				fixture.cleanup(() => {
					document.adoptedStyleSheets = previous;
				});
				for (const color of ['red', 'green']) {
					if (sync)
						expect(sheet.replaceSync(`.constructed-target {color:${color}}`)).toBeUndefined();
					else expect(await sheet.replace(`.constructed-target {color:${color}}`)).toBe(sheet);
					expect(sheet.cssRules).toBe(rules);
					expect(rules.length).toBe(1);
					expect((rules[0] as CSSStyleRule).style.color).toBe(color);
				}
				document.adoptedStyleSheets.push(sheet);
				expect(get(target).color).toBe('rgb(0, 128, 0)');
				expect(document.adoptedStyleSheets.pop()).toBe(sheet);
				expect(get(target).color).toBe('rgb(1, 2, 3)');
			},
		);
	}
	context.test('adoption order and disabled toggles immediately change the cascade', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Sheet = fixture.globals('CSSStyleSheet') as typeof CSSStyleSheet;
		const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
		const a = new Sheet(),
			b = new Sheet(),
			target = document.createElement('div');
		target.className = 'constructed-order';
		a.replaceSync('.constructed-order {color:red}');
		b.replaceSync('.constructed-order {color:blue}');
		fixture.connect(target as unknown as DOMElementContract);
		const previous = [...document.adoptedStyleSheets];
		fixture.cleanup(() => {
			document.adoptedStyleSheets = previous;
		});
		document.adoptedStyleSheets = [a, b];
		expect(get(target).color).toBe('rgb(0, 0, 255)');
		b.disabled = true;
		expect(get(target).color).toBe('rgb(255, 0, 0)');
		b.disabled = false;
		expect(get(target).color).toBe('rgb(0, 0, 255)');
		document.adoptedStyleSheets = [b, a];
		expect(get(target).color).toBe('rgb(255, 0, 0)');
	});
	context.test('rejects replacement and adoption of a style-element sheet', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const style = document.createElement('style');
		style.textContent = 'i {color:red}';
		fixture.connect(style as unknown as DOMElementContract);
		const sheet = style.sheet!;
		const previous = [...document.adoptedStyleSheets];
		fixture.cleanup(() => {
			document.adoptedStyleSheets = previous;
		});
		expect(() => sheet.replaceSync('i {color:blue}')).toThrow(
			expect.objectContaining({ name: 'NotAllowedError' }),
		);
		await expect(sheet.replace('i {color:blue}')).rejects.toMatchObject({
			name: 'NotAllowedError',
		});
		expect(() => {
			document.adoptedStyleSheets = [sheet];
		}).toThrow(expect.objectContaining({ name: 'NotAllowedError' }));
		expect([...document.adoptedStyleSheets]).toEqual(previous);
		expect((sheet.cssRules[0] as CSSStyleRule).style.color).toBe('red');
	});
	context.test(
		'updates all shadow adopters while retaining separate adoption lists',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const Sheet = fixture.globals('CSSStyleSheet') as typeof CSSStyleSheet;
			const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
			const sheet = new Sheet();
			const roots = [0, 1].map(() => {
				const host = document.createElement('div');
				host.style.color = 'rgb(1, 2, 3)';
				const root = host.attachShadow({ mode: 'open' });
				root.append(document.createElement('i'));
				root.adoptedStyleSheets = [sheet];
				fixture.connect(host as unknown as DOMElementContract);
				return root;
			});
			sheet.replaceSync('i {color:red}');
			expect(roots.map((root) => get(root.firstElementChild!).color)).toEqual([
				'rgb(255, 0, 0)',
				'rgb(255, 0, 0)',
			]);
			sheet.replaceSync('i {color:blue}');
			expect(roots.map((root) => get(root.firstElementChild!).color)).toEqual([
				'rgb(0, 0, 255)',
				'rgb(0, 0, 255)',
			]);
			roots[0]!.adoptedStyleSheets = [];
			expect(roots.map((root) => get(root.firstElementChild!).color)).toEqual([
				'rgb(1, 2, 3)',
				'rgb(0, 0, 255)',
			]);
		},
		['shadow.roots.attachment'],
	);
}
