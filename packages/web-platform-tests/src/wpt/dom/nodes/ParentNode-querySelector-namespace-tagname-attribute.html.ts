import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function xml(
		{ DOMParser }: DOMFixture,
		options: { markup: string; type?: DOMParserSupportedType },
	): Document {
		return new DOMParser().parseFromString(options.markup, options.type ?? 'application/xml');
	}
	const propertiesMarkup = `<?xml version="1.0"?>
<cp:coreProperties
  xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xml:lang="en"
  id="target">
  <dc:title></dc:title>
</cp:coreProperties>`;

	const { expect } = context.runner;

	for (const { selector, title, expected } of [
		{ selector: 'coreProperties', title: 'match selector without prefix', expected: 'target' },
		{
			selector: '*|coreProperties',
			title: 'match namespace selector with universal prefix',
			expected: 'target',
		},
		{
			selector: 'cp|coreProperties',
			title: 'throws on specified namespace selector',
			expected: 'throw',
		},
		{
			selector: ':is(cp|coreProperties)',
			title: 'does not throw on specified namespace selector if forgiven',
			expected: 'null',
		},
		{
			selector: '[lang]',
			title: 'does not match attriubte selector without prefix',
			expected: 'null',
		},
		{
			selector: '[*|lang]',
			title: 'match namespace attriubte selector with universal prefix',
			expected: 'target',
		},
		{
			selector: '[xml|lang]',
			title: 'throws on specified namespace attriubte selector',
			expected: 'throw',
		},
		{
			selector: ':is([xml|lang])',
			title: 'does not throw on specified namespace attriubte selector if forgiven',
			expected: 'null',
		},
	]) {
		context.test(
			`WPT ParentNode-querySelector-namespace-tagname-attribute.html: ${title}`,
			(fixture) => {
				const document = xml(fixture, { markup: propertiesMarkup });
				if (expected === 'throw')
					expect(() => document.querySelector(selector)).toThrow(
						expect.objectContaining({ name: 'SyntaxError' }),
					);
				else
					expect(document.querySelector(selector)).toBe(
						expected === 'null' ? null : document.getElementById('target'),
					);
			},
		);
	}
}
