/** @jsxImportSource preact */
import assert from 'node:assert/strict';
import { PassThrough, Writable } from 'node:stream';
import { createTestTerminal } from '@termless/test';
import { createPortal, createRef, render } from 'preact';
import { useLayoutEffect, useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { createUI, Document, Element, type Node, Text } from '../src/index.ts';

describe('Preact', () => {
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
		const ref = createRef<HTMLSpanElement>();

		try {
			render(
				<div>
					<span ref={ref}>hello</span>
				</div>,
				container,
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
		} finally {
			render(null, container);
		}

		expect(ref.current).toBeNull();
		expect(container.childNodes).toHaveLength(0);
		expect(parent.childNodes).toHaveLength(3);
		expect(globalThis).not.toHaveProperty('document');
	});

	it('prepares a detached subtree and continues rendering after it is attached', () => {
		const document = new Document(vi.fn());
		const container = document.createElement('div');

		try {
			render(<span>prepared</span>, container);
			const span = element(container.firstChild);
			expect(container.parentNode).toBeNull();
			expect(span.parentNode).toBe(container);
			expect(text(span.firstChild).data).toBe('prepared');

			document.documentElement.appendChild(container);
			expect(container.parentNode).toBe(document.documentElement);
			expect(container.firstChild).toBe(span);
			expect(text(span.firstChild).data).toBe('prepared');

			render(<span>attached</span>, container);
			expect(container.firstChild).toBe(span);
			expect(text(span.firstChild).data).toBe('attached');
		} finally {
			render(null, container);
		}
	});

	it('updates attributes and text without replacing unchanged elements or text nodes', () => {
		const document = new Document(vi.fn());
		const container = document.documentElement;

		try {
			render(<span data-state="before">hello</span>, container);
			const span = element(container.firstChild);
			const content = text(span.firstChild);

			render(<span data-state="after">42</span>, container);

			expect(container.firstChild).toBe(span);
			expect(span.firstChild).toBe(content);
			expect(content.data).toBe('42');
			expect(Array.from(span.attributes, ({ name, value }) => [name, value])).toEqual([
				['data-state', 'after'],
			]);
		} finally {
			render(null, container);
		}
	});

	it('creates nodes in the right document during asynchronous updates to independent roots', async () => {
		const firstDocument = new Document(vi.fn());
		const secondDocument = new Document(vi.fn());
		const first = firstDocument.documentElement;
		const second = secondDocument.documentElement;
		const updates: Array<(value: number) => void> = [];

		function Counter({ index }: { index: number }) {
			const [count, setCount] = useState(0);
			updates[index] = setCount;
			return count ? <div>{count}</div> : <span>initial</span>;
		}

		try {
			render(<Counter index={0} />, first);
			render(<Counter index={1} />, second);
			const originalSecond = second.firstChild;

			await act(() => updates[0]?.(1));

			const firstChild = element(first.firstChild);
			expect(firstChild.localName).toBe('div');
			expect(firstChild.ownerDocument).toBe(firstDocument);
			expect(text(firstChild.firstChild).ownerDocument).toBe(firstDocument);
			expect(text(firstChild.firstChild).data).toBe('1');
			expect(second.firstChild).toBe(originalSecond);

			await act(() => updates[1]?.(2));

			const secondChild = element(second.firstChild);
			expect(secondChild.localName).toBe('div');
			expect(secondChild.ownerDocument).toBe(secondDocument);
			expect(text(secondChild.firstChild).ownerDocument).toBe(secondDocument);
			expect(text(secondChild.firstChild).data).toBe('2');
			expect(text(firstChild.firstChild).data).toBe('1');
			expect(globalThis).not.toHaveProperty('document');
		} finally {
			render(null, first);
			render(null, second);
		}
	});

	it('bubbles events and replaces or removes JSX event handlers', () => {
		const document = new Document(vi.fn());
		const container = document.documentElement;
		const calls: string[] = [];

		try {
			render(
				<div onKeyDown={() => calls.push('bubble')}>
					<span onKeyDown={(event) => calls.push(event.type)}>target</span>
				</div>,
				container,
			);
			const target = element(element(container.firstChild).firstChild);

			target.dispatchEvent(new Event('keydown', { bubbles: true }));
			expect(calls).toEqual(['keydown', 'bubble']);

			render(
				<div>
					<span onKeyDown={() => calls.push('replacement')}>target</span>
				</div>,
				container,
			);
			expect(element(container.firstChild).firstChild).toBe(target);
			target.dispatchEvent(new Event('keydown', { bubbles: true }));
			expect(calls).toEqual(['keydown', 'bubble', 'replacement']);

			render(
				<div>
					<span>target</span>
				</div>,
				container,
			);
			target.dispatchEvent(new Event('keydown', { bubbles: true }));
			expect(calls).toEqual(['keydown', 'bubble', 'replacement']);
		} finally {
			render(null, container);
		}
	});

	it('reorders adjacent keyed siblings without replacing nodes', () => {
		const document = new Document(vi.fn());
		const container = document.documentElement;

		try {
			render(
				['a', 'b', 'c', 'd'].map((name) => <span key={name}>{name}</span>),
				container,
			);
			const original = [...container.childNodes];

			render(
				['a', 'b', 'd', 'c'].map((name) => <span key={name}>{name}</span>),
				container,
			);

			expect(container.childNodes).toHaveLength(4);
			expect(container.childNodes[0]).toBe(original[0]);
			expect(container.childNodes[1]).toBe(original[1]);
			expect(container.childNodes[2]).toBe(original[3]);
			expect(container.childNodes[3]).toBe(original[2]);
			expect(container.childNodes.map((node) => text(element(node).firstChild).data)).toEqual([
				'a',
				'b',
				'd',
				'c',
			]);
		} finally {
			render(null, container);
		}
	});

	it('preserves keyed nodes and runs layout-effect cleanup when removed or unmounted', () => {
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

		try {
			render(
				['a', 'b', 'c'].map((name) => <Row key={name} name={name} />),
				container,
			);
			const original = [...container.childNodes];

			render(
				['c', 'a'].map((name) => <Row key={name} name={name} />),
				container,
			);

			expect(container.childNodes).toHaveLength(2);
			expect(container.childNodes[0]).toBe(original[2]);
			expect(container.childNodes[1]).toBe(original[0]);
			expect(original[1]?.parentNode).toBeNull();
			expect(cleanups).toEqual(['b']);
		} finally {
			render(null, container);
		}

		expect(container.childNodes).toHaveLength(0);
		expect(cleanups).toEqual(['b', 'c', 'a']);
	});

	it('creates and removes portal contents in another document', () => {
		const document = new Document(vi.fn());
		const destination = new Document(vi.fn());
		const container = document.documentElement;

		try {
			render(
				<div>
					local
					{createPortal(<span>remote</span>, destination.documentElement)}
				</div>,
				container,
			);

			const remote = element(destination.documentElement.firstChild);
			expect(remote.ownerDocument).toBe(destination);
			expect(text(remote.firstChild).ownerDocument).toBe(destination);
			expect(text(remote.firstChild).data).toBe('remote');
			expect(text(element(container.firstChild).firstChild).data).toBe('local');
		} finally {
			render(null, container);
		}

		expect(container.childNodes).toHaveLength(0);
		expect(destination.documentElement.childNodes).toHaveLength(0);
		render(null, container);
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

		try {
			render(<span>hello</span>, container);
			await expect.poll(() => terminal.screen.getLines()).toEqual(['hello', '', '']);

			render(<span>updated</span>, container);
			await expect.poll(() => terminal.screen.getLines()).toEqual(['updated', '', '']);
		} finally {
			render(null, container);
		}

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
