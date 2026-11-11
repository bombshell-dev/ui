import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function xml(
		{ DOMParser }: DOMFixture,
		options: { markup: string; type?: DOMParserSupportedType },
	): Document {
		return new DOMParser().parseFromString(options.markup, options.type ?? 'application/xml');
	}

	const { expect } = context.runner;

	context.test(
		'WPT ParentNode-querySelector-xml-capitalization.window.js: Descendant combinator',
		(fixture) => {
			const document = xml(fixture, { markup: '<Foo><bar>baz</bar></Foo>' });
			expect(document.querySelector('Foo')).toBe(document.documentElement);
			expect(document.querySelector('bar')).toBe(document.documentElement.firstChild);
			expect(document.querySelector('Foo bar')).toBe(document.documentElement.firstChild);
		},
	);
	context.test(
		'WPT ParentNode-querySelector-xml-capitalization.window.js: Descendant combinator with *',
		(fixture) => {
			const document = xml(fixture, {
				markup: `
<root>
  <aB>
    <c></c>
  </aB>
  <cd>
    <e></e>
  </cd>
</root>
`,
			});
			const c = document.documentElement.children[0]!.firstElementChild,
				e = document.documentElement.children[1]!.firstElementChild;
			expect(document.querySelector('c')).not.toBeNull();
			expect(document.querySelector('aB *')).toBe(c);
			expect(document.querySelector('e')).not.toBeNull();
			expect(document.querySelector('cd *')).toBe(e);
		},
	);
	context.test(
		'WPT ParentNode-querySelector-xml-capitalization.window.js: Child combinator',
		(fixture) => {
			const document = xml(fixture, {
				markup: `<elem>
    <Test>
        content
        <my-tag>abc</my-tag>
    </Test>
</elem>`,
				type: 'text/xml',
			});
			expect(document.querySelector('Test')).not.toBeNull();
			expect(document.querySelector('test')).toBeNull();
			expect(document.querySelector('my-tag')).not.toBeNull();
			expect(document.querySelector('Test>my-tag')).not.toBeNull();
		},
	);
}
