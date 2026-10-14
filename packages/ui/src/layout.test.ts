import { lifecycle, type Node } from './core.ts';
import { close, open, text as ttyText } from '@bomb.sh/tty';
import { describe, expect, test } from 'vitest';
import { Box } from './primitives/box.ts';
import { Text } from './primitives/text.ts';
import { createHost } from './host.ts';
import { invalidateLayout, layout, LayoutApi, withoutLayoutCache } from './layout.ts';

describe('layout', () => {
	describe('box', () => {
		test('lays out host children in element order', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			Box.register(host);

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
			Box.register(host);

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
		test('reuses packed child layouts and invalidates them after text changes', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			Box.register(host);
			Text.register(host);
			const parent = host.createElement('box');
			const child = host.createElement('text', {}, 'before');
			parent.append(child);
			host.element.append(parent);

			expect([...layout(parent.node!)]).toEqual([
				open(id(parent.node!)),
				ttyText('before'),
				close(),
			]);
			const beforeSnapshot = [...layout(parent.node!)][0];
			expect(beforeSnapshot).toMatchObject({ directive: 5 });
			expect([...layout(parent.node!)][0]).toBe(beforeSnapshot);

			child.textContent = 'after';

			expect([...layout(parent.node!)]).toEqual([
				open(id(parent.node!)),
				ttyText('after'),
				close(),
			]);
			expect([...layout(parent.node!)][0]).not.toBe(beforeSnapshot);
		});

		test('coalesces literals with the enclosing properties', () => {
			const host = createHost();
			LayoutApi.init(host.root);
			Text.register(host);

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

	test('explicitly invalidates cached primitive output', () => {
		const host = createHost();
		LayoutApi.init(host.root);
		let content = 'before';
		const element = host.createElement('custom');
		element.layout = () => [ttyText(content)];
		host.element.append(element);

		expect([...layout(element.node!)]).toEqual([ttyText('before')]);
		content = 'after';
		invalidateLayout(element.node!);
		expect([...layout(element.node!)]).toEqual([ttyText('after')]);
	});

	test('bypasses cached snapshots for one synchronous layout', () => {
		const host = createHost();
		LayoutApi.init(host.root);
		let layoutCalls = 0;
		const element = host.createElement('custom');
		element.layout = () => {
			layoutCalls++;
			return [ttyText('hello')];
		};
		host.element.append(element);

		layout(element.node!);
		const cachedSnapshot = [...layout(element.node!)][0];
		expect(cachedSnapshot).toMatchObject({ directive: 5 });
		expect(layoutCalls).toBe(1);

		expect(withoutLayoutCache(() => [...layout(element.node!)])).toEqual([ttyText('hello')]);
		expect(layoutCalls).toBe(2);
		expect([...layout(element.node!)][0]).toBe(cachedSnapshot);
	});
});

function id(node: Node): string {
	return lifecycle.id(node);
}
