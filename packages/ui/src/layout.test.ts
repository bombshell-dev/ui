import { id } from '@bomb.sh/tree';
import { close, open, text as ttyText } from '@bomb.sh/tty';
import { describe, expect, test } from 'vitest';
import { useBoxElement } from './elements/box.ts';
import { useTextElement } from './elements/text.ts';
import { createHost } from './host.ts';
import { layout } from './layout.ts';

describe('layout', () => {
	describe('box', () => {
		test('lays out host children in element order', () => {
			const host = createHost();
			useBoxElement(host);

			const parent = host.createElement('box');
			const first = host.createElement('box');
			const second = host.createElement('box');

			host.insertBefore(parent, first);
			host.insertBefore(parent, second);
			host.insertBefore(host.element, parent);
			host.insertBefore(parent, second, first);

			expect([...layout(host.root)]).toEqual([
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
			useBoxElement(host);

			const parent = host.createElement('box');
			const child = host.createElement('box');
			host.insertBefore(parent, host.createText('Hello'));
			host.insertBefore(parent, host.createText(', '));
			host.insertBefore(parent, child);
			host.insertBefore(parent, host.createText('World'));
			host.insertBefore(parent, host.createText('!'));
			host.insertBefore(host.element, parent);

			expect([...layout(host.root)]).toEqual([
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
			useTextElement(host);

			const element = host.createElement('text');
			host.setProperty(element, 'color', 1);
			host.insertBefore(element, host.createText('Hello'));
			host.insertBefore(element, host.createText(', '));
			host.insertBefore(element, host.createText('World!'));
			host.insertBefore(host.element, element);

			expect([...layout(element.node!)]).toEqual([ttyText('Hello, World!', { color: 1 })]);
		});

		test('coalesces text literals at the host root', () => {
			const host = createHost();
			host.insertBefore(host.element, host.createText('Hello'));
			host.insertBefore(host.element, host.createText(', world!'));

			expect([...layout(host.root)]).toEqual([ttyText('Hello, world!')]);
		});
	});
});
