import type { CompatibilityContext } from '../../../shared/context.ts';

// Each fixture replays preceding setup to preserve the upstream range state.
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Node contents of a single div',
		({ document, Range }) => {
			var r = new Range();
			var testDiv = document.getElementById('test')!;
			var textNode = testDiv.childNodes[0]!;
			var anotherDiv = document.getElementById('another')!;
			var lastDiv = document.getElementById('last')!;
			var lastText = lastDiv.childNodes[0]!;

			r.selectNodeContents(testDiv);
			expect(r.collapsed).toBe(false);
			expect(r.toString()).toBe(testDiv.textContent);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id=test>Test div</div>\n<div id=another>Another div</div>\n<div id=last>Last div</div>\n<div id=log></div>\n',
			},
		},
	);
	context.test(
		'Text node with offsets',
		({ document, Range }) => {
			var r = new Range();
			var testDiv = document.getElementById('test')!;
			var textNode = testDiv.childNodes[0]!;
			var anotherDiv = document.getElementById('another')!;
			var lastDiv = document.getElementById('last')!;
			var lastText = lastDiv.childNodes[0]!;
			r.selectNodeContents(testDiv);

			r.setStart(textNode, 5);
			r.setEnd(textNode, 7);
			expect(r.collapsed).toBe(false);
			expect(r.toString()).toBe('di');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id=test>Test div</div>\n<div id=another>Another div</div>\n<div id=last>Last div</div>\n<div id=log></div>\n',
			},
		},
	);
	context.test(
		'Two nodes, each with a text node',
		({ document, Range }) => {
			var r = new Range();
			var testDiv = document.getElementById('test')!;
			var textNode = testDiv.childNodes[0]!;
			var anotherDiv = document.getElementById('another')!;
			var lastDiv = document.getElementById('last')!;
			var lastText = lastDiv.childNodes[0]!;
			r.selectNodeContents(testDiv);
			r.setStart(textNode, 5);
			r.setEnd(textNode, 7);

			r.setStart(testDiv, 0);
			r.setEnd(anotherDiv, 0);
			expect(r.toString()).toBe('Test div\n');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id=test>Test div</div>\n<div id=another>Another div</div>\n<div id=last>Last div</div>\n<div id=log></div>\n',
			},
		},
	);
	context.test(
		'Three nodes with start offset and end offset on text nodes',
		({ document, Range }) => {
			var r = new Range();
			var testDiv = document.getElementById('test')!;
			var textNode = testDiv.childNodes[0]!;
			var anotherDiv = document.getElementById('another')!;
			var lastDiv = document.getElementById('last')!;
			var lastText = lastDiv.childNodes[0]!;
			r.selectNodeContents(testDiv);
			r.setStart(textNode, 5);
			r.setEnd(textNode, 7);
			r.setStart(testDiv, 0);
			r.setEnd(anotherDiv, 0);

			r.setStart(textNode, 5);
			r.setEnd(lastText, 4);
			expect(r.toString()).toBe('div\nAnother div\nLast');
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id=test>Test div</div>\n<div id=another>Another div</div>\n<div id=last>Last div</div>\n<div id=log></div>\n',
			},
		},
	);
}
