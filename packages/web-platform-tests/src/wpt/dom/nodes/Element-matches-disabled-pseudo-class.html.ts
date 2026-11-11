import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function html({ document, connect }: DOMFixture, markup: string): Document {
		const container = document.createElement('div');
		container.innerHTML = markup;
		for (const child of Array.from(container.children)) connect(child);
		return document;
	}
	const disabledMarkup = `
<fieldset id="disabled-fieldset" disabled>
  <input id="input-in-disabled-fieldset">
  <select id="select-in-disabled-fieldset"></select>
  <button id="button-in-disabled-fieldset">Button</button>
  <textarea id="textarea-in-disabled-fieldset"></textarea>
</fieldset>
<fieldset id="enabled-fieldset">
  <input id="input-in-enabled-fieldset">
  <select id="select-in-enabled-fieldset"></select>
  <button id="button-in-enabled-fieldset">Button</button>
  <textarea id="textarea-in-enabled-fieldset"></textarea>
</fieldset>
<input id="disabled-input" disabled>
<input id="enabled-input">
<fieldset id="fieldset-with-legend"><legend>A Legend</legend></fieldset>`;

	const { expect } = context.runner;

	for (const [id, title] of [
		[
			'input-in-disabled-fieldset',
			'Input in disabled fieldset should match :disabled pseudo-class',
		],
		[
			'select-in-disabled-fieldset',
			'Select in disabled fieldset should match :disabled pseudo-class',
		],
		[
			'button-in-disabled-fieldset',
			'Button in disabled fieldset should match :disabled pseudo-class',
		],
		[
			'textarea-in-disabled-fieldset',
			'Textarea in disabled fieldset should match :disabled pseudo-class',
		],
		['disabled-fieldset', 'Disabled fieldset itself should match :disabled pseudo-class'],
	] as const) {
		context.test(`WPT Element-matches-disabled-pseudo-class.html: ${title}`, (fixture) => {
			const document = html(fixture, disabledMarkup);
			expect(document.getElementById(id)!.matches(':disabled')).toBe(true);
		});
	}
	context.test(
		'WPT Element-matches-disabled-pseudo-class.html: Input in enabled fieldset should match :enabled pseudo-class',
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			const input = document.getElementById('input-in-enabled-fieldset')!;
			expect(input.matches(':enabled')).toBe(true);
			expect(input.matches(':disabled')).toBe(false);
		},
	);
	context.test(
		"WPT Element-matches-disabled-pseudo-class.html: querySelectorAll(':disabled') should select all disabled elements in DOM order",
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			expect(
				Array.from(document.querySelectorAll(':disabled')).map((element) => element.id),
			).toEqual([
				'disabled-fieldset',
				'input-in-disabled-fieldset',
				'select-in-disabled-fieldset',
				'button-in-disabled-fieldset',
				'textarea-in-disabled-fieldset',
				'disabled-input',
			]);
		},
	);
	context.test(
		"WPT Element-matches-disabled-pseudo-class.html: querySelectorAll(':enabled') should not select elements in disabled fieldset",
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			const ids = Array.from(document.querySelectorAll(':enabled')).map((element) => element.id);
			for (const id of [
				'enabled-fieldset',
				'input-in-enabled-fieldset',
				'select-in-enabled-fieldset',
				'button-in-enabled-fieldset',
				'textarea-in-enabled-fieldset',
				'enabled-input',
			])
				expect(ids.includes(id)).toBe(true);
			for (const id of [
				'disabled-fieldset',
				'input-in-disabled-fieldset',
				'select-in-disabled-fieldset',
				'button-in-disabled-fieldset',
				'textarea-in-disabled-fieldset',
				'disabled-input',
			])
				expect(ids.includes(id)).toBe(false);
		},
	);
	context.test(
		"WPT Element-matches-disabled-pseudo-class.html: querySelector('input:enabled') should return the first enabled input",
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			expect(document.querySelector('input:enabled')!.id).toBe('input-in-enabled-fieldset');
		},
	);
	context.test(
		"WPT Element-matches-disabled-pseudo-class.html: querySelectorAll('input:disabled') should select inputs with disabled attribute and in disabled fieldset",
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			expect(
				Array.from(document.querySelectorAll('input:disabled')).map((input) => input.id),
			).toEqual(['input-in-disabled-fieldset', 'disabled-input']);
		},
	);
	context.test(
		'WPT Element-matches-disabled-pseudo-class.html: Fieldset with legend should not be considered disabled by default',
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			const fieldset = document.getElementById('fieldset-with-legend')!;
			expect(fieldset.matches(':disabled')).toBe(false);
			expect(fieldset.matches(':enabled')).toBe(true);
		},
	);
}
