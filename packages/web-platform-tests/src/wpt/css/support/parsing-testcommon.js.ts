import type { CompatibilityExpect } from '../../../shared/context.ts';

interface ParsingContext {
	document: Document;
	expect: CompatibilityExpect;
}

// The source entrypoints register the cases; these are the callback bodies of
// the upstream value-parsing helpers with string expected serializations.
// oxlint-disable-next-line bombshell-dev/max-params -- Keep upstream property, input, and expected serialization arguments.
export function test_valid_value(
	{ document, expect }: ParsingContext,
	property: string,
	value: string,
	serializedValue = value,
): void {
	const div = document.getElementById('target') || document.createElement('div');
	const style = div.style as CSSStyleDeclaration & Record<string, string>;
	style[property] = '';
	style[property] = value;
	const readValue = style.getPropertyValue(property);
	expect(readValue, 'property should be set').not.toBe('');
	expect(readValue, 'serialization should be canonical').toBe(serializedValue);

	style[property] = readValue;
	expect(style.getPropertyValue(property), 'serialization should round-trip').toBe(readValue);
}

export function test_invalid_value(
	{ document, expect }: ParsingContext,
	property: string,
	value: string,
): void {
	const div = document.getElementById('target') || document.createElement('div');
	const style = div.style as CSSStyleDeclaration & Record<string, string>;
	style[property] = '';
	style[property] = value;
	expect(style.getPropertyValue(property)).toBe('');
}
