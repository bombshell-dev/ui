import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>CSSOM - CSSStyleSheet interface</title>
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
    <style id="my-stylesheet">
        body { width: 50%; }
        #foo { height: 100px; }
    </style>
    <style id="empty-stylesheet"></style>

\x20\x20\x20\x20
</head>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'preconditions',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;

			expect(styleSheet, "CSSStyleSheet and LinkStyle's sheet attribute").toBe(
				(document.getElementById('my-stylesheet')! as HTMLStyleElement).sheet,
			);
			expect(styleSheet.cssRules.length, 'CSSStyleSheet cssRules attribute').toBe(2);
			expect(styleSheet.cssRules[0]!.cssText, 'CSSStyleSheet cssRules attribute').toBe(
				'body { width: 50%; }',
			);
			expect(styleSheet.cssRules[1]!.cssText, 'CSSStyleSheet cssRules attribute').toBe(
				'#foo { height: 100px; }',
			);
			expect(styleSheet.cssRules[2], 'CSSStyleSheet cssRules attribute').toBe(undefined);

			expect(emptyStyleSheet, "CSSStyleSheet and LinkStyle's sheet attribute").toBe(
				(document.getElementById('empty-stylesheet')! as HTMLStyleElement).sheet,
			);
			expect(emptyStyleSheet.cssRules.length, 'CSSStyleSheet cssRules attribute').toBe(0);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'insertRule with #bar selector',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;

			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after insertRule function',
			).toBe(3);
			expect(styleSheet.cssRules[0]!.cssText, 'CSSStyleSheet cssRules attribute').toBe(
				'body { width: 50%; }',
			);
			expect(
				styleSheet.cssRules[1]!.cssText,
				'CSSStyleSheet cssRules attribute after insertRule function',
			).toBe('#bar { margin: 10px; }');
			expect(
				styleSheet.cssRules[2]!.cssText,
				'CSSStyleSheet cssRules attribute after insertRule function',
			).toBe('#foo { height: 100px; }');
			expect(
				(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty,
				'[SameObject] cssRules attribute after insertRule function',
			).toBe(1);
			expect(
				(styleSheet.cssRules[2] as CSSRule & { randomProperty: number }).randomProperty,
				'[SameObject] cssRules attribute after insertRule function',
			).toBe(2);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'insertRule with no argument throws',
		(fixture) => {
			const { document } = fixture;
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			const TypeError = fixture.TypeError;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			expect(function () {
				(styleSheet.insertRule as () => number)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'insertRule with index greater than length throws',
		({ document, DOMException }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			expect(function () {
				styleSheet.insertRule('#bar { margin: 10px; }', styleSheet.cssRules.length + 1);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'deleteRule(1)',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after deleteRule function',
			).toBe(2);
			expect(
				styleSheet.cssRules[0]!.cssText,
				'CSSStyleSheet cssRules attribute after deleteRule function',
			).toBe('body { width: 50%; }');
			expect(
				styleSheet.cssRules[1]!.cssText,
				'CSSStyleSheet cssRules attribute after deleteRule function',
			).toBe('#foo { height: 100px; }');
			expect(
				styleSheet.cssRules[2],
				'CSSStyleSheet cssRules attribute after deleteRule function',
			).toBe(undefined);
			expect(
				(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty,
				'[SameObject] cssRules attribute after deleteRule function',
			).toBe(1);
			expect(
				(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty,
				'[SameObject] cssRules attribute after deleteRule function',
			).toBe(2);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'deleteRule with no argument throws',
		(fixture) => {
			const { document } = fixture;
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			const TypeError = fixture.TypeError;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			expect(function () {
				(styleSheet.deleteRule as () => void)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'deleteRule on empty style sheet throws',
		({ document, DOMException }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			expect(function () {
				emptyStyleSheet.deleteRule(0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'removeRule with no argument removes first rule',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after removeRule function',
			).toBe(1);
			expect(
				styleSheet.cssRules[0]!.cssText,
				'CSSStyleSheet cssRules attribute after removeRule function',
			).toBe('#foo { height: 100px; }');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'removeRule on empty style sheet throws',
		({ document, DOMException }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			expect(function () {
				emptyStyleSheet.removeRule(0);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'addRule with @media rule',
		(fixture) => {
			const { document } = fixture;
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			const CSSMediaRule = fixture.CSSMediaRule;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			expect(styleSheet.addRule('@media all', '#foo { color: red }')).toBe(-1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after addRule function',
			).toBe(2);
			expect(
				styleSheet.cssRules[1] instanceof CSSMediaRule,
				'CSSStyleSheet addRule does some silly string concatenation',
			).toBe(true);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'removeRule(1)',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after removeRule function with index',
			).toBe(1);
			expect(
				styleSheet.cssRules[0]!.cssText,
				'CSSStyleSheet cssRules attribute after deleteRule function with index',
			).toBe('#foo { height: 100px; }');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'addRule with #foo selectors',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			expect(styleSheet.addRule('#foo', 'color: red')).toBe(-1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after addRule function with simple selector',
			).toBe(2);
			expect(
				styleSheet.cssRules[1]!.cssText,
				'CSSStyleSheet cssRules attribute after addRule function without index appends to the end',
			).toBe('#foo { color: red; }');

			expect(styleSheet.addRule('#foo', 'color: blue', 0)).toBe(-1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after addRule function with simple selector with index',
			).toBe(3);
			expect(
				styleSheet.cssRules[0]!.cssText,
				'addRule function with index performs an insertion',
			).toBe('#foo { color: blue; }');
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'addRule with no argument adds "undefined" selector',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			styleSheet.addRule('#foo', 'color: red');
			styleSheet.addRule('#foo', 'color: blue', 0);
			expect(styleSheet.addRule()).toBe(-1);
			expect(
				styleSheet.cssRules.length,
				'CSSStyleSheet cssRules attribute after addRule function without arguments',
			).toBe(4);
			expect(styleSheet.cssRules[3]!.cssText, 'addRule arguments default to undefined').toBe(
				'undefined { }',
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'addRule with index greater than length throws',
		({ document, DOMException }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			styleSheet.addRule('#foo', 'color: red');
			styleSheet.addRule('#foo', 'color: blue', 0);
			styleSheet.addRule();
			expect(function () {
				styleSheet.addRule('#foo', 'color: red', styleSheet.cssRules.length + 1);
			}).toThrow(
				expect.objectContaining({
					name: 'IndexSizeError',
					code: 1,
					constructor: DOMException,
				}),
			);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'cssRules and rules are the same object',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			styleSheet.addRule('#foo', 'color: red');
			styleSheet.addRule('#foo', 'color: blue', 0);
			styleSheet.addRule();
			expect(styleSheet.cssRules).toBe(styleSheet.rules);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'cssRules returns the same object twice',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			styleSheet.addRule('#foo', 'color: red');
			styleSheet.addRule('#foo', 'color: blue', 0);
			styleSheet.addRule();
			expect(styleSheet.cssRules).toBe(styleSheet.cssRules);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'rules returns the same object twice',
		({ document }) => {
			const styleSheet = document.styleSheets[0]!,
				emptyStyleSheet = document.styleSheets[1]!;
			(styleSheet.cssRules[0] as CSSRule & { randomProperty: number }).randomProperty = 1;
			(styleSheet.cssRules[1] as CSSRule & { randomProperty: number }).randomProperty = 2;
			styleSheet.insertRule('#bar { margin: 10px; }', 1);
			styleSheet.deleteRule(1);
			styleSheet.removeRule();
			styleSheet.addRule('@media all', '#foo { color: red }');
			styleSheet.removeRule(1);
			styleSheet.addRule('#foo', 'color: red');
			styleSheet.addRule('#foo', 'color: blue', 0);
			styleSheet.addRule();
			expect(styleSheet.rules).toBe(styleSheet.rules);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
