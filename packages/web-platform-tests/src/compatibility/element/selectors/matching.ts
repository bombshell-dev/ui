// Adapted from the WPT files listed below at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause; see ../../../../test/wpt/LICENSE.
import type { CompatibilityContext, DOMFixture } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const sourceFiles = [
	'dom/nodes/Element-closest-null-selectors.html',
	'dom/nodes/Element-closest.html',
	'dom/nodes/Element-matches-complex-nth-last-of-type.html',
	'dom/nodes/Element-matches-disabled-pseudo-class.html',
	'dom/nodes/Element-matches-active-pseudo-class.html',
] as const;

function html(fixture: DOMFixture, markup: string): Document {
	const document = fixture.document as unknown as Document;
	const container = document.createElement('div');
	container.innerHTML = markup;
	for (const child of Array.from(container.children))
		fixture.connect(child as unknown as DOMElementContract);
	return document;
}

const closestMarkup = `
  <div id="test8" class="div3" style="display:none">
    <div id="test7" class="div2">
      <div id="test6" class="div1">
        <form id="test10" class="form2"></form>
        <form id="test5" class="form1" name="form-a">
          <input id="test1" class="input1" required>
          <fieldset class="fieldset2" id="test2">
            <select id="test3" class="select1" required>
              <option default id="test4" value="">Test4</option>
              <option selected id="test11">Test11</option>
              <option id="test12">Test12</option>
              <option id="test13">Test13</option>
            </select>
            <input id="test9" type="text" required>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
  <div id="log"></div>`;

const closestCases = [
	['select', 'test12', 'test3'],
	['fieldset', 'test13', 'test2'],
	['div', 'test13', 'test6'],
	['body', 'test3', 'body'],
	['[default]', 'test4', 'test4'],
	['[selected]', 'test4', ''],
	['[selected]', 'test11', 'test11'],
	['[name="form-a"]', 'test12', 'test5'],
	['form[name="form-a"]', 'test13', 'test5'],
	['input[required]', 'test9', 'test9'],
	['select[required]', 'test9', ''],
	['div:not(.div1)', 'test13', 'test7'],
	['div.div3', 'test6', 'test8'],
	['div#test7', 'test1', 'test7'],
	['.div3 > .div2', 'test12', 'test7'],
	['.div3 > .div1', 'test12', ''],
	['form > input[required]', 'test9', ''],
	['fieldset > select[required]', 'test12', 'test3'],
	['input + fieldset', 'test6', ''],
	['form + form', 'test3', 'test5'],
	['form + form', 'test5', 'test5'],
	[':empty', 'test10', 'test10'],
	[':last-child', 'test11', 'test2'],
	[':first-child', 'test12', 'test3'],
	[':invalid', 'test11', 'test2'],
	[':scope', 'test4', 'test4'],
	['select > :scope', 'test4', 'test4'],
	['div > :scope', 'test4', ''],
	[':has(> :scope)', 'test4', 'test3'],
] as const;

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

/** Registers every assertion from the pinned closest and matches regressions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const selector of ['#null', '.null']) {
		context.test(
			`WPT Element-closest-null-selectors.html: element.closest('${selector}') should return null`,
			(fixture) => {
				const document = html(fixture, '<p id="testP">Some text</p>');
				expect(document.getElementById('testP')!.closest(selector)).toBeNull();
			},
		);
	}
	for (const [selector, elementId, targetId] of closestCases) {
		context.test(
			`WPT Element-closest.html: Element.closest with context node '${elementId}' and selector '${selector}'`,
			(fixture) => {
				const document = html(fixture, closestMarkup);
				const oldId = document.body.getAttribute('id');
				document.body.id = 'body';
				fixture.cleanup(() => {
					if (oldId === null) document.body.removeAttribute('id');
					else document.body.id = oldId;
				});
				const result = document.getElementById(elementId)!.closest(selector);
				if (result === null) expect(targetId).toBe('');
				else expect(result.id).toBe(targetId);
			},
			selector === ':invalid'
				? ['elements.form.validation', 'elements.input.validation', 'elements.select.validation']
				: [],
		);
	}
	context.test(
		'WPT Element-matches-complex-nth-last-of-type.html: element.matches() with complex :nth-last-of-type selector',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const div = document.createElement('div');
			div.innerHTML = '<div class="b"><div class="c"></div></div>';
			const c = div.querySelector('.c')!;
			expect(c.matches('.a:nth-last-of-type(1) .b .c')).toBe(false);
		},
	);
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
		context.test(
			`WPT Element-matches-disabled-pseudo-class.html: ${title}`,
			(fixture) => {
				const document = html(fixture, disabledMarkup);
				expect(document.getElementById(id)!.matches(':disabled')).toBe(true);
			},
			['elements.fieldset.disabled'],
		);
	}
	context.test(
		'WPT Element-matches-disabled-pseudo-class.html: Input in enabled fieldset should match :enabled pseudo-class',
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			const input = document.getElementById('input-in-enabled-fieldset')!;
			expect(input.matches(':enabled')).toBe(true);
			expect(input.matches(':disabled')).toBe(false);
		},
		['elements.fieldset.disabled'],
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
		['elements.fieldset.disabled'],
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
		['elements.fieldset.disabled'],
	);
	context.test(
		"WPT Element-matches-disabled-pseudo-class.html: querySelector('input:enabled') should return the first enabled input",
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			expect(document.querySelector('input:enabled')!.id).toBe('input-in-enabled-fieldset');
		},
		['elements.fieldset.disabled'],
	);
	context.test(
		"WPT Element-matches-disabled-pseudo-class.html: querySelectorAll('input:disabled') should select inputs with disabled attribute and in disabled fieldset",
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			expect(
				Array.from(document.querySelectorAll('input:disabled')).map((input) => input.id),
			).toEqual(['input-in-disabled-fieldset', 'disabled-input']);
		},
		['elements.fieldset.disabled'],
	);
	context.test(
		'WPT Element-matches-disabled-pseudo-class.html: Fieldset with legend should not be considered disabled by default',
		(fixture) => {
			const document = html(fixture, disabledMarkup);
			const fieldset = document.getElementById('fieldset-with-legend')!;
			expect(fieldset.matches(':disabled')).toBe(false);
			expect(fieldset.matches(':enabled')).toBe(true);
		},
		['elements.fieldset.disabled'],
	);
	for (const [id, title] of [
		['test', 'Regular div should not match :active by default'],
		['button', 'Button should not match :active by default'],
		['link', 'Link should not match :active by default'],
	] as const) {
		context.test(`WPT Element-matches-active-pseudo-class.html: ${title}`, (fixture) => {
			const document = html(
				fixture,
				'<div id="test">Test element</div>\n<button id="button">Button element</button>\n<a id="link" href="#">Link element</a>',
			);
			expect(document.getElementById(id)!.matches(':active')).toBe(false);
		});
	}
	context.test(
		'WPT Element-matches-active-pseudo-class.html: No elements should match :active by default via querySelectorAll',
		(fixture) => {
			const document = html(
				fixture,
				'<div id="test">Test element</div>\n<button id="button">Button element</button>\n<a id="link" href="#">Link element</a>',
			);
			expect(document.querySelectorAll(':active').length).toBe(0);
		},
	);
}
