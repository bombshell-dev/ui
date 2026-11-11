import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><div id="log"></div>

<div style="display:none">
  <form id="testform">
    <legend id="testlegend">radio</legend>
  </form>
</div>

<div style="display:none">
  <form id="testformWithFieldSet">
    <fieldset>
    <legend id="legendWithFieldSet">radio</legend>
    </fieldset>
  </form>
</div>
`;
	context.test(
		"Check if legend.form returns its parent when it's inside a fieldset",
		({ document }) => {
			let legendEle = document.getElementById('legendWithFieldSet') as HTMLLegendElement;
			expect(legendEle.form).not.toBe(null);
			expect(legendEle.form).toBe(document.getElementById('testformWithFieldSet'));
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'Check if legend.form return null when legend has no fieldset element as its parent',
		({ document }) => {
			let legendEle = document.getElementById('testlegend') as HTMLLegendElement;
			expect(legendEle.form).toBe(null);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
