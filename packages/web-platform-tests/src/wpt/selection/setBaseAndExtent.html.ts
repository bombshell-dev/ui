import type { CompatibilityContext } from '../../shared/context.ts';
import { testRanges, setupRangeTests } from './common.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	for (let i = 0; i < testRanges.length; i++) {
		context.test(
			'Range ' + i + ' ' + testRanges[i] + ' setBaseAndExtent()',
			({ document }) => {
				const selection = document.getSelection()!;

				var data = setupRangeTests(document)[i]!;
				selection.removeAllRanges();
				selection.setBaseAndExtent(data[0], data[1], data[2], data[3]);
				if (!document.contains(data[0]) || !document.contains(data[2])) {
					expect(selection.rangeCount).toBe(0);
					return;
				}
				expect(selection.rangeCount, 'selection.rangeCount must equal 1').toBe(1);
				expect(selection.anchorNode, 'anchorNode must equal the requested anchor node').toBe(
					data[0],
				);
				expect(selection.anchorOffset, 'anchorOffset must equal the requested anchor offset').toBe(
					data[1],
				);
				expect(selection.focusNode, 'focusNode must equal the requested focus node').toBe(data[2]);
				expect(selection.focusOffset, 'focusOffset must equal the requested focus offset').toBe(
					data[3],
				);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Selection.setBaseAndExtent() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
		context.test(
			'Reverse range ' + i + ' ' + testRanges[i] + ' setBaseAndExtent()',
			({ document }) => {
				const selection = document.getSelection()!;

				var data = setupRangeTests(document)[i]!;
				selection.removeAllRanges();
				selection.setBaseAndExtent(data[2], data[3], data[0], data[1]);
				if (!document.contains(data[0]) || !document.contains(data[2])) {
					expect(selection.rangeCount).toBe(0);
					return;
				}
				expect(selection.rangeCount, 'selection.rangeCount must equal 1').toBe(1);
				expect(selection.anchorNode, 'anchorNode must equal the requested focus node').toBe(
					data[2],
				);
				expect(selection.anchorOffset, 'anchorOffset must equal the requested focus offset').toBe(
					data[3],
				);
				expect(selection.focusNode, 'focusNode must equal the requested anchor node').toBe(data[0]);
				expect(selection.focusOffset, 'focusOffset must equal the requested anchor offset').toBe(
					data[1],
				);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!doctype html>\n<title>Selection.setBaseAndExtent() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
				},
			},
		);
	}
	context.test(
		'setBaseAndExtent() with index larger than length',
		({ document }) => {
			const selection = document.getSelection()!;

			var title = document.getElementsByTagName('title')[0]!;
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, 0, title, 99);
				expect(false, 'focus offset, must throw an IndexSizeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'focus offset, got an IndexSizeError exception').toBe(
					'IndexSizeError',
				);
			}
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, 99, title, 0);
				expect(false, 'anchor offset, must throw an IndexSizeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'anchor offset, got an IndexSizeError exception').toBe(
					'IndexSizeError',
				);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>Selection.setBaseAndExtent() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	context.test(
		'setBaseAndExtent() with negative index',
		({ document }) => {
			const selection = document.getSelection()!;

			var title = document.getElementsByTagName('title')[0]!;
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, 0, title, -1);
				expect(false, 'focus offset, must throw an IndexSizeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'focus offset, got an IndexSizeError exception').toBe(
					'IndexSizeError',
				);
			}
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, -1, title, 0);
				expect(false, 'anchor offset, must throw an IndexSizeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'anchor offset, got an IndexSizeError exception').toBe(
					'IndexSizeError',
				);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>Selection.setBaseAndExtent() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	context.test(
		'setBaseAndExtent() with null nodes',
		({ document }) => {
			const selection = document.getSelection()!;

			var title = document.getElementsByTagName('title')[0]!;
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, 0, null, 0);
				expect(false, 'focus node, must throw an TypeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'focus node, got an TypeError exception').toBe('TypeError');
			}
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(null, 0, title, 0);
				expect(false, 'anchor node, must throw an TypeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'anchor node, got an TypeError exception').toBe('TypeError');
			}
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(null, 0, null, 0);
				expect(false, 'both nodes, must throw an TypeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'both nodes, got an TypeError exception').toBe('TypeError');
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>Selection.setBaseAndExtent() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
	context.test(
		'setBaseAndExtent() with too few params',
		({ document }) => {
			const selection = document.getSelection()!;

			var title = document.getElementsByTagName('title')[0]!;
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, 0, title);
				expect(false, 'focus offset, must throw an TypeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'focus offset, got an TypeError exception').toBe('TypeError');
			}
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title, 0);
				expect(false, 'focus node, must throw an TypeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'focus node, got an TypeError exception').toBe('TypeError');
			}
			try {
				(selection.setBaseAndExtent as (...args: unknown[]) => void)(title);
				expect(false, 'anchor offset, must throw an TypeError exception').toBe(true);
			} catch (e) {
				expect((e as Error).name, 'anchor offset, got an TypeError exception').toBe('TypeError');
			}
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html>\n<title>Selection.setBaseAndExtent() tests</title>\n<div id=log></div>\n<script></script>\n<script></script>\n<script></script>\n<script></script>\n',
			},
		},
	);
}
