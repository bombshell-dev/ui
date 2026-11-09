import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function createTestElement(document: Document, style: string) {
		let wrapper = document.createElement('div');
		wrapper.innerHTML = `<div id="test" style="${style}"></div>`;
		return wrapper.querySelector<HTMLElement>('#test')!;
	}
	context.test(
		'Style attribute should create CSS declaration block based on its content',
		({ document }) => {
			let elem = createTestElement(document, 'z-index: 10;');
			expect(elem.style.cssText).toBe('z-index: 10;');
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n<meta charset="UTF-8">\n\n\n\n\n<body>\n\n',
			},
		},
	);
	context.test(
		'Changes to style attribute should reflect on CSS declaration block',
		({ document }) => {
			let elem = createTestElement(document, 'z-index: 20;');
			let style = elem.style;
			expect(style.cssText).toBe('z-index: 20;');
			function assert_css_text(value: string, action: string) {
				expect(style.cssText, 'CSS declaration block after ' + action).toBe(value);
			}
			elem.setAttribute('style', 'z-index: 21;');
			assert_css_text('z-index: 21;', 'changing the style attribute');
			elem.removeAttribute('style');
			assert_css_text('', 'removing the style attribute');
			elem.setAttribute('style', 'position: absolute;');
			assert_css_text('position: absolute;', 'adding style attribute again');
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n<meta charset="UTF-8">\n\n\n\n\n<body>\n\n',
			},
		},
	);
	context.test(
		'Changes to CSS declaration block should reflect on style attribute',
		({ document }) => {
			let elem = createTestElement(document, 'z-index: 30;');
			let style = elem.style;
			expect(style.cssText).toBe('z-index: 30;');
			function assert_attr(value: string, action: string) {
				expect(elem.getAttribute('style'), 'style attribute after ' + action).toBe(value);
			}
			style.setProperty('z-index', '31');
			assert_attr('z-index: 31;', 'changing property in CSS declaration block');
			style.removeProperty('z-index');
			assert_attr('', 'removing property from CSS declaration block');
			style.setProperty('position', 'absolute');
			assert_attr('position: absolute;', 'adding property to CSS declaration block');
			style.cssText = 'z-index: 32;';
			assert_attr('z-index: 32;', 'changing cssText');
			style.cssText = 'z-index: 33; invalid';
			assert_attr('z-index: 33;', 'changing cssText to a partial invalid value');
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n<meta charset="UTF-8">\n\n\n\n\n<body>\n\n',
			},
		},
	);
	context.test(
		'Changes to CSS declaration block should queue mutation record for style attribute',
		({ document, MutationObserver }) => {
			let elem = createTestElement(document, 'z-index: 40;');
			let style = elem.style;
			expect(style.cssText).toBe('z-index: 40;');
			// Create an observer for the element.
			let observer = new MutationObserver(function () {});
			observer.observe(elem, { attributes: true, attributeOldValue: true });
			function assert_record_with_old_value(oldValue: string, action: string) {
				let records = observer.takeRecords();
				expect(records.length, 'number of mutation records after ' + action).toBe(1);
				let record = records[0]!;
				expect(record.type, 'mutation type after ' + action).toBe('attributes');
				expect(record.attributeName, 'mutated attribute after ' + action).toBe('style');
				expect(record.oldValue, 'old value after ' + action).toBe(oldValue);
			}
			style.setProperty('z-index', '41');
			assert_record_with_old_value('z-index: 40;', 'changing property in CSS declaration block');
			style.cssText = 'z-index: 42;';
			assert_record_with_old_value('z-index: 41;', 'changing cssText');
			style.cssText = 'z-index: 42;';
			assert_record_with_old_value('z-index: 42;', 'changing cssText with the same content');
			style.removeProperty('z-index');
			assert_record_with_old_value('z-index: 42;', 'removing property from CSS declaration block');
			// Mutation to shorthand properties should also trigger only one mutation record.
			style.setProperty('margin', '1px');
			assert_record_with_old_value('', 'adding shorthand property to CSS declaration block');
			style.removeProperty('margin');
			assert_record_with_old_value(
				'margin: 1px;',
				'removing shorthand property from CSS declaration block',
			);
			// Final sanity check.
			expect(elem.getAttribute('style')).toBe('');
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n<meta charset="UTF-8">\n\n\n\n\n<body>\n\n',
			},
		},
	);
	context.test(
		"Removing non-existing property or setting invalid value on CSS declaration block shouldn't queue mutation record",
		({ document, MutationObserver }) => {
			let elem = createTestElement(document, 'z-index: 50; invalid');
			let style = elem.style;
			expect(style.cssText).toBe('z-index: 50;');
			// Create an observer for the element.
			let observer = new MutationObserver(function () {});
			observer.observe(elem, { attributes: true });
			function assert_no_record(action: string) {
				let records = observer.takeRecords();
				expect(records.length, 'expect no record after ' + action).toBe(0);
			}
			style.setProperty('z-index', 'invalid');
			assert_no_record('setting invalid value to property');
			// Longhand property.
			style.removeProperty('position');
			assert_no_record('removing non-existing longhand property');
			style.setProperty('position', '');
			assert_no_record('setting empty string to non-existing longhand property');
			// Shorthand property.
			style.removeProperty('margin');
			assert_no_record('removing non-existing shorthand property');
			style.setProperty('margin', '');
			assert_no_record('setting empty string to non-existing shorthand property');
			// Check that the value really isn't changed.
			expect(
				elem.getAttribute('style'),
				'style attribute after removing non-existing properties',
			).toBe('z-index: 50; invalid');
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n<meta charset="UTF-8">\n\n\n\n\n<body>\n\n',
			},
		},
	);
	context.test(
		'Expansion of all:unset and all:revert treated identically',
		({ document, cleanup }) => {
			let e1 = document.createElement('div');
			let e2 = document.createElement('div');
			document.body.append(e1, e2);
			cleanup(() => {
				e1.remove();
				e2.remove();
			});
			e1.style.cssText = 'all:revert;border-bottom-left-radius:1px;';
			e2.style.cssText = 'all:unset;border-bottom-left-radius:1px;';
			let processed = e1.style.cssText
				.split(';')
				.map((x) => x.replace(/revert$/, 'unset'))
				.join(';');
			expect(processed).toBe(e2.style.cssText);
		},
		{
			document: {
				contentType: 'text/html',
				content: '<!DOCTYPE html>\n<meta charset="UTF-8">\n\n\n\n\n<body>\n\n',
			},
		},
	);
}
