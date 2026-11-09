import type { CompatibilityContext } from '../context.ts';
import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';

export const spec = 'https://drafts.csswg.org/css-cascade-5/#layering';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/css-cascade/layer-basic.html';
export const globals = ['getComputedStyle'] as const;
export const requires = ['style.computed'] as const;

// Adapted from layer-basic.html and layer-important.html in WPT at
// b719612f963a05ece9c89a7dd7598c1c59618874. Copyright © web-platform-tests
// contributors. Authors: Antti Koivisto, Romain Menke. BSD-3-Clause;
// see ../../../test/wpt/LICENSE and ../../../docs/wpt-css-forms.md.

/** Registers layout-independent cascade layer ordering cases. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const cases = [
		[
			'unlayered normal rules outrank higher-specificity layered rules',
			'.layer-target {color:green} @layer {#layer-target {color:red}}',
		],
		[
			'later anonymous layers win independently of specificity',
			'@layer {#layer-target {color:red}} @layer {.layer-target {color:green}}',
		],
		[
			'reopening a named layer preserves its original order',
			'@layer a {.layer-target {color:red}} @layer b {.layer-target {color:green}} @layer a {.layer-target {color:red}}',
		],
		[
			'statement order controls layers whose blocks appear in reverse order',
			'@layer a, b; @layer b {.layer-target {color:green}} @layer a {.layer-target {color:red}}',
		],
		[
			'unlayered declarations inside a layer outrank its nested layers',
			'@layer a {.layer-target {color:green} @layer inner {#layer-target {color:red}}}',
		],
		[
			'important declarations reverse layer order and outrank unlayered important rules',
			'@layer a, b; @layer b {#layer-target {color:red!important}} @layer a {.layer-target {color:green!important}} #layer-target {color:red!important}',
		],
	] as const;
	for (const [name, css] of cases) {
		context.test(name, (fixture) => {
			const document = fixture.document as unknown as Document;
			const style = document.createElement('style'),
				target = document.createElement('div');
			target.id = 'layer-target';
			target.className = 'layer-target';
			style.textContent = css;
			fixture.connect(style as unknown as DOMElementContract);
			fixture.connect(target as unknown as DOMElementContract);
			const get = fixture.globals('getComputedStyle') as typeof getComputedStyle;
			expect(get(target).color).toBe('rgb(0, 128, 0)');
		});
	}
}
