import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Must not throw INVALID_STATE_ERR for a detached node.',
		({ document }) => {
			var range = document.createRange();
			range.detach();
			range.createContextualFragment('');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>createContextualFragment() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	context.test(
		'Must throw TypeError when calling without arguments',
		({ document, TypeError }) => {
			var range = document.createRange();
			expect(function () {
				(range.createContextualFragment as () => DocumentFragment)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>createContextualFragment() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	context.test(
		'Simple test with paragraphs',
		({ document }) => {
			// Simple test
			var range = document.createRange();
			range.selectNodeContents(document.body);

			var fragment = '<p CLaSs=testclass> Hi! <p>Hi!';
			var expected = document.createDocumentFragment();
			var tmpNode = document.createElement('p');
			tmpNode.setAttribute('class', 'testclass');
			tmpNode.appendChild(document.createTextNode(' Hi! '));
			expected.appendChild(tmpNode);

			tmpNode = document.createElement('p');
			tmpNode.appendChild(document.createTextNode('Hi!'));
			expected.appendChild(tmpNode);

			var result = range.createContextualFragment(fragment);
			expect(expected.isEqualNode(result), 'Unexpected result (collapsed Range)').toBe(true);

			// Token test that the end node makes no difference
			range.setEnd(document.body.getElementsByTagName('script')[0]!, 0);
			result = range.createContextualFragment(fragment);
			expect(expected.isEqualNode(result), 'Unexpected result (Range ends in <script>)').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>createContextualFragment() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	context.test(
		"Don't auto-create <body> when applied to <html>",
		({ document }) => {
			// This test based on https://bugzilla.mozilla.org/show_bug.cgi?id=585819,
			// from a real-world compat bug
			var range = document.createRange();
			range.selectNodeContents(document.documentElement);
			var fragment = '<span>Hello world</span>';
			var expected = document.createDocumentFragment();
			var tmpNode = document.createElement('span');
			tmpNode.appendChild(document.createTextNode('Hello world'));
			expected.appendChild(tmpNode);

			var result = range.createContextualFragment(fragment);
			expect(expected.isEqualNode(result), 'Unexpected result (collapsed Range)').toBe(true);

			// Another token test that the end node makes no difference
			range.setEnd(document.head, 0);
			result = range.createContextualFragment(fragment);
			expect(expected.isEqualNode(result), 'Unexpected result (Range ends in <head>)').toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>createContextualFragment() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	for (const name of [
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
		'menuitem',
		'image',
	]) {
		context.test(
			`createContextualFragment should work even when the context is <${name}>`,
			({ document }) => {
				const range = document.createRange();
				const contextNode = document.createElement(name);
				const selectedNode = document.createElement('div');
				contextNode.appendChild(selectedNode);
				range.selectNode(selectedNode);

				range.createContextualFragment('some text');
			},
		);
	}
	function testEquivalence(element1: Node, fragment1: unknown, element2: Node, fragment2: unknown) {
		var range1 = element1.ownerDocument!.createRange();
		range1.selectNodeContents(element1);
		var range2 = element2.ownerDocument!.createRange();
		range2.selectNodeContents(element2);

		var result1 = range1.createContextualFragment(fragment1 as string);
		var result2 = range2.createContextualFragment(fragment2 as string);

		expect(result1.isEqualNode(result2), 'Results are supposed to be equivalent').toBe(true);

		// Throw in partial ownerDocument tests on the side, since the algorithm
		// does specify that and we don't want to completely not test it.
		if (result1.firstChild != null) {
			expect(
				result1.firstChild.ownerDocument,
				'ownerDocument must be set to that of the reference node',
			).toBe(element1.ownerDocument);
		}
		if (result2.firstChild != null) {
			expect(
				result2.firstChild.ownerDocument,
				'ownerDocument must be set to that of the reference node',
			).toBe(element2.ownerDocument);
		}
	}

	for (const [index, title] of [
		'<html> and <body> must work the same, 1',
		'<html> and <body> must work the same, 2',
		'Implicit <body> creation',
		"Namespace generally shouldn't matter",
		"<html> in a different namespace shouldn't be special",
		"SVG namespace shouldn't be special",
		'null should be stringified',
		'undefined should be stringified',
		"Text nodes shouldn't be special",
		'Non-Element parent should not be special',
	].entries()) {
		context.test(title, ({ document }) => {
			var doc_fragment = document.createDocumentFragment();
			var comment = document.createComment('~o~');
			doc_fragment.appendChild(comment);
			var tests: [string, Node, unknown, Node, unknown][] = [
				[
					'<html> and <body> must work the same, 1',
					document.documentElement,
					'<span>Hello world</span>',
					document.body,
					'<span>Hello world</span>',
				],
				[
					'<html> and <body> must work the same, 2',
					document.documentElement,
					'<body><p>Hello world',
					document.body,
					'<body><p>Hello world',
				],
				[
					'Implicit <body> creation',
					document.documentElement,
					'<body><p>',
					document.documentElement,
					'<p>',
				],
				[
					"Namespace generally shouldn't matter",
					document.createElementNS('http://fake-namespace', 'div'),
					'<body><p><span>Foo',
					document.createElement('div'),
					'<body><p><span>Foo',
				],
				[
					"<html> in a different namespace shouldn't be special",
					document.createElementNS('http://fake-namespace', 'html'),
					'<body><p>',
					document.createElement('div'),
					'<body><p>',
				],
				[
					"SVG namespace shouldn't be special",
					document.createElementNS('http://www.w3.org/2000/svg', 'div'),
					'<body><p>',
					document.createElement('div'),
					'<body><p>',
				],
				[
					'null should be stringified',
					document.createElement('span'),
					null,
					document.createElement('span'),
					'null',
				],
				[
					'undefined should be stringified',
					document.createElement('span'),
					undefined,
					document.createElement('span'),
					'undefined',
				],
				[
					"Text nodes shouldn't be special",
					document.createTextNode('?'),
					'<body><p>',
					document.createElement('div'),
					'<body><p>',
				],
				[
					'Non-Element parent should not be special',
					comment,
					'<body><p>',
					document.createElement('div'),
					'<body><p>',
				],
			];

			const [, element1, fragment1, element2, fragment2] = tests[index]!;
			testEquivalence(element1, fragment1, element2, fragment2);
		});
	}
}
