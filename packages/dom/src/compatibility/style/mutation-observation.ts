import type { CompatibilityContext } from '../context.ts';

export const spec = 'https://drafts.csswg.org/cssom/#update-style-attribute';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/css/cssom/MutationObserver-style.html';
export const globals = ['MutationObserver'] as const;
export const requires = [
	'style.attributeSynchronization',
	'mutationObserver.records.attributes',
	'mutationObserver.microtaskDelivery',
	'mutationObserver.oldValue',
	'mutationObserver.filtering',
	'mutationObserver.takeRecords',
	'mutationObserver.disconnect',
] as const;

// Adapted and extended from WPT at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause;
// see ../../../test/wpt/LICENSE.txt and ../../../docs/wpt-css-forms.md.

/** Registers interactions between CSS declaration mutations and DOM observers. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const cssText of [false, true]) {
		context.test(
			`${cssText ? 'repeated cssText assignments deliver' : 'repeated same-value property assignments suppress'} additional observations`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const Observer = fixture.globals('MutationObserver') as unknown as typeof MutationObserver;
				const target = document.createElement('div');
				const records: MutationRecord[] = [];
				const observer = new Observer((batch) => records.push(...batch));
				fixture.cleanup(() => observer.disconnect());
				observer.observe(target, { attributes: true, attributeOldValue: true });
				for (let i = 0; i < 2; i++) {
					if (cssText) target.style.cssText = 'color: red';
					else target.style.color = 'red';
					expect(records.length).toBe(i === 0 ? 0 : 1);
					await Promise.resolve();
					expect(records.length).toBe(cssText ? i + 1 : 1);
				}
				expect(records.map((record) => record.attributeName)).toEqual(
					cssText ? ['style', 'style'] : ['style'],
				);
				expect(records.map((record) => record.oldValue)).toEqual(
					cssText ? [null, 'color: red;'] : [null],
				);
			},
		);
	}
	context.test(
		'batches declaration changes with ordered old serialized values',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const Observer = fixture.globals('MutationObserver') as unknown as typeof MutationObserver;
			const target = document.createElement('div');
			const batches: MutationRecord[][] = [];
			const observer = new Observer((records) => batches.push(records));
			fixture.cleanup(() => observer.disconnect());
			observer.observe(target, {
				attributes: true,
				attributeOldValue: true,
				attributeFilter: ['style'],
			});
			target.style.setProperty('color', 'red');
			target.style.setProperty('color', 'blue', 'important');
			target.style.removeProperty('color');
			expect(batches.length).toBe(0);
			await Promise.resolve();
			expect(batches.length).toBe(1);
			expect(batches[0]!.map((record) => record.oldValue)).toEqual([
				null,
				'color: red;',
				'color: blue !important;',
			]);
			for (const record of batches[0]!) {
				expect(record.target).toBe(target);
				expect(record.type).toBe('attributes');
				expect(record.attributeName).toBe('style');
				expect(record.attributeNamespace).toBeNull();
			}
		},
	);
	context.test(
		'invalid declarations and removal of missing properties create no records',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const Observer = fixture.globals('MutationObserver') as unknown as typeof MutationObserver;
			const target = document.createElement('div');
			target.style.color = 'red';
			const observer = new Observer(() => {});
			fixture.cleanup(() => observer.disconnect());
			observer.observe(target, { attributes: true });
			target.style.color = 'not-a-color';
			target.style.setProperty('color', 'blue', 'invalid-priority');
			target.style.removeProperty('visibility');
			expect(observer.takeRecords()).toEqual([]);
			expect(target.style.color).toBe('red');
		},
	);
}
