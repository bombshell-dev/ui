import type { DOMEvent } from '../../contracts/events.ts';
import type { CompatibilityContext } from '../../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#resetting-a-form';
export const requires = ['elements.input.value', 'events.dispatch.cancellation'] as const;
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/forms/resetting-a-form/reset-form.html';

// Select/reset-activation cases adapted from WPT at
// b719612f963a05ece9c89a7dd7598c1c59618874. Copyright © web-platform-tests
// contributors. Original author: Intel. BSD-3-Clause;
// see ../../../../test/wpt/LICENSE and ../../../../docs/wpt-css-forms.md.

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('restores control defaults unless the reset event is canceled', (fixture) => {
		const document = fixture.document;
		const form = document.createElement('form');
		const input = document.createElement('input');
		input.defaultValue = 'original';
		input.value = 'edited';
		form.appendChild(input);
		const cancel = (event: DOMEvent): void => {
			event.preventDefault();
		};
		form.addEventListener('reset', cancel);
		form.reset();
		expect(input.value).toBe('edited');
		form.removeEventListener('reset', cancel);
		form.reset();
		expect(input.value).toBe('original');
		input.defaultValue = 'new default';
		expect(input.value).toBe('new default');
	});

	context.test('cancellation leaves dirty control state untouched', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('input');
		e.defaultValue = 'default';
		e.value = 'dirty';
		form.append(e);
		let target: unknown;
		form.addEventListener('reset', (event) => {
			target = event.target;
			event.preventDefault();
		});
		form.reset();
		expect(target).toBe(form);
		expect(e.value).toBe('dirty');
	});

	context.test('reset restores text, checkbox and textarea defaults together', (fixture) => {
		const document = fixture.document as unknown as Document;
		const form = document.createElement('form'),
			e = document.createElement('input'),
			c = document.createElement('input'),
			t = document.createElement('textarea');
		c.type = 'checkbox';
		e.defaultValue = 'a';
		c.defaultChecked = true;
		t.defaultValue = 'b';
		form.append(e, c, t);
		e.value = 'dirty';
		c.checked = false;
		t.value = 'dirty';
		form.reset();
		expect(e.value).toBe('a');
		expect(c.checked).toBe(true);
		expect(t.value).toBe('b');
	});

	for (const activation of ['method', 'button', 'input'] as const) {
		context.test(
			`restores single and multiple select defaults through reset ${activation}`,
			(fixture) => {
				const document = fixture.document as unknown as Document;
				const form = document.createElement('form');
				const selects = [false, false, true].map((multiple, index) => {
					const select = document.createElement('select');
					select.multiple = multiple;
					for (let i = 0; i < 3; i++) {
						const option = document.createElement('option');
						option.value = String(i);
						option.defaultSelected = index === 1 ? i === 1 : index === 2 && i > 0;
						select.append(option);
					}
					form.append(select);
					select.value = index === 0 ? '2' : '0';
					return select;
				});
				const dirty = [['2'], ['0'], ['0']];
				const selected = (): string[][] =>
					selects.map((select) => Array.from(select.selectedOptions, (option) => option.value));
				expect(selected()).toEqual(dirty);
				const statesDuringReset: string[][][] = [];
				form.addEventListener('reset', () => statesDuringReset.push(selected()));
				if (activation === 'method') form.reset();
				else {
					const trigger = document.createElement(activation);
					trigger.type = 'reset';
					form.append(trigger);
					trigger.disabled = true;
					trigger.click();
					expect(statesDuringReset).toEqual([]);
					expect(selected()).toEqual(dirty);
					trigger.disabled = false;
					trigger.addEventListener('click', (event) => event.preventDefault(), { once: true });
					trigger.click();
					expect(statesDuringReset).toEqual([]);
					expect(selected()).toEqual(dirty);
					trigger.click();
				}
				expect(statesDuringReset).toEqual([dirty]);
				expect(selected()).toEqual([['0'], ['1'], ['1', '2']]);
				selects[2]!.options[0]!.defaultSelected = true;
				expect(selected()[2]).toEqual(['0', '1', '2']);
			},
			activation === 'method'
				? ['elements.select.selection', 'elements.option.selectedness']
				: [
						'elements.select.selection',
						'elements.option.selectedness',
						'events.listeners.once',
						activation === 'button' ? 'elements.button.activation' : 'elements.input.activation',
					],
		);
	}
}
