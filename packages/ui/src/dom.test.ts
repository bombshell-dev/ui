import { describe, expect, it, vi } from 'vitest';
import { Document, Event, EventTarget, type Node, type Text } from './dom.ts';

describe('DOM connectivity', () => {
	it('preserves a subtree through connection, disconnection, and reconnection', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const root = document.documentElement;
		const branch = document.createElement('div');
		const span = document.createElement('span');
		const text = document.createTextNode('initial');

		expect(root.isConnected).toBe(true);
		expect(branch.isConnected).toBe(false);
		expect(span.isConnected).toBe(false);
		expect(text.isConnected).toBe(false);
		expect(branch.parentNode).toBeNull();

		branch.appendChild(span);
		span.appendChild(text);
		text.data = 'prepared';
		branch.setAttribute('data-state', 'prepared');

		expect(span.parentNode).toBe(branch);
		expect(text.parentNode).toBe(span);
		expect(branch.isConnected).toBe(false);
		expect(span.isConnected).toBe(false);
		expect(text.isConnected).toBe(false);
		expect(text.data).toBe('prepared');
		expect(branch.attributes[0]).toMatchObject({ name: 'data-state', value: 'prepared' });
		expect(notify).not.toHaveBeenCalled();

		root.appendChild(branch);

		expect(root.childNodes).toHaveLength(1);
		expect(root.childNodes[0]).toBe(branch);
		expect(branch.parentNode).toBe(root);
		expect(branch.isConnected).toBe(true);
		expect(span.isConnected).toBe(true);
		expect(text.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'connected';
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		branch.setAttribute('data-state', 'connected');
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		const extra = document.createTextNode('!');
		span.appendChild(extra);
		expect(extra.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		root.removeChild(branch);

		expect(root.childNodes).toHaveLength(0);
		expect(branch.parentNode).toBeNull();
		expect(span.parentNode).toBe(branch);
		expect(text.parentNode).toBe(span);
		expect(branch.isConnected).toBe(false);
		expect(span.isConnected).toBe(false);
		expect(text.isConnected).toBe(false);
		expect(extra.isConnected).toBe(false);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'detached';
		branch.removeAttribute('data-state');
		span.removeChild(extra);

		expect(extra.parentNode).toBeNull();
		expect(span.childNodes).toHaveLength(1);
		expect(span.childNodes[0]).toBe(text);
		expect(text.data).toBe('detached');
		expect(branch.attributes).toHaveLength(0);
		expect(notify).not.toHaveBeenCalled();

		root.appendChild(branch);

		expect(root.childNodes).toHaveLength(1);
		expect(root.childNodes[0]).toBe(branch);
		expect(branch.parentNode).toBe(root);
		expect(branch.isConnected).toBe(true);
		expect(span.isConnected).toBe(true);
		expect(text.isConnected).toBe(true);
		expect(extra.isConnected).toBe(false);
		expect(text.data).toBe('detached');
		expect(branch.attributes).toHaveLength(0);
		expect(notify).toHaveBeenCalled();
	});

	it('moves a subtree between detached parents without notifying', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const source = document.createElement('div');
		const destination = document.createElement('div');
		const branch = document.createElement('span');
		const text = document.createTextNode('before');
		branch.appendChild(text);
		source.appendChild(branch);
		notify.mockClear();

		destination.appendChild(branch);

		expect(source.childNodes).toHaveLength(0);
		expect(destination.childNodes).toHaveLength(1);
		expect(destination.childNodes[0]).toBe(branch);
		expect(branch.parentNode).toBe(destination);
		expect(branch.childNodes).toHaveLength(1);
		expect(branch.childNodes[0]).toBe(text);
		expect(text.parentNode).toBe(branch);
		expect(source.isConnected).toBe(false);
		expect(destination.isConnected).toBe(false);
		expect(branch.isConnected).toBe(false);
		expect(text.isConnected).toBe(false);
		expect(notify).not.toHaveBeenCalled();

		text.data = 'after';
		expect(notify).not.toHaveBeenCalled();

		branch.setAttribute('data-state', 'after');
		expect(notify).not.toHaveBeenCalled();
	});

	it('connects a detached subtree and starts notifying when moved into a connected parent', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const source = document.createElement('div');
		const destination = document.createElement('div');
		const branch = document.createElement('span');
		const text = document.createTextNode('before');
		branch.appendChild(text);
		source.appendChild(branch);
		document.documentElement.appendChild(destination);
		notify.mockClear();

		destination.appendChild(branch);

		expect(source.childNodes).toHaveLength(0);
		expect(destination.childNodes).toHaveLength(1);
		expect(destination.childNodes[0]).toBe(branch);
		expect(branch.parentNode).toBe(destination);
		expect(branch.childNodes).toHaveLength(1);
		expect(branch.childNodes[0]).toBe(text);
		expect(text.parentNode).toBe(branch);
		expect(source.isConnected).toBe(false);
		expect(destination.isConnected).toBe(true);
		expect(branch.isConnected).toBe(true);
		expect(text.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'after';
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		branch.setAttribute('data-state', 'after');
		expect(notify).toHaveBeenCalled();
	});

	it('notifies removal and stops notifying when a subtree moves into a detached parent', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const source = document.createElement('div');
		const destination = document.createElement('div');
		const branch = document.createElement('span');
		const text = document.createTextNode('before');
		branch.appendChild(text);
		source.appendChild(branch);
		document.documentElement.appendChild(source);
		notify.mockClear();

		destination.appendChild(branch);

		expect(source.childNodes).toHaveLength(0);
		expect(destination.childNodes).toHaveLength(1);
		expect(destination.childNodes[0]).toBe(branch);
		expect(branch.parentNode).toBe(destination);
		expect(branch.childNodes).toHaveLength(1);
		expect(branch.childNodes[0]).toBe(text);
		expect(text.parentNode).toBe(branch);
		expect(source.isConnected).toBe(true);
		expect(destination.isConnected).toBe(false);
		expect(branch.isConnected).toBe(false);
		expect(text.isConnected).toBe(false);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'after';
		expect(notify).not.toHaveBeenCalled();

		branch.setAttribute('data-state', 'after');
		expect(notify).not.toHaveBeenCalled();
	});

	it('keeps a subtree connected and notifying when moved between connected parents', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const source = document.createElement('div');
		const destination = document.createElement('div');
		const branch = document.createElement('span');
		const text = document.createTextNode('before');
		branch.appendChild(text);
		source.appendChild(branch);
		document.documentElement.appendChild(source);
		document.documentElement.appendChild(destination);
		notify.mockClear();

		destination.appendChild(branch);

		expect(source.childNodes).toHaveLength(0);
		expect(destination.childNodes).toHaveLength(1);
		expect(destination.childNodes[0]).toBe(branch);
		expect(branch.parentNode).toBe(destination);
		expect(branch.childNodes).toHaveLength(1);
		expect(branch.childNodes[0]).toBe(text);
		expect(text.parentNode).toBe(branch);
		expect(source.isConnected).toBe(true);
		expect(destination.isConnected).toBe(true);
		expect(branch.isConnected).toBe(true);
		expect(text.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'after';
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		branch.setAttribute('data-state', 'after');
		expect(notify).toHaveBeenCalled();
	});

	it('moves an existing child to the end without duplicating it', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const root = document.documentElement;
		const first = document.createTextNode('first');
		const second = document.createTextNode('second');
		root.appendChild(first);
		root.appendChild(second);
		notify.mockClear();

		root.appendChild(first);

		expect(root.childNodes).toHaveLength(2);
		expect(root.childNodes[0]).toBe(second);
		expect(root.childNodes[1]).toBe(first);
		expect(first.parentNode).toBe(root);
		expect(second.parentNode).toBe(root);
		expect(first.isConnected).toBe(true);
		expect(second.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();
	});

	it('rejects cycles and removal from the wrong parent without changing the tree', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const root = document.documentElement;
		const parent = document.createElement('div');
		const other = document.createElement('div');
		const child = document.createElement('span');
		parent.appendChild(child);
		root.appendChild(parent);
		root.appendChild(other);
		notify.mockClear();

		for (const [mutate, name] of [
			[() => child.appendChild(parent), 'HierarchyRequestError'],
			[() => parent.appendChild(parent), 'HierarchyRequestError'],
			[() => other.removeChild(child), 'NotFoundError'],
		] as const) {
			expect(mutate).toThrow(expect.objectContaining({ constructor: DOMException, name }));

			expect(root.childNodes).toHaveLength(2);
			expect(root.childNodes[0]).toBe(parent);
			expect(root.childNodes[1]).toBe(other);
			expect(parent.parentNode).toBe(root);
			expect(other.parentNode).toBe(root);
			expect(parent.childNodes).toHaveLength(1);
			expect(parent.childNodes[0]).toBe(child);
			expect(child.parentNode).toBe(parent);
			expect(child.childNodes).toHaveLength(0);
			expect(other.childNodes).toHaveLength(0);
			expect(notify).not.toHaveBeenCalled();
		}
	});
});

describe('createElementNS', () => {
	it('creates HTML elements and text with the metadata used to match existing nodes', () => {
		const document = new Document(vi.fn());
		const namespace = 'http://www.w3.org/1999/xhtml';
		const div = document.createElementNS(namespace, 'div');
		const span = document.createElement('span');
		const text = document.createTextNode('hello');

		expect(document.documentElement.ownerDocument).toBe(document);
		expect(document.documentElement.namespaceURI).toBe(namespace);
		expect(document.documentElement.nodeType).toBe(1);
		expect(div.ownerDocument).toBe(document);
		expect(div.namespaceURI).toBe(namespace);
		expect(div.localName).toBe('div');
		expect(div.nodeName).toBe('DIV');
		expect(div.nodeType).toBe(1);
		expect(div.parentNode).toBeNull();
		expect(div.isConnected).toBe(false);
		expect(span.namespaceURI).toBe(namespace);
		expect(span.localName).toBe('span');
		expect(text.ownerDocument).toBe(document);
		expect(text.nodeName).toBe('#text');
		expect(text.nodeType).toBe(3);
		expect(text.firstChild).toBeNull();
		expect(text.nextSibling).toBeNull();
	});
});

describe('createTextNode / data', () => {
	it('coerces numeric text to strings and updates or clears it without replacing the node', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		// Preact passes numbers directly from JavaScript, despite the DOM's string signature.
		const text: Text = Reflect.apply(document.createTextNode, document, [42]);

		expect(text.data).toBe('42');
		expect(notify).not.toHaveBeenCalled();
		document.documentElement.appendChild(text);
		notify.mockClear();

		Reflect.set(text, 'data', 43n);

		expect(text.data).toBe('43');
		expect(document.documentElement.childNodes[0]).toBe(text);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = '43';
		expect(notify).not.toHaveBeenCalled();

		text.data = '';
		expect(text.data).toBe('');
		expect(document.documentElement.childNodes).toHaveLength(1);
		expect(document.documentElement.childNodes[0]).toBe(text);
		expect(notify).toHaveBeenCalled();
	});
});

describe('insertBefore', () => {
	it('inserts before an anchor and appends with a null anchor', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const parent = document.createElement('div');
		const first = document.createTextNode('first');
		const middle = document.createElement('span');
		const last = document.createTextNode('last');

		expect(parent.firstChild).toBeNull();
		expect(parent.insertBefore(last, null)).toBe(last);
		expect(parent.insertBefore(first, last)).toBe(first);
		expect(parent.insertBefore(middle, last)).toBe(middle);

		expect(parent.childNodes).toHaveLength(3);
		expect(parent.childNodes[0]).toBe(first);
		expect(parent.childNodes[1]).toBe(middle);
		expect(parent.childNodes[2]).toBe(last);
		expect(parent.firstChild).toBe(first);
		expect(first.nextSibling).toBe(middle);
		expect(middle.nextSibling).toBe(last);
		expect(last.nextSibling).toBeNull();
		expect(first.parentNode).toBe(parent);
		expect(middle.parentNode).toBe(parent);
		expect(last.parentNode).toBe(parent);
		expect(parent.children).toHaveLength(1);
		expect(parent.children[0]).toBe(middle);
		expect(notify).not.toHaveBeenCalled();
	});

	it('reorders existing children in both directions without duplicating them', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const parent = document.documentElement;
		const first = document.createElement('span');
		const middle = document.createTextNode('middle');
		const last = document.createElement('span');
		parent.appendChild(first);
		parent.appendChild(middle);
		parent.appendChild(last);
		notify.mockClear();

		parent.insertBefore(last, first);

		expect(parent.childNodes).toHaveLength(3);
		expect(parent.firstChild).toBe(last);
		expect(last.nextSibling).toBe(first);
		expect(first.nextSibling).toBe(middle);
		expect(middle.nextSibling).toBeNull();
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		parent.insertBefore(last, middle);

		expect(parent.childNodes).toHaveLength(3);
		expect(parent.firstChild).toBe(first);
		expect(first.nextSibling).toBe(last);
		expect(last.nextSibling).toBe(middle);
		expect(middle.nextSibling).toBeNull();
		expect(notify).toHaveBeenCalled();

		parent.insertBefore(last, null);
		parent.insertBefore(first, first);

		expect(parent.childNodes).toHaveLength(3);
		expect(parent.childNodes[0]).toBe(first);
		expect(parent.childNodes[1]).toBe(middle);
		expect(parent.childNodes[2]).toBe(last);
		expect(parent.firstChild).toBe(first);
		expect(first.nextSibling).toBe(middle);
		expect(middle.nextSibling).toBe(last);
		expect(last.nextSibling).toBeNull();
		expect(first.parentNode).toBe(parent);
		expect(middle.parentNode).toBe(parent);
		expect(last.parentNode).toBe(parent);
	});

	it('connects and disconnects a subtree when inserting it into another parent', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const detached = document.createElement('div');
		const root = document.documentElement;
		const branch = document.createElement('span');
		const text = document.createTextNode('before');
		const anchor = document.createTextNode('anchor');
		branch.appendChild(text);
		detached.appendChild(branch);
		root.appendChild(anchor);
		notify.mockClear();

		root.insertBefore(branch, anchor);

		expect(detached.childNodes).toHaveLength(0);
		expect(detached.firstChild).toBeNull();
		expect(root.childNodes).toHaveLength(2);
		expect(root.firstChild).toBe(branch);
		expect(branch.nextSibling).toBe(anchor);
		expect(branch.parentNode).toBe(root);
		expect(branch.childNodes[0]).toBe(text);
		expect(text.parentNode).toBe(branch);
		expect(branch.isConnected).toBe(true);
		expect(text.isConnected).toBe(true);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'connected';
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		detached.insertBefore(branch, null);

		expect(root.childNodes).toHaveLength(1);
		expect(root.firstChild).toBe(anchor);
		expect(detached.childNodes).toHaveLength(1);
		expect(detached.firstChild).toBe(branch);
		expect(branch.parentNode).toBe(detached);
		expect(branch.nextSibling).toBeNull();
		expect(branch.childNodes[0]).toBe(text);
		expect(text.parentNode).toBe(branch);
		expect(branch.isConnected).toBe(false);
		expect(text.isConnected).toBe(false);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		text.data = 'detached';
		expect(notify).not.toHaveBeenCalled();
	});

	it('rejects invalid insertion anchors and cycles before detaching any nodes', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const root = document.documentElement;
		const parent = document.createElement('div');
		const other = document.createElement('div');
		const child = document.createElement('span');
		parent.appendChild(child);
		root.appendChild(parent);
		root.appendChild(other);
		notify.mockClear();

		expect(parent.insertBefore).toBeTypeOf('function');
		expect(() => other.insertBefore(child, parent)).toThrow(
			expect.objectContaining({ constructor: DOMException, name: 'NotFoundError' }),
		);
		expect(parent.childNodes).toHaveLength(1);
		expect(parent.childNodes[0]).toBe(child);
		expect(child.parentNode).toBe(parent);
		expect(other.childNodes).toHaveLength(0);
		expect(notify).not.toHaveBeenCalled();

		expect(() => child.insertBefore(parent, null)).toThrow();
		expect(root.childNodes).toHaveLength(2);
		expect(root.childNodes[0]).toBe(parent);
		expect(root.childNodes[1]).toBe(other);
		expect(parent.parentNode).toBe(root);
		expect(parent.childNodes[0]).toBe(child);
		expect(child.parentNode).toBe(parent);
		expect(child.childNodes).toHaveLength(0);
		expect(notify).not.toHaveBeenCalled();

		expect(() => parent.insertBefore(parent, child)).toThrow();
		expect(root.childNodes[0]).toBe(parent);
		expect(parent.parentNode).toBe(root);
		expect(parent.childNodes).toHaveLength(1);
		expect(parent.childNodes[0]).toBe(child);
		expect(child.parentNode).toBe(parent);
		expect(notify).not.toHaveBeenCalled();
	});
});

describe('remove', () => {
	it('removes elements and text, updates sibling links, and ignores repeated removal', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const root = document.documentElement;
		const branch = document.createElement('span');
		const nested = document.createTextNode('nested');
		const sibling = document.createTextNode('sibling');
		branch.appendChild(nested);
		root.appendChild(branch);
		root.appendChild(sibling);
		notify.mockClear();

		branch.remove();

		expect(root.childNodes).toHaveLength(1);
		expect(root.firstChild).toBe(sibling);
		expect(branch.parentNode).toBeNull();
		expect(branch.nextSibling).toBeNull();
		expect(branch.firstChild).toBe(nested);
		expect(nested.parentNode).toBe(branch);
		expect(branch.isConnected).toBe(false);
		expect(nested.isConnected).toBe(false);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		branch.remove();
		expect(notify).not.toHaveBeenCalled();

		sibling.remove();

		expect(root.childNodes).toHaveLength(0);
		expect(root.firstChild).toBeNull();
		expect(sibling.parentNode).toBeNull();
		expect(sibling.nextSibling).toBeNull();
		expect(sibling.isConnected).toBe(false);
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		sibling.remove();
		expect(notify).not.toHaveBeenCalled();
	});
});

describe('setAttribute / removeAttribute', () => {
	it('stores string attributes for existing-node matching and updates them without duplicates', () => {
		const notify = vi.fn();
		const document = new Document(notify);
		const element = document.createElement('span');

		expect(element.attributes).toHaveLength(0);
		element.setAttribute('title', 'before');
		// Attribute values arrive from JavaScript as numbers and booleans too.
		Reflect.apply(element.setAttribute, element, ['data-count', 42]);
		Reflect.apply(element.setAttribute, element, ['aria-hidden', false]);

		expect(element.attributes).toHaveLength(3);
		expect(element.attributes[0]).toMatchObject({ name: 'title', value: 'before' });
		expect(element.attributes[1]).toMatchObject({ name: 'data-count', value: '42' });
		expect(element.attributes[2]).toMatchObject({ name: 'aria-hidden', value: 'false' });
		expect(notify).not.toHaveBeenCalled();

		document.documentElement.appendChild(element);
		notify.mockClear();
		element.setAttribute('title', 'after');

		expect(element.attributes).toHaveLength(3);
		expect(element.attributes[0]).toMatchObject({ name: 'title', value: 'after' });
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		element.removeAttribute('data-count');

		expect(element.attributes).toHaveLength(2);
		expect(element.attributes[0]).toMatchObject({ name: 'title', value: 'after' });
		expect(element.attributes[1]).toMatchObject({ name: 'aria-hidden', value: 'false' });
		expect(notify).toHaveBeenCalled();

		notify.mockClear();
		element.removeAttribute('data-count');
		expect(element.attributes).toHaveLength(2);
		expect(notify).not.toHaveBeenCalled();

		document.documentElement.removeChild(element);
		notify.mockClear();
		element.removeAttribute('title');
		element.removeAttribute('aria-hidden');
		expect(element.attributes).toHaveLength(0);
		expect(notify).not.toHaveBeenCalled();
	});
});

describe('events', () => {
	describe('Event', () => {
		it('starts with no dispatch state and allows framework bookkeeping', () => {
			expect(Event).toBeTypeOf('function');
			expect(Event).toBe(globalThis.Event);
			const event = new Event('click');

			expect(event).toBeInstanceOf(globalThis.Event);
			expect(event.type).toBe('click');
			expect(event.bubbles).toBe(false);
			expect(event.cancelable).toBe(false);
			expect(event.defaultPrevented).toBe(false);
			expect(event.target).toBeNull();
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);
			expect(Event.NONE).toBe(0);
			expect(Event.CAPTURING_PHASE).toBe(1);
			expect(Event.AT_TARGET).toBe(2);
			expect(Event.BUBBLING_PHASE).toBe(3);

			const dispatched = Symbol('dispatched');
			expect(Reflect.set(event, dispatched, 1)).toBe(true);
			expect(Reflect.get(event, dispatched)).toBe(1);
		});
	});

	describe('native events and listener options', () => {
		it('dispatches native events and custom events with their identity and data intact', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			expect(target).toBeInstanceOf(globalThis.EventTarget);
			const calls: unknown[][] = [];
			const details: unknown[] = [];
			function record(this: Node, event: Event): void {
				calls.push([this, event, event.target, event.currentTarget, event.eventPhase]);
				if (event instanceof globalThis.CustomEvent) {
					details.push(event.detail);
				}
			}
			target.addEventListener('native', record);
			root.addEventListener('native', record);
			const detail = { value: 'original data' };
			const events = [
				new globalThis.Event('native', { bubbles: true }),
				new globalThis.CustomEvent('native', { bubbles: true, detail }),
			];

			for (const event of events) {
				calls.length = 0;
				expect(target.dispatchEvent(event)).toBe(true);
				expect(calls).toEqual([
					[target, event, target, target, Event.AT_TARGET],
					[root, event, target, root, Event.BUBBLING_PHASE],
				]);
				expect(calls.every((call) => call[1] === event)).toBe(true);
				expect(event.target).toBe(target);
				expect(event.currentTarget).toBeNull();
				expect(event.eventPhase).toBe(Event.NONE);
			}
			expect(details).toEqual([detail, detail]);
			expect(details.every((received) => received === detail)).toBe(true);
		});

		it('removes once listeners before invoking them so nested events do not invoke them again', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const outer = new globalThis.Event('click');
			const inner = new globalThis.Event('click');
			const once = vi.fn(() => target.dispatchEvent(inner));
			const regular = vi.fn();
			const options: Parameters<EventTarget['addEventListener']>[2] = Object.create({
				capture: false,
				once: true,
			});
			target.addEventListener('click', once, options);
			target.addEventListener('click', regular);

			target.dispatchEvent(outer);

			expect(once).toHaveBeenCalledExactlyOnceWith(outer);
			expect(regular.mock.calls).toEqual([[inner], [outer]]);
			target.dispatchEvent(outer);
			expect(once).toHaveBeenCalledTimes(1);
			expect(regular.mock.calls).toEqual([[inner], [outer], [outer]]);
		});

		it('skips already aborted signals and removes listeners on abort', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const controller = new AbortController();
			const aborted = vi.fn();
			const listener = vi.fn();
			target.addEventListener('click', aborted, { signal: AbortSignal.abort() });
			target.addEventListener('click', listener, { signal: controller.signal });

			target.dispatchEvent(new globalThis.Event('click'));
			expect(aborted).not.toHaveBeenCalled();
			expect(listener).toHaveBeenCalledTimes(1);

			controller.abort();
			target.dispatchEvent(new globalThis.Event('click'));
			expect(listener).toHaveBeenCalledTimes(1);
		});

		it('skips a listener aborted by an earlier listener during dispatch', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const controller = new AbortController();
			const listener = vi.fn();
			target.addEventListener('click', () => controller.abort());
			target.addEventListener('click', listener, { signal: controller.signal });

			target.dispatchEvent(new globalThis.Event('click'));

			expect(listener).not.toHaveBeenCalled();
		});

		it('prevents passive listeners from canceling while allowing subsequent ordinary listeners to cancel', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const prevented: boolean[] = [];
			target.addEventListener(
				'click',
				(event) => {
					event.preventDefault();
					event.returnValue = false;
				},
				{ passive: true },
			);
			root.addEventListener('click', (event) => prevented.push(event.defaultPrevented));
			const passive = new globalThis.Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(passive)).toBe(true);
			expect(passive.defaultPrevented).toBe(false);

			target.addEventListener('click', (event) => event.preventDefault());
			const active = new globalThis.Event('click', { bubbles: true, cancelable: true });
			expect(target.dispatchEvent(active)).toBe(false);
			expect(active.defaultPrevented).toBe(true);
			expect(prevented).toEqual([false, true]);
		});

		it('uses listener object identity and resolves handleEvent with the object as this on each dispatch', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const first = vi.fn();
			const second = vi.fn();
			const listener = { handleEvent: first };
			target.addEventListener('click', listener);
			target.addEventListener('click', listener);
			const initial = new globalThis.Event('click');

			target.dispatchEvent(initial);
			expect(first).toHaveBeenCalledExactlyOnceWith(initial);
			expect(first.mock.contexts[0]).toBe(listener);

			listener.handleEvent = second;
			const updated = new globalThis.Event('click');
			target.dispatchEvent(updated);
			expect(first).toHaveBeenCalledTimes(1);
			expect(second).toHaveBeenCalledExactlyOnceWith(updated);
			expect(second.mock.contexts[0]).toBe(listener);

			target.removeEventListener('click', listener);
			target.dispatchEvent(new globalThis.Event('click'));
			expect(second).toHaveBeenCalledTimes(1);
		});

		it('retains native propagation flags when reusing a stopped event', () => {
			for (const method of ['stopPropagation', 'stopImmediatePropagation'] as const) {
				const document = new Document(vi.fn());
				const root = document.documentElement;
				const target = document.createElement('span');
				root.appendChild(target);
				const listener = vi.fn();
				const ancestor = vi.fn();
				target.addEventListener('click', (event) => event[method](), { once: true });
				target.addEventListener('click', listener);
				root.addEventListener('click', ancestor);
				const event = new globalThis.Event('click', { bubbles: true });

				target.dispatchEvent(event);

				expect(event.cancelBubble).toBe(true);
				expect(event.stopPropagation).toBe(globalThis.Event.prototype.stopPropagation);
				expect(event.stopImmediatePropagation).toBe(
					globalThis.Event.prototype.stopImmediatePropagation,
				);
				expect(event.preventDefault).toBe(globalThis.Event.prototype.preventDefault);
				expect(event.composedPath).toBe(globalThis.Event.prototype.composedPath);
				listener.mockClear();

				expect(target.dispatchEvent(event)).toBe(true);
				expect(listener).toHaveBeenCalledTimes(method === 'stopPropagation' ? 1 : 0);
				expect(ancestor).not.toHaveBeenCalled();
				expect(event.currentTarget).toBeNull();
				expect(event.eventPhase).toBe(Event.NONE);
			}
		});

		it('rejects native redispatch from an active listener', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const event = new globalThis.Event('click', { bubbles: true });
			const nativeTarget = new globalThis.EventTarget();
			const nativeListener = vi.fn();
			nativeTarget.addEventListener('click', nativeListener);
			let redispatchError: unknown;
			const calls: unknown[][] = [];
			target.addEventListener('click', (received) => {
				try {
					nativeTarget.dispatchEvent(received);
				} catch (error) {
					redispatchError = error;
				}
				calls.push(['first', received.target, received.currentTarget, received.eventPhase]);
			});
			target.addEventListener('click', (received) => {
				calls.push(['second', received.target, received.currentTarget, received.eventPhase]);
			});
			root.addEventListener('click', (received) => {
				calls.push(['ancestor', received.target, received.currentTarget, received.eventPhase]);
			});

			expect(target.dispatchEvent(event)).toBe(true);

			expect(redispatchError).toBeInstanceOf(Error);
			expect(nativeListener).not.toHaveBeenCalled();
			expect(calls).toEqual([
				['first', target, target, Event.AT_TARGET],
				['second', target, target, Event.AT_TARGET],
				['ancestor', target, root, Event.BUBBLING_PHASE],
			]);
			expect(event.target).toBe(target);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);
		});
	});

	describe('addEventListener / removeEventListener', () => {
		it('calls a stable listener with the element as this as its handler changes', () => {
			const document = new Document(vi.fn());
			const first = vi.fn();
			const second = vi.fn();
			const element = Object.assign(document.createElement('span'), { handler: first });
			const listener = vi.fn(function (this: typeof element, event: Event): void {
				this.handler(event);
			});
			element.addEventListener('click', listener, false);
			element.addEventListener('click', listener, false);
			const initial = new Event('click');
			element.dispatchEvent(initial);

			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener.mock.contexts[0]).toBe(element);
			expect(first).toHaveBeenCalledExactlyOnceWith(initial);

			element.handler = second;
			const updated = new Event('click');
			element.dispatchEvent(updated);

			expect(first).toHaveBeenCalledTimes(1);
			expect(second).toHaveBeenCalledExactlyOnceWith(updated);

			element.removeEventListener('click', listener, false);
			element.dispatchEvent(new Event('click'));

			expect(listener).toHaveBeenCalledTimes(2);
			expect(second).toHaveBeenCalledTimes(1);
		});

		it('inherits the native listener methods unchanged', () => {
			const document = new Document(vi.fn());
			const element = document.createElement('span');

			expect(EventTarget).toBe(globalThis.EventTarget);
			expect(element.addEventListener).toBe(globalThis.EventTarget.prototype.addEventListener);
			expect(element.removeEventListener).toBe(
				globalThis.EventTarget.prototype.removeEventListener,
			);
		});

		it('uses native capture option registration and removal without a capture traversal', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const element = document.createElement('span');
			root.appendChild(element);
			const calls: string[] = [];
			const listener = () => calls.push('target');
			element.addEventListener('click', listener, true);
			element.addEventListener('click', listener, { capture: true });
			element.addEventListener('click', listener);
			root.addEventListener('click', () => calls.push('root'), { capture: true });

			element.dispatchEvent(new Event('click'));
			expect(calls).toEqual(['target', 'target']);

			calls.length = 0;
			element.dispatchEvent(new Event('click', { bubbles: true }));
			expect(calls).toEqual(['target', 'target', 'root']);

			calls.length = 0;
			element.removeEventListener('click', listener, { capture: true });
			element.dispatchEvent(new Event('click', { bubbles: true }));
			expect(calls).toEqual(['target', 'root']);
		});

		it('scopes listeners by node and event type without requesting a render', () => {
			const notify = vi.fn();
			const document = new Document(notify);
			const first = document.createElement('span');
			const second = document.createElement('span');
			document.documentElement.appendChild(first);
			document.documentElement.appendChild(second);
			notify.mockClear();
			const listener = vi.fn();
			first.addEventListener('click', listener);
			first.addEventListener('keydown', listener);
			second.addEventListener('click', listener);

			first.removeEventListener('click', listener);
			first.removeEventListener('click', listener);
			first.removeEventListener('missing', listener);
			first.dispatchEvent(new Event('click'));
			expect(listener).not.toHaveBeenCalled();

			const keydown = new Event('keydown');
			first.dispatchEvent(keydown);
			expect(listener).toHaveBeenCalledExactlyOnceWith(keydown);

			listener.mockClear();
			const click = new Event('click');
			second.dispatchEvent(click);
			expect(listener).toHaveBeenCalledExactlyOnceWith(click);
			expect(notify).not.toHaveBeenCalled();
		});
	});

	describe('dispatchEvent', () => {
		it('sets the target and clears transient state even when there are no listeners', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const event = new Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(event)).toBe(true);

			expect(event.bubbles).toBe(true);
			expect(event.cancelable).toBe(true);
			expect(event.target).toBe(target);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);
			expect(event.defaultPrevented).toBe(false);
		});

		it('invokes target listeners and bubbles through ancestors to the document in order', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const parent = document.createElement('div');
			const target = document.createElement('span');
			root.appendChild(parent);
			parent.appendChild(target);
			const event = new Event('click', { bubbles: true });
			const calls: string[] = [];
			const phases: number[] = [];
			const contexts: boolean[] = [];
			const targets: boolean[] = [];
			const events: boolean[] = [];
			function record(label: string, currentTarget: Node): (this: Node, received: Event) => void {
				return function (this: Node, received: Event): void {
					calls.push(label);
					phases.push(received.eventPhase);
					contexts.push(this === currentTarget && received.currentTarget === currentTarget);
					targets.push(received.target === target);
					events.push(received === event);
				};
			}
			target.addEventListener('click', record('target first', target));
			target.addEventListener('click', record('target second', target));
			parent.addEventListener('click', record('parent bubble', parent));
			root.addEventListener('click', record('root bubble', root));
			document.addEventListener('click', record('document bubble', document));

			expect(target.dispatchEvent(event)).toBe(true);

			expect(calls).toEqual([
				'target first',
				'target second',
				'parent bubble',
				'root bubble',
				'document bubble',
			]);
			expect(phases).toEqual([
				Event.AT_TARGET,
				Event.AT_TARGET,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
			]);
			expect(contexts.every(Boolean)).toBe(true);
			expect(targets.every(Boolean)).toBe(true);
			expect(events.every(Boolean)).toBe(true);
			expect(event.target).toBe(target);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);
		});

		it('invokes only target listeners for non-bubbling events', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const calls: string[] = [];
			root.addEventListener('click', () => calls.push('root bubble'));
			target.addEventListener('click', () => calls.push('target'));

			target.dispatchEvent(new Event('click'));

			expect(calls).toEqual(['target']);
		});

		it('preserves listeners and dispatches within a detached subtree without rendering', () => {
			const notify = vi.fn();
			const document = new Document(notify);
			const parent = document.createElement('div');
			const target = document.createElement('span');
			parent.appendChild(target);
			document.documentElement.appendChild(parent);
			const calls: string[] = [];
			document.addEventListener('click', () => calls.push('document'));
			parent.addEventListener('click', () => calls.push('parent bubble'));
			target.addEventListener('click', () => calls.push('target'));
			parent.remove();
			notify.mockClear();

			target.dispatchEvent(new Event('click', { bubbles: true }));

			expect(target.isConnected).toBe(false);
			expect(calls).toEqual(['target', 'parent bubble']);
			expect(notify).not.toHaveBeenCalled();
		});

		it('keeps the original ancestor path when a listener reparents the target', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const original = document.createElement('div');
			const destination = document.createElement('div');
			const target = document.createElement('span');
			root.appendChild(original);
			root.appendChild(destination);
			original.appendChild(target);
			const calls: string[] = [];
			target.addEventListener('click', () => {
				calls.push('target');
				destination.appendChild(target);
			});
			original.addEventListener('click', () => calls.push('original bubble'));
			destination.addEventListener('click', () => calls.push('destination bubble'));
			root.addEventListener('click', () => calls.push('root bubble'));

			target.dispatchEvent(new Event('click', { bubbles: true }));

			expect(target.parentNode).toBe(destination);
			expect(calls).toEqual(['target', 'original bubble', 'root bubble']);

			calls.length = 0;
			target.dispatchEvent(new Event('click', { bubbles: true }));
			expect(calls).toEqual(['target', 'destination bubble', 'root bubble']);
		});

		it('skips a removed listener even if the same callback is registered again', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const calls: string[] = [];
			const later = (): number => calls.push('later');
			const replace = (): void => {
				calls.push('replace');
				target.removeEventListener('click', later);
				target.addEventListener('click', later);
			};
			target.addEventListener('click', replace);
			target.addEventListener('click', later);

			target.dispatchEvent(new Event('click'));
			expect(calls).toEqual(['replace']);

			target.removeEventListener('click', replace);
			calls.length = 0;
			target.dispatchEvent(new Event('click'));
			expect(calls).toEqual(['later']);
		});

		it('invokes listeners added to an upcoming ancestor', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const calls: string[] = [];
			const later = (): number => calls.push('later');
			const added = (): void => {
				calls.push('added');
				root.addEventListener('click', later);
			};
			target.addEventListener('click', () => {
				calls.push('target');
				root.addEventListener('click', added);
			});

			target.dispatchEvent(new Event('click', { bubbles: true }));
			expect(calls).toEqual(['target', 'added']);

			calls.length = 0;
			target.dispatchEvent(new Event('click', { bubbles: true }));
			expect(calls).toEqual(['target', 'added', 'later']);
		});

		it('supports nested events, rejects active-event redispatch, and permits later reuse', () => {
			const document = new Document(vi.fn());
			const target = document.createElement('span');
			const outer = new Event('outer');
			const inner = new Event('inner');
			const calls: string[] = [];
			const states: boolean[] = [];
			let redispatchError: unknown;
			let redispatching = false;
			target.addEventListener('inner', (event: Event) => {
				calls.push('inner');
				states.push(event.currentTarget === target && outer.currentTarget === target);
			});
			target.addEventListener('outer', (event: Event) => {
				if (redispatching) {
					calls.push('unexpected redispatch');
					return;
				}
				calls.push('outer start');
				redispatching = true;
				try {
					target.dispatchEvent(event);
				} catch (error) {
					redispatchError = error;
				} finally {
					redispatching = false;
				}
				target.dispatchEvent(inner);
				states.push(event.currentTarget === target && event.eventPhase === Event.AT_TARGET);
				states.push(inner.currentTarget === null && inner.eventPhase === Event.NONE);
				calls.push('outer end');
			});

			target.dispatchEvent(outer);

			expect(redispatchError).toBeInstanceOf(DOMException);
			expect(redispatchError).toMatchObject({ name: 'InvalidStateError' });
			expect(calls).toEqual(['outer start', 'inner', 'outer end']);
			expect(states).toEqual([true, true, true]);
			expect(outer.currentTarget).toBeNull();
			expect(outer.eventPhase).toBe(Event.NONE);

			calls.length = 0;
			states.length = 0;
			redispatchError = undefined;
			target.dispatchEvent(outer);
			expect(redispatchError).toBeInstanceOf(DOMException);
			expect(redispatchError).toMatchObject({ name: 'InvalidStateError' });
			expect(calls).toEqual(['outer start', 'inner', 'outer end']);
			expect(states).toEqual([true, true, true]);
		});
	});

	describe('stopPropagation', () => {
		it('finishes target listeners without bubbling or canceling the event', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const calls: string[] = [];
			target.addEventListener('click', (event: Event) => {
				calls.push('first');
				event.stopPropagation();
			});
			target.addEventListener('click', () => calls.push('second'));
			root.addEventListener('click', () => calls.push('root bubble'));
			const event = new Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(event)).toBe(true);

			expect(calls).toEqual(['first', 'second']);
			expect(event.defaultPrevented).toBe(false);
		});

		it('finishes the current ancestor bubble listeners without visiting further ancestors', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const parent = document.createElement('div');
			const target = document.createElement('span');
			root.appendChild(parent);
			parent.appendChild(target);
			const calls: string[] = [];
			target.addEventListener('click', () => calls.push('target'));
			parent.addEventListener('click', (event: Event) => {
				calls.push('first parent bubble');
				event.stopPropagation();
			});
			parent.addEventListener('click', () => calls.push('second parent bubble'));
			root.addEventListener('click', () => calls.push('root bubble'));
			document.addEventListener('click', () => calls.push('document bubble'));
			const event = new Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(event)).toBe(true);

			expect(calls).toEqual(['target', 'first parent bubble', 'second parent bubble']);
			expect(event.defaultPrevented).toBe(false);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);
		});
	});

	describe('stopImmediatePropagation', () => {
		it('stops remaining ancestor bubble listeners and further ancestors', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const parent = document.createElement('div');
			const target = document.createElement('span');
			root.appendChild(parent);
			parent.appendChild(target);
			const calls: string[] = [];
			target.addEventListener('click', () => calls.push('target'));
			parent.addEventListener('click', (event: Event) => {
				calls.push('first parent bubble');
				event.stopImmediatePropagation();
			});
			parent.addEventListener('click', () => calls.push('second parent bubble'));
			root.addEventListener('click', () => calls.push('root bubble'));
			document.addEventListener('click', () => calls.push('document bubble'));
			const event = new Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(event)).toBe(true);

			expect(calls).toEqual(['target', 'first parent bubble']);
			expect(event.defaultPrevented).toBe(false);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);
		});

		it('stops remaining listeners and ancestors and retains native stop flags on reuse', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const calls: string[] = [];
			const stop = (event: Event): void => {
				calls.push('stop');
				event.stopImmediatePropagation();
			};
			target.addEventListener('click', stop);
			target.addEventListener('click', () => calls.push('target'));
			root.addEventListener('click', () => calls.push('root bubble'));
			const event = new Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(event)).toBe(true);
			expect(calls).toEqual(['stop']);
			expect(event.defaultPrevented).toBe(false);
			expect(event.currentTarget).toBeNull();
			expect(event.eventPhase).toBe(Event.NONE);

			target.removeEventListener('click', stop);
			calls.length = 0;
			expect(target.dispatchEvent(event)).toBe(true);
			expect(calls).toEqual([]);

			target.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
			expect(calls).toEqual(['target', 'root bubble']);
		});
	});

	describe('preventDefault', () => {
		it('cancels only cancelable events without stopping propagation', () => {
			const document = new Document(vi.fn());
			const root = document.documentElement;
			const target = document.createElement('span');
			root.appendChild(target);
			const prevented: boolean[] = [];
			const prevent = (event: Event): void => event.preventDefault();
			target.addEventListener('click', prevent);
			root.addEventListener('click', (event: Event) => prevented.push(event.defaultPrevented));
			const ordinary = new Event('click', { bubbles: true });
			const cancelable = new Event('click', { bubbles: true, cancelable: true });

			expect(target.dispatchEvent(ordinary)).toBe(true);
			expect(ordinary.defaultPrevented).toBe(false);
			expect(target.dispatchEvent(cancelable)).toBe(false);
			expect(cancelable.defaultPrevented).toBe(true);
			expect(prevented).toEqual([false, true]);

			target.removeEventListener('click', prevent);
			expect(target.dispatchEvent(cancelable)).toBe(false);
			expect(cancelable.defaultPrevented).toBe(true);
		});
	});
});
