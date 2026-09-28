import { id } from './core.ts';
import { close, open, text as ttyText } from '@bomb.sh/tty';
import { describe, expect, test } from 'vitest';
import { Box } from './primitives/box.ts';
import { Text } from './primitives/text.ts';
import { createHost } from './host.ts';
import { layout } from './layout.ts';

describe('layout', () => {
	describe('box', () => {
		test('lays out host children in element order', () => {
			const host = createHost();
			Box.register(host);

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
			Box.register(host);

			const parent = host.createElement('box');
			const child = host.createElement('box');
			host.insertBefore(parent, host.createLiteral('Hello'));
			host.insertBefore(parent, host.createLiteral(', '));
			host.insertBefore(parent, child);
			host.insertBefore(parent, host.createLiteral('World'));
			host.insertBefore(parent, host.createLiteral('!'));
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
		test('reuses packed child layouts and invalidates ancestors after mutation', () => {
			const host = createHost();
			Box.register(host);
			Text.register(host);
			const parent = host.createElement('box');
			const child = host.createElement('text', {}, 'before');
			parent.append(child);
			host.element.append(parent);

			expect([...layout(host.root)]).toEqual([
				open(id(parent.node!)),
				ttyText('before'),
				close(),
			]);
			expect([...layout(host.root)]).toMatchObject([{ directive: 5 }]);

			child.textContent = 'after';

			expect([...layout(host.root)]).toEqual([
				open(id(parent.node!)),
				ttyText('after'),
				close(),
			]);
		});

		test('coalesces literals with the enclosing properties', () => {
			const host = createHost();
			Text.register(host);

			const element = host.createElement('text');
			host.setProperty(element, 'color', 1);
			host.insertBefore(element, host.createLiteral('Hello'));
			host.insertBefore(element, host.createLiteral(', '));
			host.insertBefore(element, host.createLiteral('World!'));
			host.insertBefore(host.element, element);

			expect([...layout(element.node!)]).toEqual([ttyText('Hello, World!', { color: 1 })]);
		});

		test('coalesces text literals at the host root', () => {
			const host = createHost();
			host.insertBefore(host.element, host.createLiteral('Hello'));
			host.insertBefore(host.element, host.createLiteral(', world!'));

			expect([...layout(host.root)]).toEqual([ttyText('Hello, world!')]);
		});
	});
});
