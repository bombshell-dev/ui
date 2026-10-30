import type { CompatibilityContext, DOMFixture } from '../context.ts';
import type { DOMElement as DOMElementContract } from '../contracts/nodes.ts';
import { uniqueName } from '../unique-name.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-face-example';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/custom-elements/form-associated/form-associated-callback.html';
export const globals = ['HTMLElement', 'customElements', 'FormData'] as const;
export const requires = [
	'customElements.registration',
	'customElements.construction',
	'elements.form.formData',
	'elements.form.reset',
	'elements.form.validation',
	'events.dispatch.capture',
] as const;

// Adapted and extended from custom-elements/form-associated WPT cases at
// b719612f963a05ece9c89a7dd7598c1c59618874. Copyright © web-platform-tests
// contributors. BSD-3-Clause; see ../../../test/wpt/LICENSE.txt and the
// complete file inventory in ../../../docs/wpt-css-forms.md.

interface FormControl extends HTMLElement {
	readonly internals: ElementInternals;
	readonly associations: (HTMLFormElement | null)[];
	readonly disabledChanges: boolean[];
	readonly resets: string[];
	observeReset: HTMLInputElement | undefined;
}

function defineControl(fixture: DOMFixture): FormControl {
	const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement;
	const registry = fixture.globals('customElements') as unknown as CustomElementRegistry;
	class Control extends Base {
		static formAssociated = true;
		readonly internals = this.attachInternals();
		readonly associations: (HTMLFormElement | null)[] = [];
		readonly disabledChanges: boolean[] = [];
		readonly resets: string[] = [];
		observeReset: HTMLInputElement | undefined;
		formAssociatedCallback(form: HTMLFormElement | null): void {
			this.associations.push(form);
		}
		formDisabledCallback(disabled: boolean): void {
			this.disabledChanges.push(disabled);
		}
		formResetCallback(): void {
			this.resets.push(this.observeReset?.value ?? 'reset');
		}
	}
	registry.define(uniqueName(), Control);
	return new Control();
}

/** Registers custom element form ownership, entry-list and lifecycle interactions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'updates ownership, form collections and callbacks on association changes',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const control = defineControl(fixture),
				first = document.createElement('form'),
				second = document.createElement('form');
			second.id = uniqueName();
			fixture.connect(first as unknown as DOMElementContract);
			fixture.connect(second as unknown as DOMElementContract);
			expect(control.internals.form).toBeNull();
			expect(control.associations).toEqual([]);
			first.append(control);
			expect(control.internals.form).toBe(first);
			expect(Array.from(first.elements)).toEqual([control]);
			control.setAttribute('form', second.id);
			expect(control.internals.form).toBe(second);
			expect(first.elements.length).toBe(0);
			expect(Array.from(second.elements)).toEqual([control]);
			control.setAttribute('form', 'missing-form');
			expect(control.internals.form).toBeNull();
			control.removeAttribute('form');
			expect(control.internals.form).toBe(first);
			control.remove();
			expect(control.internals.form).toBeNull();
			expect(control.associations).toEqual([first, second, null, first, null]);
		},
		['elements.form.controls'],
	);
	context.test(
		'contributes string values in tree order and null removes the contribution',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const Data = fixture.globals('FormData') as unknown as typeof FormData;
			const control = defineControl(fixture),
				form = document.createElement('form'),
				before = document.createElement('input'),
				after = document.createElement('input');
			before.name = after.name = 'entry';
			before.value = 'before';
			after.value = 'after';
			control.setAttribute('name', 'entry');
			form.append(before, control, after);
			control.internals.setFormValue('custom');
			expect(new Data(form).getAll('entry')).toEqual(['before', 'custom', 'after']);
			control.internals.setFormValue(null);
			expect(new Data(form).getAll('entry')).toEqual(['before', 'after']);
			control.internals.setFormValue('');
			expect(new Data(form).getAll('entry')).toEqual(['before', '', 'after']);
		},
	);
	context.test(
		'copies FormData entries at setFormValue time and preserves their own names',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const Data = fixture.globals('FormData') as unknown as typeof FormData;
			const control = defineControl(fixture),
				form = document.createElement('form'),
				entries = new Data();
			control.setAttribute('name', 'ignored');
			form.append(control);
			entries.append('first', 'one');
			entries.append('first', 'two');
			entries.append('second', 'three');
			control.internals.setFormValue(entries);
			entries.set('first', 'changed');
			expect([...new Data(form)]).toEqual([
				['first', 'one'],
				['first', 'two'],
				['second', 'three'],
			]);
			control.internals.setFormValue(new Data());
			expect([...new Data(form)]).toEqual([]);
		},
	);
	context.test(
		'keeps validity live and reports invalid events through the owning form',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const control = defineControl(fixture),
				form = document.createElement('form');
			form.append(control);
			const internals = control.internals,
				validity = internals.validity;
			expect(validity.valid).toBe(true);
			expect(internals.willValidate).toBe(true);
			expect(internals.validationMessage).toBe('');
			const seen: unknown[] = [];
			form.addEventListener(
				'invalid',
				(event) => {
					seen.push([event.target, event.bubbles, event.cancelable]);
					event.preventDefault();
				},
				true,
			);
			internals.setValidity({ valueMissing: true }, 'Required');
			expect(internals.validity).toBe(validity);
			expect(validity.valueMissing).toBe(true);
			expect(validity.valid).toBe(false);
			expect(form.checkValidity()).toBe(false);
			expect(seen).toEqual([[control, false, true]]);
			internals.setValidity({ customError: true }, 'Custom');
			expect(validity.valueMissing).toBe(false);
			expect(validity.customError).toBe(true);
			expect(internals.validationMessage).toBe('Custom');
			internals.setValidity({});
			expect(validity.valid).toBe(true);
			expect(form.checkValidity()).toBe(true);
			expect(internals.validationMessage).toBe('');
			expect(() => internals.setValidity({ valueMissing: true })).toThrow(
				expect.objectContaining({ name: 'TypeError' }),
			);
			expect(validity.valid).toBe(true);
			expect(internals.validationMessage).toBe('');
			expect(seen.length).toBe(1);
		},
	);
	context.test(
		'disabled inheritance updates callbacks, validation and submitted entries',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const Data = fixture.globals('FormData') as unknown as typeof FormData;
			const control = defineControl(fixture),
				form = document.createElement('form'),
				fieldset = document.createElement('fieldset');
			control.setAttribute('name', 'custom');
			control.internals.setFormValue('value');
			fieldset.append(control);
			form.append(fieldset);
			fieldset.disabled = true;
			expect(control.internals.willValidate).toBe(false);
			expect(new Data(form).get('custom')).toBeNull();
			control.setAttribute('disabled', '');
			control.removeAttribute('disabled');
			expect(control.disabledChanges).toEqual([true]);
			fieldset.disabled = false;
			expect(control.internals.willValidate).toBe(true);
			expect(new Data(form).get('custom')).toBe('value');
			expect(control.disabledChanges).toEqual([true, false]);
		},
		['elements.fieldset.disabled'],
	);
	context.test(
		'runs reset reactions after built-in control reset and respects cancellation',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const control = defineControl(fixture),
				form = document.createElement('form'),
				input = document.createElement('input');
			input.defaultValue = 'default';
			input.value = 'dirty';
			control.observeReset = input;
			form.append(control, input);
			form.reset();
			expect(control.resets).toEqual(['default']);
			input.value = 'dirty again';
			form.addEventListener('reset', (event) => event.preventDefault());
			form.reset();
			expect(control.resets).toEqual(['default']);
			expect(input.value).toBe('dirty again');
		},
	);
	context.test(
		'associates explicit and wrapping labels in tree order',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const control = defineControl(fixture),
				parent = document.createElement('div'),
				explicit = document.createElement('label'),
				wrapper = document.createElement('label');
			control.id = uniqueName();
			explicit.htmlFor = control.id;
			wrapper.append(control);
			parent.append(explicit, wrapper);
			fixture.connect(parent as unknown as DOMElementContract);
			expect(explicit.control).toBe(control);
			expect(wrapper.control).toBe(control);
			expect(Array.from(control.internals.labels)).toEqual([explicit, wrapper]);
			explicit.htmlFor = 'missing';
			expect(Array.from(control.internals.labels)).toEqual([wrapper]);
		},
		['elements.label.association'],
	);
	context.test(
		'rejects form APIs on internals of non-form-associated custom elements',
		(fixture) => {
			const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement;
			const registry = fixture.globals('customElements') as unknown as CustomElementRegistry;
			class Plain extends Base {}
			registry.define(uniqueName(), Plain);
			const internals = new Plain().attachInternals();
			for (const operation of [
				() => internals.form,
				() => internals.labels,
				() => internals.willValidate,
				() => internals.validity,
				() => internals.validationMessage,
				() => internals.setFormValue('value'),
				() => internals.setValidity({}),
				() => internals.checkValidity(),
			]) {
				expect(operation).toThrow(expect.objectContaining({ name: 'NotSupportedError' }));
			}
		},
	);
}
