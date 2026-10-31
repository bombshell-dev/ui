// Adapted from WPT checked.html, valid-invalid.html and disabled.html at
// b719612f963a05ece9c89a7dd7598c1c59618874. Copyright web-platform-tests contributors;
// Denis Ah-Kang. BSD-3-Clause; see ../../../test/wpt/LICENSE and ../../../docs/wpt-state-styles.md.
import type { CompatibilityContext } from '../context.ts';
import { createStyleFixture } from '../style-fixture.ts';
export const spec = 'https://html.spec.whatwg.org/multipage/semantics-other.html#pseudo-classes';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/selectors/pseudo-classes/valid-invalid.html';
export const requires = [
	'element.selectors',
	'parsing.fragments',
	'style.computed',
	'elements.input.checkedness',
	'elements.input.validation',
] as const;

export const globals = ['getComputedStyle'] as const;
/** Registers control state, selector and computed style interactions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'checked follows live state rather than the default attribute and changes with input type',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<input type="checkbox" checked>',
				css: 'input {color:rgb(1,2,3)} input:checked {color:rgb(4,5,6)}',
			});
			const target = root.querySelector('input')!;
			expect(target.matches(':checked')).toBe(true);
			expect(get(target).color).toBe('rgb(4, 5, 6)');
			target.checked = false;
			expect(target.hasAttribute('checked')).toBe(true);
			expect(target.matches(':checked')).toBe(false);
			expect(get(target).color).toBe('rgb(1, 2, 3)');
			target.checked = true;
			target.type = 'text';
			expect(target.matches(':checked')).toBe(false);
			expect(get(target).color).toBe('rgb(1, 2, 3)');
			target.type = 'checkbox';
			expect(target.matches(':checked')).toBe(true);
		},
	);
	context.test(
		'option checked matching follows selectedness and select reset',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<form><select><option selected>A</option><option>B</option></select></form>',
				css: 'option {color:rgb(1,2,3)} option:checked {color:rgb(4,5,6)}',
			});
			const form = root.querySelector('form')!,
				select = root.querySelector('select')!;
			const first = select.options[0]!,
				second = select.options[1]!;
			second.selected = true;
			expect(first.matches(':checked')).toBe(false);
			expect(second.matches(':checked')).toBe(true);
			expect(get(first).color).toBe('rgb(1, 2, 3)');
			expect(get(second).color).toBe('rgb(4, 5, 6)');
			form.reset();
			expect(first.matches(':checked')).toBe(true);
			expect(second.matches(':checked')).toBe(false);
			expect(get(first).color).toBe('rgb(4, 5, 6)');
		},
		['elements.select.selection', 'elements.option.selectedness', 'elements.form.reset'],
	);
	context.test(
		'required, pattern and custom validity invalidate selectors and retained styles',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<input required pattern="[A-Z]{2}">',
				css: 'input:invalid {color:rgb(1,2,3)} input:valid {color:rgb(4,5,6)}',
			});
			const target = root.querySelector('input')!,
				retained = get(target);
			expect(target.matches(':invalid')).toBe(true);
			expect(retained.color).toBe('rgb(1, 2, 3)');
			target.value = 'AB';
			expect(target.matches(':valid')).toBe(true);
			expect(retained.color).toBe('rgb(4, 5, 6)');
			target.setCustomValidity('Rejected');
			expect(target.matches(':invalid')).toBe(true);
			expect(retained.color).toBe('rgb(1, 2, 3)');
			target.setCustomValidity('');
			target.value = 'bad';
			expect(target.matches(':invalid')).toBe(true);
			target.removeAttribute('pattern');
			expect(target.matches(':valid')).toBe(true);
		},
	);
	for (const tag of ['form', 'fieldset'] as const) {
		context.test(
			`${tag} aggregate validity updates on insertion, type changes and removal`,
			(fixture) => {
				const { document, root, get } = createStyleFixture(fixture, {
					markup: `<${tag}></${tag}>`,
					css: `${tag}:valid {color:rgb(1,2,3)} ${tag}:invalid {color:rgb(4,5,6)}`,
				});
				const parent = root.querySelector(tag)!;
				expect(parent.matches(':valid')).toBe(true);
				const target = document.createElement('input');
				target.type = 'text';
				target.min = '8';
				target.value = '4';
				parent.append(target);
				expect(parent.matches(':valid')).toBe(true);
				target.type = 'number';
				expect(parent.matches(':invalid')).toBe(true);
				expect(get(parent).color).toBe('rgb(4, 5, 6)');
				target.value = '9';
				expect(parent.matches(':valid')).toBe(true);
				expect(get(parent).color).toBe('rgb(1, 2, 3)');
				target.value = '4';
				target.remove();
				expect(parent.matches(':valid')).toBe(true);
			},
			['elements.form.validation', 'elements.input.numericValue'],
		);
	}
	context.test(
		'disabled fieldsets style descendants but exempt the first legend subtree',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup:
					'<fieldset disabled><legend><input id="exempt"></legend><input id="blocked"></fieldset>',
				css: 'input:enabled {color:rgb(1,2,3)} input:disabled {color:rgb(4,5,6)}',
			});
			const fieldset = root.querySelector('fieldset')!,
				exempt = root.querySelector<HTMLInputElement>('#exempt')!,
				blocked = root.querySelector<HTMLInputElement>('#blocked')!;
			expect(blocked.disabled).toBe(false);
			expect(blocked.matches(':disabled')).toBe(true);
			expect(get(blocked).color).toBe('rgb(4, 5, 6)');
			expect(exempt.matches(':enabled')).toBe(true);
			expect(get(exempt).color).toBe('rgb(1, 2, 3)');
			fieldset.disabled = false;
			expect(blocked.matches(':enabled')).toBe(true);
			expect(get(blocked).color).toBe('rgb(1, 2, 3)');
			fieldset.disabled = true;
			fieldset.querySelector('legend')!.append(blocked);
			expect(blocked.matches(':enabled')).toBe(true);
		},
		['elements.fieldset.disabled'],
	);
	context.test(
		'disabled and readonly controls are excluded from valid and invalid matching',
		(fixture) => {
			const { root, get } = createStyleFixture(fixture, {
				markup: '<input required>',
				css: 'input {color:rgb(1,2,3)} input:invalid {color:rgb(4,5,6)}',
			});
			const target = root.querySelector('input')!;
			for (const property of ['disabled', 'readOnly'] as const) {
				target[property] = true;
				expect(target.matches(':valid, :invalid')).toBe(false);
				expect(get(target).color).toBe('rgb(1, 2, 3)');
				target[property] = false;
				expect(target.matches(':invalid')).toBe(true);
				expect(get(target).color).toBe('rgb(4, 5, 6)');
			}
		},
	);
}
