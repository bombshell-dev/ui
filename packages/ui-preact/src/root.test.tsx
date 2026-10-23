import assert from 'node:assert/strict';
import { PassThrough, Writable } from 'node:stream';
import { createUI, Document, Element, Event, type Node, Text } from '@clack/ui';
import { createTestTerminal } from '@termless/test';
import { createPortal, createRef } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createRoot } from './root.ts';

describe('createRoot', () => {
	it('mounts into a nested element without touching its siblings or installing a global document', () => {
		expect(globalThis).not.toHaveProperty('document');
		const document = new Document(vi.fn());
		const parent = document.createElement('div');
		const before = document.createTextNode('before');
		const container = document.createElement('span');
		const after = document.createTextNode('after');
		parent.appendChild(before);
		parent.appendChild(container);
		parent.appendChild(after);
		document.documentElement.appendChild(parent);

		using root = createRoot(container);
		const ref = createRef<Element>();
		expect(root.element).toBe(container);
		root.render(
			<div>
				<span ref={ref}>hello</span>
			</div>,
		);

		const div = element(container.firstChild);
		const span = element(div.firstChild);
		expect(div.localName).toBe('div');
		expect(span.localName).toBe('span');
		expect(span.ownerDocument).toBe(document);
		expect(ref.current).toBe(span);
		expect(text(span.firstChild).data).toBe('hello');
		expect(parent.childNodes).toHaveLength(3);
		expect(parent.childNodes[0]).toBe(before);
		expect(parent.childNodes[1]).toBe(container);
		expect(parent.childNodes[2]).toBe(after);
		root.unmount();
		expect(ref.current).toBeNull();
		expect(container.childNodes).toHaveLength(0);
		expect(parent.childNodes).toHaveLength(3);
		expect(globalThis).not.toHaveProperty('document');
	});

	it('prepares a detached subtree without requesting a frame until it is attached', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const container = document.createElement('div');
		using root = createRoot(container);

		root.render(<span>prepared</span>);
		const span = element(container.firstChild);
		expect(span.isConnected).toBe(false);
		expect(notify).not.toHaveBeenCalled();

		document.documentElement.appendChild(container);
		expect(span.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();
		expect(text(span.firstChild).data).toBe('prepared');
	});

	it('updates attributes and text without replacing unchanged elements or text nodes', () => {
		const document = new Document(vi.fn());
		using root = createRoot(document.documentElement);
		root.render(<span data-state="before">hello</span>);
		const span = element(root.element.firstChild);
		const content = text(span.firstChild);

		root.render(<span data-state="after">42</span>);

		expect(root.element.firstChild).toBe(span);
		expect(span.firstChild).toBe(content);
		expect(content.data).toBe('42');
		expect(span.attributes.map(({ name, value }) => [name, value])).toEqual([
			['data-state', 'after'],
		]);
	});

	it('creates nodes in the right document during asynchronous updates to independent roots', async () => {
		const firstDocument = new Document(vi.fn());
		const secondDocument = new Document(vi.fn());
		using first = createRoot(firstDocument.documentElement);
		using second = createRoot(secondDocument.documentElement);
		const updates: Array<(value: number) => void> = [];

		function Counter({ index }: { index: number }) {
			const [count, setCount] = useState(0);
			updates[index] = setCount;
			return count ? <div>{count}</div> : <span>initial</span>;
		}

		first.render(<Counter index={0} />);
		second.render(<Counter index={1} />);
		const originalSecond = second.element.firstChild;

		await act(() => updates[0]?.(1));

		const firstChild = element(first.element.firstChild);
		expect(firstChild.localName).toBe('div');
		expect(firstChild.ownerDocument).toBe(firstDocument);
		expect(text(firstChild.firstChild).ownerDocument).toBe(firstDocument);
		expect(text(firstChild.firstChild).data).toBe('1');
		expect(second.element.firstChild).toBe(originalSecond);

		await act(() => updates[1]?.(2));

		const secondChild = element(second.element.firstChild);
		expect(secondChild.localName).toBe('div');
		expect(secondChild.ownerDocument).toBe(secondDocument);
		expect(text(secondChild.firstChild).ownerDocument).toBe(secondDocument);
		expect(text(secondChild.firstChild).data).toBe('2');
		expect(text(firstChild.firstChild).data).toBe('1');
		expect(globalThis).not.toHaveProperty('document');
	});

	it('registers capture handlers and replaces or removes JSX event handlers', () => {
		const document = new Document(vi.fn());
		using root = createRoot(document.documentElement);
		const calls: string[] = [];
		root.render(
			<div onKeyDownCapture={() => calls.push('capture')}>
				<span onKeyDown={(event) => calls.push(event.type)}>target</span>
			</div>,
		);
		const target = element(element(root.element.firstChild).firstChild);

		target.dispatchEvent(new Event('keydown', { bubbles: true }));
		expect(calls).toEqual(['capture', 'keydown']);

		root.render(
			<div>
				<span onKeyDown={() => calls.push('replacement')}>target</span>
			</div>,
		);
		expect(element(root.element.firstChild).firstChild).toBe(target);
		target.dispatchEvent(new Event('keydown', { bubbles: true }));
		expect(calls).toEqual(['capture', 'keydown', 'replacement']);

		root.render(
			<div>
				<span>target</span>
			</div>,
		);
		target.dispatchEvent(new Event('keydown', { bubbles: true }));
		expect(calls).toEqual(['capture', 'keydown', 'replacement']);
	});

	it('preserves keyed nodes and runs layout-effect cleanup when removed or disposed', () => {
		const document = new Document(vi.fn());
		const container = document.documentElement;
		const cleanups: string[] = [];

		function Row({ name }: { name: string }) {
			useLayoutEffect(
				() => () => {
					cleanups.push(name);
				},
				[],
			);
			return <span>{name}</span>;
		}

		{
			using root = createRoot(container);
			root.render(['a', 'b', 'c'].map((name) => <Row key={name} name={name} />));
			const original = [...container.childNodes];

			root.render(['c', 'a'].map((name) => <Row key={name} name={name} />));

			expect(container.childNodes).toHaveLength(2);
			expect(container.childNodes[0]).toBe(original[2]);
			expect(container.childNodes[1]).toBe(original[0]);
			expect(original[1]?.parentNode).toBeNull();
			expect(cleanups).toEqual(['b']);
		}

		expect(container.childNodes).toHaveLength(0);
		expect(cleanups).toEqual(['b', 'c', 'a']);
	});

	it('creates and removes portal contents in another document', () => {
		const document = new Document(vi.fn());
		const destination = new Document(vi.fn());
		using root = createRoot(document.documentElement);
		root.render(
			<div>
				local
				{createPortal(<span>remote</span>, destination.documentElement)}
			</div>,
		);

		const remote = element(destination.documentElement.firstChild);
		expect(remote.ownerDocument).toBe(destination);
		expect(text(remote.firstChild).ownerDocument).toBe(destination);
		expect(text(remote.firstChild).data).toBe('remote');
		expect(text(element(root.element.firstChild).firstChild).data).toBe('local');

		root.unmount();
		expect(root.element.childNodes).toHaveLength(0);
		expect(destination.documentElement.childNodes).toHaveLength(0);
		root.unmount();
		expect(destination.documentElement.childNodes).toHaveLength(0);
	});

	it('repaints the terminal when a nested root renders, updates, and unmounts', async () => {
		const terminal = createTestTerminal({ cols: 20, rows: 3 });
		await using _terminal = { [Symbol.asyncDispose]: () => terminal.close() };
		await using input = new PassThrough();
		const output = new Writable({
			write(chunk: Buffer, _encoding, callback) {
				terminal.feed(chunk);
				callback();
			},
		});
		using _output = {
			[Symbol.dispose]() {
				output.destroy();
			},
		};
		await using ui = await createUI({ input, output, width: 20, height: 3 });
		void ui.main();
		const parent = ui.document.createElement('div');
		const container = ui.document.createElement('span');
		parent.appendChild(container);
		ui.document.documentElement.appendChild(parent);
		using root = createRoot(container);

		root.render(<span>hello</span>);
		await expect.poll(() => terminal.screen.getLines()).toEqual(['hello', '', '']);

		root.render(<span>updated</span>);
		await expect.poll(() => terminal.screen.getLines()).toEqual(['updated', '', '']);

		root.unmount();
		await expect.poll(() => terminal.screen.getLines()).toEqual(['', '', '']);
		expect(container.parentNode).toBe(parent);
	});
});

function element(node: Node | null): Element {
	assert.ok(node instanceof Element, 'Expected an element');
	return node;
}

function text(node: Node | null): Text {
	assert.ok(node instanceof Text, 'Expected a text node');
	return node;
}
