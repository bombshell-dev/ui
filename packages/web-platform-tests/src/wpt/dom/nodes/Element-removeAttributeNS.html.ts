// Helper: attributes.js.
import type { CompatibilityContext } from '../../../shared/context.ts';
import { createAttributeAssertions } from './attributes.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const { attr_is } = createAttributeAssertions(expect);
	const XML = 'http://www.w3.org/XML/1998/namespace';

	context.test('removeAttributeNS should take a local name.', ({ document }) => {
		const el = document.createElement('foo');
		el.setAttributeNS(XML, 'a:bb', 'pass');
		attr_is(el.attributes[0]!, 'pass', 'bb', XML, 'a', 'a:bb');
		el.removeAttributeNS(XML, 'a:bb');
		expect(el.attributes.length).toBe(1);
		attr_is(el.attributes[0]!, 'pass', 'bb', XML, 'a', 'a:bb');
	});
}
