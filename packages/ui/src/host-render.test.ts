import { type Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { useHostRenderer } from './host-render.ts';
import { createHost, type Host } from './host.ts';
import { RenderApi } from './render.ts';

describe('host renderer', () => {
	test('does not request a render while building a detached subtree', () => {
		const { host, requests } = setup();
		const box = host.createElement('box');
		const text = host.createElement('text');
		const literal = host.createLiteral('before');

		host.insertBefore(text, literal);
		host.insertBefore(box, text);
		host.setProperty(text, 'color', 1);
		host.setText(literal, 'after');
		host.removeChild(box, text);

		expectRequests(requests);
	});

	test('requests a render when a subtree is attached', () => {
		const { host, requests } = setup();
		const parent = host.createElement('box');
		const child = host.createElement('text');

		host.insertBefore(parent, child);
		host.insertBefore(host.element, parent);

		expectRequests(requests, host.root);
	});

	test('requests a render when an attached property is set or removed', () => {
		const { host, requests } = setup();
		const element = host.createElement('box');
		host.insertBefore(host.element, element);
		requests.length = 0;
		const node = element.node!;

		host.setProperty(element, 'color', 1);
		host.setProperty(element, 'color', undefined);

		expectRequests(requests, node, node);
	});

	test('requests a render when attached text changes', () => {
		const { host, requests } = setup();
		const text = host.createElement('text');
		const literal = host.createLiteral('before');
		host.insertBefore(text, literal);
		host.insertBefore(host.element, text);
		requests.length = 0;
		const node = text.node!;

		host.setText(literal, 'after');

		expectRequests(requests, node);
	});

	test('requests a render when a child is removed from an attached parent', () => {
		const { host, requests } = setup();
		const parent = host.createElement('box');
		const child = host.createElement('text');
		host.insertBefore(parent, child);
		host.insertBefore(host.element, parent);
		requests.length = 0;
		const node = parent.node!;

		host.removeChild(parent, child);

		expectRequests(requests, node);
	});

	test('requests a render when a child moves within an attached parent', () => {
		const { host, requests } = setup();
		const parent = host.createElement('box');
		const first = host.createElement('text');
		const second = host.createElement('text');
		host.insertBefore(parent, first);
		host.insertBefore(parent, second);
		host.insertBefore(host.element, parent);
		requests.length = 0;
		const node = parent.node!;

		host.insertBefore(parent, second, first);

		expectRequests(requests, node);
	});

	test('requests a render from the old parent when moving into a detached parent', () => {
		const { host, requests } = setup();
		const attached = host.createElement('box');
		const detached = host.createElement('box');
		const child = host.createElement('text');
		host.insertBefore(attached, child);
		host.insertBefore(host.element, attached);
		requests.length = 0;
		const node = attached.node!;

		host.insertBefore(detached, child);

		expectRequests(requests, node);
	});

	test('requests a render from both parents when moving between attached parents', () => {
		const { host, requests } = setup();
		const first = host.createElement('box');
		const second = host.createElement('box');
		const child = host.createElement('text');
		host.insertBefore(first, child);
		host.insertBefore(host.element, first);
		host.insertBefore(host.element, second);
		requests.length = 0;
		const firstNode = first.node!;
		const secondNode = second.node!;

		host.insertBefore(second, child);

		expect(requests).toHaveLength(2);
		expect(requests).toContain(firstNode);
		expect(requests).toContain(secondNode);
	});
});

function setup(): { host: Host; requests: Node[] } {
	const host = createHost();
	const requests: Node[] = [];

	const controller = new AbortController();
	RenderApi.init(host.root, controller.signal);
	useHostRenderer(host);
	RenderApi.decorate(host.root, () => ({
		request() {
			requests.push(this.node);
		},
	}));

	return { host, requests };
}

function expectRequests(actual: Node[], ...expected: Node[]): void {
	expect(actual).toHaveLength(expected.length);
	for (const [index, node] of expected.entries()) {
		expect(actual[index]).toBe(node);
	}
}
