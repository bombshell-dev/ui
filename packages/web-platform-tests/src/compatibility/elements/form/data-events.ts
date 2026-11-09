import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-entry-list';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/html/semantics/forms/form-submission-0/constructing-form-data-set.html';
export const globals = ['FormData'] as const;
export const requires = [
	'elements.form.formData',
	'events.dispatch.capture',
	'events.dispatch.bubbling',
	'events.dispatch.cancellation',
] as const;

// Adapted and extended from WPT at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause;
// see ../../../../test/wpt/LICENSE and ../../../../docs/wpt-css-forms.md.

/** Registers form entry-list construction and formdata event interactions. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const connected of [true, false]) {
		context.test(
			`formdata bubbles synchronously through ${connected ? 'connected' : 'detached'} ancestors without cancellation`,
			(fixture) => {
				const document = fixture.document as unknown as Document;
				const Data = fixture.globals('FormData') as unknown as typeof FormData;
				const parent = document.createElement('div'),
					form = document.createElement('form');
				parent.append(form);
				if (connected) fixture.connect(parent as unknown as DOMElementContract);
				const seen: unknown[] = [];
				parent.addEventListener(
					'formdata',
					(event) => {
						event.preventDefault();
						seen.push([
							'capture',
							event.target,
							event.eventPhase,
							event.bubbles,
							event.cancelable,
							event.defaultPrevented,
						]);
					},
					true,
				);
				form.addEventListener('formdata', (event) => seen.push(['target', event.eventPhase]));
				parent.addEventListener('formdata', (event) => seen.push(['bubble', event.eventPhase]));
				const data = new Data(form);
				seen.push('returned');
				expect([...data]).toEqual([]);
				expect(seen).toEqual([
					['capture', form, 1, true, false, false],
					['target', 2],
					['bubble', 3],
					'returned',
				]);
			},
		);
	}
	context.test('shares listener mutations in order with the constructed data', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Data = fixture.globals('FormData') as unknown as typeof FormData;
		const form = document.createElement('form'),
			input = document.createElement('input');
		input.name = 'first';
		input.value = 'original';
		form.append(input);
		const seen: unknown[] = [];
		let eventData: FormData | undefined;
		form.addEventListener('formdata', (event) => {
			eventData = event.formData;
			seen.push([...event.formData]);
			event.formData.append('extra', 'one');
			event.formData.append('extra', 'two');
		});
		form.addEventListener('formdata', (event) => {
			seen.push([...event.formData]);
			event.formData.set('first', 'updated');
		});
		const data = new Data(form);
		expect(seen).toEqual([
			[['first', 'original']],
			[
				['first', 'original'],
				['extra', 'one'],
				['extra', 'two'],
			],
		]);
		expect([...data]).toEqual([
			['first', 'updated'],
			['extra', 'one'],
			['extra', 'two'],
		]);
		expect([...eventData!]).toEqual([...data]);
		expect(input.value).toBe('original');
	});
	context.test('preserves newlines in event-added entry names and values', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Data = fixture.globals('FormData') as unknown as typeof FormData;
		const form = document.createElement('form');
		form.addEventListener('formdata', (event) => event.formData.append('a\nb', 'c\rd\r\ne'));
		expect([...new Data(form)]).toEqual([['a\nb', 'c\rd\r\ne']]);
	});
	context.test('constructs entries before event listeners mutate the controls', (fixture) => {
		const document = fixture.document as unknown as Document;
		const Data = fixture.globals('FormData') as unknown as typeof FormData;
		const form = document.createElement('form'),
			input = document.createElement('input');
		input.name = 'value';
		input.value = 'before';
		form.append(input);
		form.addEventListener('formdata', () => {
			input.value = 'after';
		});
		expect(new Data(form).get('value')).toBe('before');
		expect(new Data(form).get('value')).toBe('after');
	});
}
