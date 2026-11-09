import type { CompatibilityContext } from '../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	var expected = [
		['', '<span></span>'],
		['<a></a>', '<span><a></a></span>'],
		['<a b="c"></a>', '<span><a b="c"></a></span>'],
		['<a b="c"></a>', '<span><a b="c"></a></span>'],
		['<a b="&amp;"></a>', '<span><a b="&amp;"></a></span>'],
		['<a b="&nbsp;"></a>', '<span><a b="&nbsp;"></a></span>'],
		['<a b="&quot;"></a>', '<span><a b="&quot;"></a></span>'],
		['<a b="&lt;"></a>', '<span><a b="&lt;"></a></span>'],
		['<a b="&gt;"></a>', '<span><a b="&gt;"></a></span>'],
		[
			'<a href="javascript:&quot;&lt;&gt;&quot;"></a>',
			'<span><a href="javascript:&quot;&lt;&gt;&quot;"></a></span>',
		],
		['<svg xlink:href="a"></svg>', '<span><svg xlink:href="a"></svg></span>'],
		['<svg xmlns:svg="test"></svg>', '<span><svg xmlns:svg="test"></svg></span>'],
		['a', '<span>a</span>'],
		['&amp;', '<span>&amp;</span>'],
		['&nbsp;', '<span>&nbsp;</span>'],
		['&lt;', '<span>&lt;</span>'],
		['&gt;', '<span>&gt;</span>'],
		['"', '<span>"</span>'],
		['<style><&></style>', '<span><style><&></style></span>'],
		['<script type="test"><&><\/script>', '<span><script type="test"><&><\/script></span>'],
		['<&>', '<script type="test"><&><\/script>'],
		['<xmp><&></xmp>', '<span><xmp><&></xmp></span>'],
		['<iframe><&></iframe>', '<span><iframe><&></iframe></span>'],
		['<noembed><&></noembed>', '<span><noembed><&></noembed></span>'],
		['<noframes><&></noframes>', '<span><noframes><&></noframes></span>'],
		['<noscript><&></noscript>', '<span><noscript><&></noscript></span>'],
		['<!--data-->', '<span><!--data--></span>'],
		[
			'<a><b><c></c></b><d>e</d><f><g>h</g></f></a>',
			'<span><a><b><c></c></b><d>e</d><f><g>h</g></f></a></span>',
		],
		['', '<span b="c"></span>'],
	];

	var dom_tests: [string, (document: Document) => HTMLElement, string, string][] = [
		[
			'Attribute in the XML namespace',
			function (document) {
				var span = document.createElement('span');
				var svg = document.createElement('svg');
				svg.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:foo', 'test');
				span.appendChild(svg);
				return span;
			},
			'<svg xml:foo="test"></svg>',
			'<span><svg xml:foo="test"></svg></span>',
		],

		[
			'Attribute in the XML namespace with the prefix not set to xml:',
			function (document) {
				var span = document.createElement('span');
				var svg = document.createElement('svg');
				svg.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'abc:foo', 'test');
				span.appendChild(svg);
				return span;
			},
			'<svg xml:foo="test"></svg>',
			'<span><svg xml:foo="test"></svg></span>',
		],

		[
			"Non-'xmlns' attribute in the xmlns namespace",
			function (document) {
				var span = document.createElement('span');
				var svg = document.createElement('svg');
				svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:foo', 'test');
				span.appendChild(svg);
				return span;
			},
			'<svg xmlns:foo="test"></svg>',
			'<span><svg xmlns:foo="test"></svg></span>',
		],

		[
			"'xmlns' attribute in the xmlns namespace",
			function (document) {
				var span = document.createElement('span');
				var svg = document.createElement('svg');
				svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'test');
				span.appendChild(svg);
				return span;
			},
			'<svg xmlns="test"></svg>',
			'<span><svg xmlns="test"></svg></span>',
		],

		[
			'Attribute in non-standard namespace',
			function (document) {
				var span = document.createElement('span');
				var svg = document.createElement('svg');
				svg.setAttributeNS('fake_ns', 'abc:def', 'test');
				span.appendChild(svg);
				return span;
			},
			'<svg abc:def="test"></svg>',
			'<span><svg abc:def="test"></svg></span>',
		],

		[
			'<span> starting with U+000A',
			function (document) {
				var elem = document.createElement('span');
				elem.appendChild(document.createTextNode('\x0A'));
				return elem;
			},
			'\x0A',
			'<span>\x0A</span>',
		],

		//TODO: Processing instructions
	];

	var text_elements = ['pre', 'textarea', 'listing'];

	var text_tests: [
		string,
		(document: Document, elem: HTMLElement) => HTMLElement,
		string,
		string,
	][] = [
		[
			'<%text> context starting with U+000A',
			function (document, elem) {
				elem.appendChild(document.createTextNode('\x0A'));
				return elem;
			},
			'\x0A',
			'<%text>\x0A</%text>',
		],

		[
			'<%text> context not starting with U+000A',
			function (document, elem) {
				elem.appendChild(document.createTextNode('a\x0A'));
				return elem;
			},
			'a\x0A',
			'<%text>a\x0A</%text>',
		],

		[
			'<%text> non-context starting with U+000A',
			function (document, elem) {
				var span = document.createElement('span');
				elem.appendChild(document.createTextNode('\x0A'));
				span.appendChild(elem);
				return span;
			},
			'<%text>\x0A</%text>',
			'<span><%text>\x0A</%text></span>',
		],

		[
			'<%text> non-context not starting with U+000A',
			function (document, elem) {
				var span = document.createElement('span');
				elem.appendChild(document.createTextNode('a\x0A'));
				span.appendChild(elem);
				return span;
			},
			'<%text>a\x0A</%text>',
			'<span><%text>a\x0A</%text></span>',
		],
	];

	var void_elements = [
		'area',
		'base',
		'basefont',
		'bgsound',
		'br',
		'col',
		'embed',
		'frame',
		'hr',
		'img',
		'input',
		'keygen',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr',
	];

	var void_tests: [
		string,
		(document: Document, void_elem: HTMLElement) => HTMLElement,
		string,
		string,
	][] = [
		[
			'Void context node',
			function (document, void_elem) {
				return void_elem;
			},
			'',
			'<%void>',
		],
		[
			'void as first child with following siblings',
			function (document, void_elem) {
				var span = document.createElement('span');
				span.appendChild(void_elem);
				span.appendChild(document.createElement('a')).appendChild(document.createTextNode('test'));
				span.appendChild(document.createElement('b'));
				return span;
			},
			'<%void><a>test</a><b></b>',
			'<span><%void><a>test</a><b></b></span>',
		],
		[
			'void as second child with following siblings',
			function (document, void_elem) {
				var span = document.createElement('span');
				span.appendChild(document.createElement('a')).appendChild(document.createTextNode('test'));
				span.appendChild(void_elem);
				span.appendChild(document.createElement('b'));
				return span;
			},
			'<a>test</a><%void><b></b>',
			'<span><a>test</a><%void><b></b></span>',
		],
		[
			'void as last child with preceding siblings',
			function (document, void_elem) {
				var span = document.createElement('span');
				span.appendChild(document.createElement('a')).appendChild(document.createTextNode('test'));
				span.appendChild(document.createElement('b'));
				span.appendChild(void_elem);
				return span;
			},
			'<a>test</a><b></b><%void>',
			'<span><a>test</a><b></b><%void></span>',
		],
	];

	function make_void(document: Document, name: string) {
		var rv = document.createElement(name);
		rv.appendChild(document.createElement('a')).appendChild(document.createComment('abc'));
		rv.appendChild(document.createElement('b'))
			.appendChild(document.createElement('c'))
			.appendChild(document.createTextNode('abc'));
		return rv;
	}

	for (const property of ['innerHTML', 'outerHTML'] as const) {
		const column = property === 'innerHTML' ? 0 : 1;
		for (const [i, values] of expected.entries()) {
			context.test(
				property + ' ' + i + ' ' + values[column],
				({ document }) => {
					var test_data = document.getElementById('test')!.children;
					expect(test_data[i]![property]).toBe(values[column]);
				},
				{
					document: {
						contentType: 'text/html',
						content: `<!DOCTYPE html>
<title>innerHTML in HTML</title>


<div id="log"></div>

<!-- test elments. Each has an expected innerHTML and outerHTML in an array in the <script>-->
<div id="test" style="display:none">
<span></span>
<span><a></a></span>
<span><a b=c></a></span>
<span><a b='c'></a></span>
<span><a b='&'></a></span>
<span><a b='&nbsp;'></a></span>
<span><a b='"'></a></span>
<span><a b="<"></a></span>
<span><a b=">"></a></span>
<span><a href="javascript:&quot;&lt;>&quot;"></a></span>
<span><svg xlink:href="a"></svg></span>
<span><svg xmlns:svg="test"></svg></span>
<span>a</span>
<span>&amp;</span>
<span>&nbsp;</span>
<span>&lt;</span>
<span>&gt;</span>
<span>&quot;</span>
<span><style><&></style></span>
<span><script type="test"><&></script></span>
<script type="test"><&></script>
<span><xmp><&></xmp></span>
<span><iframe><&></iframe></span>
<span><noembed><&></noembed></span>
<span><noframes><&></noframes></span>
<span><noscript><&></noscript></span>
<span><!--data--></span>
<span><a><b><c></c></b><d>e</d><f><g>h</g></f></a></span>
<span b=c></span>
</div>
<!-- TODO: template element -->
`,
					},
				},
			);
		}
		for (const item of dom_tests) {
			context.test(property + ' ' + item[0], ({ document }) => {
				expect(item[1](document)[property]).toBe(item[column + 2]);
			});
		}
		for (const item of text_tests)
			for (const elem_name of text_elements) {
				context.test(property + ' ' + item[0].replace(/%text/g, elem_name), ({ document }) => {
					expect(item[1](document, document.createElement(elem_name))[property]).toBe(
						(item[column + 2] as string).replace(/%text/g, elem_name),
					);
				});
			}
		for (const item of void_tests)
			for (const elem_name of void_elements) {
				context.test(property + ' ' + item[0] + ' ' + elem_name, ({ document }) => {
					expect(item[1](document, make_void(document, elem_name))[property]).toBe(
						(item[column + 2] as string).replace(/%void/g, elem_name),
					);
				});
			}
	}
}
