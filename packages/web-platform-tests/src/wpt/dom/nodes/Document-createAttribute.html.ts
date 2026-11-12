// Helpers: attributes.js and productions.js.
import type { CompatibilityContext } from '../../../shared/context.ts';
import { createAttributeAssertions } from './attributes.js.ts';
import { invalid_names, valid_names } from './productions.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const { attr_is } = createAttributeAssertions(expect);
	// Matches testharness.js format_value for this source's string/null/undefined inputs.
	const format_value = (value: string | null | undefined) =>
		typeof value === 'string' ? JSON.stringify(value) : String(value);

	for (const name of invalid_names) {
		context.test(
			`HTML document.createAttribute(${format_value(name)}) should throw`,
			({ document, DOMException }) => {
				expect(() => {
					(document.createAttribute as (name: string, unused: string) => Attr)(name, 'test');
				}).toThrow(
					expect.objectContaining({
						name: 'InvalidCharacterError',
						code: 5,
						constructor: DOMException,
					}),
				);
			},
		);
		context.test(
			`XML document.createAttribute(${format_value(name)}) should throw`,
			({ document, DOMException }) => {
				// Upstream's shared XML document is recreated for each XML case's fixture.
				const xml_document = document.implementation.createDocument(
					null,
					null as unknown as string,
					null,
				);
				expect(() => {
					(xml_document.createAttribute as (name: string, unused: string) => Attr)(name, 'test');
				}).toThrow(
					expect.objectContaining({
						name: 'InvalidCharacterError',
						code: 5,
						constructor: DOMException,
					}),
				);
			},
		);
	}

	for (const name of valid_names) {
		context.test(`HTML document.createAttribute(${format_value(name)})`, ({ document }) => {
			const attr = document.createAttribute(name);
			attr_is(attr, '', name.toLowerCase(), null, null, name.toLowerCase());
		});
		context.test(`XML document.createAttribute(${format_value(name)})`, ({ document }) => {
			const xml_document = document.implementation.createDocument(
				null,
				null as unknown as string,
				null,
			);
			const attr = xml_document.createAttribute(name);
			attr_is(attr, '', name, null, null, name);
		});
	}

	for (const name of ['title', 'TITLE', null, undefined]) {
		context.test(`HTML document.createAttribute(${format_value(name)})`, ({ document }) => {
			const attribute = document.createAttribute(name as string);
			attr_is(attribute, '', String(name).toLowerCase(), null, null, String(name).toLowerCase());
			expect(attribute.ownerElement).toBe(null);
		});
		context.test(`XML document.createAttribute(${format_value(name)})`, ({ document }) => {
			const xml_document = document.implementation.createDocument(
				null,
				null as unknown as string,
				null,
			);
			const attribute = xml_document.createAttribute(name as string);
			attr_is(attribute, '', String(name), null, null, String(name));
			expect(attribute.ownerElement).toBe(null);
		});
	}
}
