import { lifecycle, type Node } from './core.ts';
import { close, open, text as ttyText } from '@bomb.sh/tty';
import { describe, expect, test } from 'vitest';
import { useBoxElement } from './elements/box.ts';
import { useTextElement } from './elements/text.ts';
import { createHost } from './host.ts';
import { LayoutApi } from './layout.ts';

describe('layout', () => {
	describe('box', () => {
		test('lays out host children in element order', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			useBoxElement(host);

			const parent = host.createElement('box');
			const first = host.createElement('box');
			const second = host.createElement('box');

			host.insertBefore(parent, first);
			host.insertBefore(parent, second);
			host.insertBefore(host.element, parent);
			host.insertBefore(parent, second, first);

			expect([...LayoutApi.at(host.root).layout()]).toEqual([
				open(id(parent.node!)),
				open(id(second.node!)),
				close(),
				open(id(first.node!)),
				close(),
				close(),
			]);
		});

		test('coalesces runs of text literals around child elements', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			useBoxElement(host);

			const parent = host.createElement('box');
			const child = host.createElement('box');
			host.insertBefore(parent, host.createLiteral('Hello'));
			host.insertBefore(parent, host.createLiteral(', '));
			host.insertBefore(parent, child);
			host.insertBefore(parent, host.createLiteral('World'));
			host.insertBefore(parent, host.createLiteral('!'));
			host.insertBefore(host.element, parent);

			expect([...LayoutApi.at(host.root).layout()]).toEqual([
				open(id(parent.node!)),
				ttyText('Hello, '),
				open(id(child.node!)),
				close(),
				ttyText('World!'),
				close(),
			]);
		});
	});

	describe('text', () => {
		test('coalesces literals with the enclosing properties', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			useTextElement(host);

			const element = host.createElement('text');
			host.setProperty(element, 'color', 1);
			host.insertBefore(element, host.createLiteral('Hello'));
			host.insertBefore(element, host.createLiteral(', '));
			host.insertBefore(element, host.createLiteral('World!'));
			host.insertBefore(host.element, element);

			expect([...LayoutApi.at(element.node!).layout()]).toEqual([
				ttyText('Hello, World!', { color: 1 }),
			]);
		});

		test('coalesces text literals at the host root', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			host.insertBefore(host.element, host.createLiteral('Hello'));
			host.insertBefore(host.element, host.createLiteral(', world!'));

			expect([...LayoutApi.at(host.root).layout()]).toEqual([ttyText('Hello, world!')]);
		});
	});
});

function id(node: Node): string {
	return lifecycle.id(node);
}
