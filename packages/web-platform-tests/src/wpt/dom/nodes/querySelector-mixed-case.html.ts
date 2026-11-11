import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function prepare({ document, connect }: DOMFixture, markup: string): Document {
		const root = document.createElement('div');
		root.innerHTML = markup;
		connect(root);
		return document;
	}

	const { expect } = context.runner;
	function arrayEquals(
		actual: ArrayLike<unknown>,
		options: { expected: ArrayLike<unknown>; message?: string },
	): void {
		expect(actual.length, options.message).toBe(options.expected.length);
		for (let i = 0; i < actual.length; i++)
			expect(actual[i], options.message).toBe(options.expected[i]);
	}

	// 4.3.7 from https://drafts.csswg.org/css-syntax/#consume-escaped-code-point

	// - escape hex digit

	// - hex digit special replacement
	// 1. zero points

	// 2. surrogate points

	// 3. out of range points

	// - escape EOF

	// - escape anythong else

	// non edge cases

	// ident tests case from CSS tests of chromium source: https://goo.gl/3Cxdov

	context.test(
		'WPT querySelector-mixed-case.html: Mixed HTML/SVG/MathML tree with various mixed-case attributes',
		(fixture) => {
			const document = prepare(fixture, '<div id="test-container"></div>');
			const container = document.getElementById('test-container')!;
			function buildTestTree(): HTMLDivElement {
				// Build entire DOM tree structure first (without attributes)
				const html1 = document.createElement('div');
				html1.id = 'html1';

				const svg1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg1.id = 'svg1';

				const svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
				svg2.id = 'svg2';

				const svg3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				svg3.id = 'svg3';

				const html2 = document.createElement('div');
				html2.id = 'html2';

				const math1 = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
				math1.id = 'math1';

				const math2 = document.createElementNS('http://www.w3.org/1998/Math/MathML', 'mi');
				math2.id = 'math2';

				const svg4 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg4.id = 'svg4';

				const svg5 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
				svg5.id = 'svg5';

				const html3 = document.createElement('div');
				html3.id = 'html3';

				// Create foreignObject with HTML inside SVG (will go in svg1)
				const foreign1 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
				foreign1.id = 'foreign1';

				const html4 = document.createElement('div');
				html4.id = 'html4';

				const html5 = document.createElement('span');
				html5.id = 'html5';

				// Create nested: HTML > SVG inside html2
				const svg6 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg6.id = 'svg6';

				const foreign2 = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
				foreign2.id = 'foreign2';

				const html6 = document.createElement('div');
				html6.id = 'html6';

				const svg7 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg7.id = 'svg7';

				const svg8 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				svg8.id = 'svg8';

				// Build tree structure
				svg2.appendChild(svg3);
				svg1.appendChild(svg2);

				// Add foreignObject with HTML to svg1
				html4.appendChild(html5);
				foreign1.appendChild(html4);
				svg1.appendChild(foreign1);

				html1.appendChild(svg1);

				math1.appendChild(math2);
				html2.appendChild(math1);

				// Add deeply nested SVG > foreignObject > HTML > SVG to html2
				svg7.appendChild(svg8);
				html6.appendChild(svg7);
				foreign2.appendChild(html6);
				svg6.appendChild(foreign2);
				html2.appendChild(svg6);

				html1.appendChild(html2);

				svg4.appendChild(svg5);

				// Create wrapper container for all trees
				const wrapper = document.createElement('div');
				wrapper.appendChild(html1);
				wrapper.appendChild(svg4);
				wrapper.appendChild(html3);

				// NOW set all attributes
				html1.setAttribute('viewBox', 'html-val');
				html1.setAttribute('dataIndex', '0');
				html1.setAttribute('testAttr', 'alpha');

				svg1.setAttribute('viewBox', 'svg-val');
				svg1.setAttribute('dataIndex', '1');
				svg1.setAttribute('testAttr', 'beta');

				svg2.setAttribute('mixedCase', 'foo');
				svg2.setAttribute('dataValue', 'first');

				svg3.setAttribute('innerAttr', 'found');

				html2.setAttribute('viewBox', 'nested');
				html2.setAttribute('mathVariant', 'bold');

				math1.setAttribute('mathVariant', 'italic');
				math1.setAttribute('displayStyle', 'true');

				math2.setAttribute('testIndex', '5');
				math2.setAttribute('dataValue', 'second');

				svg5.setAttribute('viewBox', 'rect-val');
				svg5.setAttribute('testIndex', '10');

				html3.setAttribute('MixedCase', 'bar');
				html3.setAttribute('TestIndex', '20');

				// Set attributes on foreignObject tree in svg1
				foreign1.setAttribute('foreignAttr', 'foreign-val');

				html4.setAttribute('ForeignHTML', 'inside-foreign');
				html4.setAttribute('DataType', 'html-in-svg');

				html5.setAttribute('NestedCase', 'span-val');

				// Set attributes on deeply nested tree in html2
				svg6.setAttribute('DeepSVG', 'middle-svg');
				svg6.setAttribute('CaseSensitive', 'nested');

				foreign2.setAttribute('SecondForeign', 'deep-foreign');

				html6.setAttribute('InnerHTML', 'deep-html');
				html6.setAttribute('DataType', 'nested');

				svg7.setAttribute('ReEnteredSVG', 'back-to-svg');

				svg8.setAttribute('DeepestAttr', 'circle-val');
				svg8.setAttribute('CaseSensitive', 'deepest');

				return wrapper;
			}
			function runTests(root: Element): void {
				// DOM tree structure with attributes:
				// <div id="test-container">
				//   <div id="html1" viewBox="html-val" dataIndex="0" testAttr="alpha">
				//     <svg id="svg1" viewBox="svg-val" dataIndex="1" testAttr="beta">
				//       <g id="svg2" mixedCase="foo" dataValue="first">
				//         <circle id="svg3" innerAttr="found">
				//       </g>
				//       <foreignObject id="foreign1" foreignAttr="foreign-val">
				//         <div id="html4" ForeignHTML="inside-foreign" DataType="html-in-svg">
				//           <span id="html5" NestedCase="span-val">
				//         </div>
				//       </foreignObject>
				//     </svg>
				//     <div id="html2" viewBox="nested" mathVariant="bold">
				//       <math id="math1" mathVariant="italic" displayStyle="true">
				//         <mi id="math2" testIndex="5" dataValue="second">
				//       </math>
				//       <svg id="svg6" DeepSVG="middle-svg" CaseSensitive="nested">
				//         <foreignObject id="foreign2" SecondForeign="deep-foreign">
				//           <div id="html6" InnerHTML="deep-html" DataType="nested">
				//             <svg id="svg7" ReEnteredSVG="back-to-svg">
				//               <circle id="svg8" DeepestAttr="circle-val" CaseSensitive="deepest">
				//             </svg>
				//           </div>
				//         </foreignObject>
				//       </svg>
				//     </div>
				//   </div>
				//   <svg id="svg4">
				//     <rect id="svg5" viewBox="rect-val" testIndex="10">
				//   </svg>
				//   <div id="html3" MixedCase="bar" TestIndex="20">
				// </div>

				// Test 1: viewBox with mixed case - HTML is case-insensitive, SVG is case-sensitive
				let results = root.querySelectorAll('[viewBox]');
				expect(results.length, '[viewBox] should match 2 HTML elements + 2 SVG elements').toBe(4);
				let ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'html2', 'svg1', 'svg5'],
					message: '[viewBox] should match correct elements',
				});

				// Test 2: viewbox lowercase - should only match HTML elements
				results = root.querySelectorAll('[viewbox]');
				expect(results.length, '[viewbox] should only match HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'html2'],
					message: '[viewbox] should only match HTML divs',
				});

				// Test 3: VIEWBOX uppercase - should only match HTML elements
				results = root.querySelectorAll('[VIEWBOX]');
				expect(results.length, '[VIEWBOX] should only match HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'html2'],
					message: '[VIEWBOX] should only match HTML divs',
				});

				// Test 4: mathVariant - HTML is case-insensitive, MathML is case-sensitive
				results = root.querySelectorAll('[mathVariant]');
				expect(results.length, '[mathVariant] should match HTML + MathML').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html2', 'math1'],
					message: '[mathVariant] should match correct elements',
				});

				// Test 5: mathvariant lowercase - should only match HTML
				results = root.querySelectorAll('[mathvariant]');
				expect(results.length, '[mathvariant] should only match HTML').toBe(1);
				expect(results[0]!.id, '[mathvariant] should match html2').toBe('html2');

				// Test 6: dataIndex exact case
				results = root.querySelectorAll('[dataIndex]');
				expect(results.length, '[dataIndex] should match HTML and SVG').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'svg1'],
					message: '[dataIndex] should match html1 and svg1',
				});

				// Test 7: dataindex lowercase - should only match HTML
				results = root.querySelectorAll('[dataindex]');
				expect(results.length, '[dataindex] should only match HTML').toBe(1);
				expect(results[0]!.id, '[dataindex] should match html1').toBe('html1');

				// Test 8: testIndex mixed case
				// HTML elements: selector lowercased → [testindex] → matches html3
				// SVG/MathML: selector used as-is → [testIndex] → matches math2, svg5 (case-sensitive)
				results = root.querySelectorAll('[testIndex]');
				expect(results.length, '[testIndex] should match 3 elements').toBe(3);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html3', 'math2', 'svg5'],
					message: '[testIndex] should match html3, math2, and svg5',
				});

				// Test 9: TestIndex with capital T
				// HTML elements: selector lowercased → [testindex] → matches html3
				// SVG/MathML: selector used as-is → [TestIndex] → no match (testIndex != TestIndex)
				results = root.querySelectorAll('[TestIndex]');
				expect(results.length, '[TestIndex] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[TestIndex] should match html3').toBe('html3');

				// Test 10: testindex all lowercase
				// HTML elements: selector lowercased → [testindex] → matches html3
				// SVG/MathML: selector used as-is → [testindex] → no match (testIndex != testindex)
				results = root.querySelectorAll('[testindex]');
				expect(results.length, '[testindex] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[testindex] should match html3').toBe('html3');

				// Test 11: mixedCase exact
				// HTML elements: selector lowercased → [mixedcase] → matches html3
				// SVG: selector used as-is → [mixedCase] → matches svg2 (case-sensitive)
				results = root.querySelectorAll('[mixedCase]');
				expect(results.length, '[mixedCase] should match 2 elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html3', 'svg2'],
					message: '[mixedCase] should match html3 and svg2',
				});

				// Test 12: MixedCase capital M
				// HTML elements: selector lowercased → [mixedcase] → matches html3
				// SVG: selector used as-is → [MixedCase] → no match (mixedCase != MixedCase)
				results = root.querySelectorAll('[MixedCase]');
				expect(results.length, '[MixedCase] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[MixedCase] should match html3').toBe('html3');

				// Test 13: mixedcase all lowercase
				// HTML elements: selector lowercased → [mixedcase] → matches html3
				// SVG: selector used as-is → [mixedcase] → no match (mixedCase != mixedcase)
				results = root.querySelectorAll('[mixedcase]');
				expect(results.length, '[mixedcase] should only match HTML element').toBe(1);
				expect(results[0]!.id, '[mixedcase] should match html3').toBe('html3');

				// Test 14: testAttr exact case
				results = root.querySelectorAll('[testAttr]');
				expect(results.length, '[testAttr] should match HTML and SVG').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html1', 'svg1'],
					message: '[testAttr] should match html1 and svg1',
				});

				// Test 15: Attribute value matching with prefix
				results = root.querySelectorAll('[viewBox^="svg"]');
				expect(results.length, '[viewBox^="svg"] should match 1 SVG element').toBe(1);
				expect(results[0]!.id, '[viewBox^="svg"] should match svg1').toBe('svg1');

				// Test 16: Attribute value matching with exact match
				results = root.querySelectorAll('[dataIndex="0"]');
				expect(results.length, '[dataIndex="0"] should match 1 element').toBe(1);
				expect(results[0]!.id, '[dataIndex="0"] should match html1').toBe('html1');

				// Test 17: Nested element query
				results = root.querySelectorAll('[innerAttr]');
				expect(results.length, '[innerAttr] should match nested circle').toBe(1);
				expect(results[0]!.id, '[innerAttr] should match svg3').toBe('svg3');

				// Test 18: displayStyle on MathML
				results = root.querySelectorAll('[displayStyle]');
				expect(results.length, '[displayStyle] should match MathML').toBe(1);
				expect(results[0]!.id, '[displayStyle] should match math1').toBe('math1');

				// Test 19: displaystyle lowercase - should not match anything (no HTML element has it)
				results = root.querySelectorAll('[displaystyle]');
				expect(results.length, '[displaystyle] should not match anything').toBe(0);

				// Test 20: Case-sensitive value matching with 's' flag
				results = root.querySelectorAll('[testAttr="alpha" s]');
				expect(results.length, '[testAttr="alpha" s] should match 1 element').toBe(1);
				expect(results[0]!.id, '[testAttr="alpha" s] should match html1').toBe('html1');

				// Test 21: Case-insensitive value matching with 'i' flag
				results = root.querySelectorAll('[testAttr="ALPHA" i]');
				expect(results.length, '[testAttr="ALPHA" i] should match 1 element').toBe(1);
				expect(results[0]!.id, '[testAttr="ALPHA" i] should match html1').toBe('html1');

				// Test 22: ForeignHTML - HTML inside foreignObject should be case-insensitive
				results = root.querySelectorAll('[ForeignHTML]');
				expect(results.length, '[ForeignHTML] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[ForeignHTML] should match html4').toBe('html4');

				// Test 23: foreignhtml lowercase - should match HTML element in foreignObject
				results = root.querySelectorAll('[foreignhtml]');
				expect(results.length, '[foreignhtml] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[foreignhtml] should match html4').toBe('html4');

				// Test 24: DataType - should match both HTML elements (case-insensitive)
				results = root.querySelectorAll('[DataType]');
				expect(results.length, '[DataType] should match 2 HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html4', 'html6'],
					message: '[DataType] should match html4 and html6',
				});

				// Test 25: datatype lowercase - should match both HTML elements
				results = root.querySelectorAll('[datatype]');
				expect(results.length, '[datatype] should match 2 HTML elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['html4', 'html6'],
					message: '[datatype] should match html4 and html6',
				});

				// Test 26: CaseSensitive on SVG elements - case-sensitive
				results = root.querySelectorAll('[CaseSensitive]');
				expect(results.length, '[CaseSensitive] should match 2 SVG elements').toBe(2);
				ids = Array.from(results)
					.map((el) => el.id)
					.toSorted();
				arrayEquals(ids, {
					expected: ['svg6', 'svg8'],
					message: '[CaseSensitive] should match svg6, svg8',
				});

				// Test 27: casesensitive lowercase - should NOT match SVG elements
				results = root.querySelectorAll('[casesensitive]');
				expect(results.length, '[casesensitive] should not match SVG elements').toBe(0);

				// Test 28: NestedCase - HTML span inside foreignObject should be case-insensitive
				results = root.querySelectorAll('[NestedCase]');
				expect(results.length, '[NestedCase] should match HTML span in foreignObject').toBe(1);
				expect(results[0]!.id, '[NestedCase] should match html5').toBe('html5');

				// Test 29: nestedcase lowercase - should match HTML span
				results = root.querySelectorAll('[nestedcase]');
				expect(results.length, '[nestedcase] should match HTML span in foreignObject').toBe(1);
				expect(results[0]!.id, '[nestedcase] should match html5').toBe('html5');

				// Test 30: ReEnteredSVG - SVG inside HTML inside foreignObject should be case-sensitive
				results = root.querySelectorAll('[ReEnteredSVG]');
				expect(
					results.length,
					'[ReEnteredSVG] should match SVG nested in HTML in foreignObject',
				).toBe(1);
				expect(results[0]!.id, '[ReEnteredSVG] should match svg7').toBe('svg7');

				// Test 31: reenteredsvg lowercase - should NOT match (SVG is case-sensitive)
				results = root.querySelectorAll('[reenteredsvg]');
				expect(results.length, '[reenteredsvg] should not match SVG element').toBe(0);

				// Test 32: DeepestAttr - deeply nested SVG circle should be case-sensitive
				results = root.querySelectorAll('[DeepestAttr]');
				expect(results.length, '[DeepestAttr] should match deeply nested circle').toBe(1);
				expect(results[0]!.id, '[DeepestAttr] should match svg8').toBe('svg8');

				// Test 33: deepestattr lowercase - should NOT match
				results = root.querySelectorAll('[deepestattr]');
				expect(results.length, '[deepestattr] should not match SVG circle').toBe(0);

				// Test 34: foreignAttr on foreignObject element - case-sensitive
				results = root.querySelectorAll('[foreignAttr]');
				expect(results.length, '[foreignAttr] should match foreignObject').toBe(1);
				expect(results[0]!.id, '[foreignAttr] should match foreign1').toBe('foreign1');

				// Test 35: foreignattr lowercase - should NOT match foreignObject (SVG namespace)
				results = root.querySelectorAll('[foreignattr]');
				expect(results.length, '[foreignattr] should not match foreignObject').toBe(0);

				// Test 36: InnerHTML on HTML element inside foreignObject - case-insensitive
				results = root.querySelectorAll('[InnerHTML]');
				expect(results.length, '[InnerHTML] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[InnerHTML] should match html6').toBe('html6');

				// Test 37: innerhtml lowercase - should match HTML in foreignObject
				results = root.querySelectorAll('[innerhtml]');
				expect(results.length, '[innerhtml] should match HTML in foreignObject').toBe(1);
				expect(results[0]!.id, '[innerhtml] should match html6').toBe('html6');

				// Test 38: DeepSVG on SVG element - case-sensitive
				results = root.querySelectorAll('[DeepSVG]');
				expect(results.length, '[DeepSVG] should match SVG element').toBe(1);
				expect(results[0]!.id, '[DeepSVG] should match svg6').toBe('svg6');

				// Test 39: deepsvg lowercase - should NOT match SVG
				results = root.querySelectorAll('[deepsvg]');
				expect(results.length, '[deepsvg] should not match SVG element').toBe(0);

				// Test 40: SecondForeign on foreignObject element - case-sensitive
				results = root.querySelectorAll('[SecondForeign]');
				expect(results.length, '[SecondForeign] should match foreignObject').toBe(1);
				expect(results[0]!.id, '[SecondForeign] should match foreign2').toBe('foreign2');

				// Test 41: secondforeign lowercase - should NOT match foreignObject
				results = root.querySelectorAll('[secondforeign]');
				expect(results.length, '[secondforeign] should not match foreignObject').toBe(0);
			}

			const tree = buildTestTree();

			// Test on disconnected tree first
			runTests(tree);

			// Now append to document and test again
			container.appendChild(tree);
			runTests(container);

			container.innerHTML = '';
		},
	);
}
