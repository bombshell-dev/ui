import { destroy, type Node } from '@bomb.sh/tree';
import { describe, expect, test } from 'vitest';
import { FocusApi, useFocus } from './focus.ts';
import { createHost as createHostWithoutFocus, type Host } from './host.ts';
import type { HostElement } from './elements.ts';

const { advanceFocus, getFocus, retreatFocus, setFocus, setFocusable } = FocusApi.methods;

describe('focus', () => {
	describe('focusability', () => {
		test('uses the host root when no element has focus', () => {
			const host = createHost();

			expect(getFocus(host.root)).toBe(host.root);
			destroy(host.root);
		});

		test('focuses the first focusable element connected to an empty host', () => {
			const host = createHost();
			const input = focusableElement(host);

			host.insertBefore(host.element, input);

			expect(input.node).not.toBeNull();
			expect(getFocus(host.root)).toBe(input.node);
			destroy(host.root);
		});

		test('does not replace the focus when another focusable element is connected', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);

			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);

			expect(getFocus(host.root)).toBe(first.node);
			destroy(host.root);
		});

		test('does not inherit focusability from an ancestor', () => {
			const host = createHost();
			const parent = focusableElement(host);
			const child = host.createElement('box');
			const sibling = focusableElement(host);
			host.insertBefore(parent, child);
			host.insertBefore(host.element, parent);
			host.insertBefore(host.element, sibling);

			advanceFocus(host.root);

			expect(getFocus(host.root)).toBe(sibling.node);
			expect(getFocus(host.root)).not.toBe(child.node);
			destroy(host.root);
		});
	});

	describe('advanceFocus', () => {
		test('moves focus forward in depth-first element order', () => {
			const host = createHost();
			const first = focusableElement(host);
			const container = host.createElement('box');
			const nested = focusableElement(host);
			const last = focusableElement(host);
			host.insertBefore(container, nested);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, container);
			host.insertBefore(host.element, last);

			const visited: Node[] = [];
			for (let index = 0; index < 4; index++) {
				visited.push(getFocus(host.root));
				advanceFocus(host.root);
			}

			expect(visited).toEqual([first.node, nested.node, last.node, first.node]);
			destroy(host.root);
		});

		test('does nothing when there is only one focusable element', () => {
			const host = createHost();
			const input = focusableElement(host);
			host.insertBefore(host.element, input);

			advanceFocus(host.root);

			expect(getFocus(host.root)).toBe(input.node);
			destroy(host.root);
		});

		test('uses current host order after a child moves', () => {
			const host = createHost();
			const parent = host.createElement('box');
			const first = focusableElement(host);
			const second = focusableElement(host);
			const third = focusableElement(host);
			host.insertBefore(parent, first);
			host.insertBefore(parent, second);
			host.insertBefore(parent, third);
			host.insertBefore(host.element, parent);

			host.insertBefore(parent, third, second);
			setFocus(first.node!);
			advanceFocus(host.root);

			expect(getFocus(host.root)).toBe(third.node);
			destroy(host.root);
		});
	});

	describe('retreatFocus', () => {
		test('moves focus backward and wraps', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);
			const last = focusableElement(host);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);
			host.insertBefore(host.element, last);

			retreatFocus(host.root);
			expect(getFocus(host.root)).toBe(last.node);
			retreatFocus(host.root);
			expect(getFocus(host.root)).toBe(second.node);
			destroy(host.root);
		});

		test('does nothing when there is only one focusable element', () => {
			const host = createHost();
			const input = focusableElement(host);
			host.insertBefore(host.element, input);

			retreatFocus(host.root);

			expect(getFocus(host.root)).toBe(input.node);
			destroy(host.root);
		});
	});

	describe('setFocus', () => {
		test('focuses an explicit focusable element', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);

			setFocus(second.node!);

			expect(getFocus(host.root)).toBe(second.node);
			destroy(host.root);
		});

		test('rejects a non-focusable element', () => {
			const host = createHost();
			const element = host.createElement('box');
			host.insertBefore(host.element, element);

			expect(() => setFocus(element.node!)).toThrow(TypeError);
			destroy(host.root);
		});
	});

	describe('lifecycle', () => {
		test('advances focus before the focused element is detached', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);

			host.removeChild(host.element, first);

			expect(getFocus(host.root)).toBe(second.node);
			destroy(host.root);
		});

		test('uses the host root after the only focusable element is detached', () => {
			const host = createHost();
			const input = focusableElement(host);
			host.insertBefore(host.element, input);

			host.removeChild(host.element, input);

			expect(getFocus(host.root)).toBe(host.root);
			destroy(host.root);
		});

		test('does not move focus when a non-focused element is detached', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);

			host.removeChild(host.element, second);

			expect(getFocus(host.root)).toBe(first.node);
			destroy(host.root);
		});

		test('moves focus outside a subtree before the subtree is detached', () => {
			const host = createHost();
			const parent = host.createElement('box');
			const nested = focusableElement(host);
			const sibling = focusableElement(host);
			host.insertBefore(parent, nested);
			host.insertBefore(host.element, parent);
			host.insertBefore(host.element, sibling);

			host.removeChild(host.element, parent);

			expect(getFocus(host.root)).toBe(sibling.node);
			destroy(host.root);
		});
	});

	test('keeps focus isolated between hosts', () => {
		const firstHost = createHost();
		const first = focusableElement(firstHost);
		firstHost.insertBefore(firstHost.element, first);
		const secondHost = createHost();
		const second = focusableElement(secondHost);
		secondHost.insertBefore(secondHost.element, second);

		expect(getFocus(firstHost.root)).toBe(first.node);
		expect(getFocus(secondHost.root)).toBe(second.node);

		destroy(firstHost.root);
		destroy(secondHost.root);
	});
});

function createHost(): Host {
	const host = createHostWithoutFocus();
	useFocus(host);
	return host;
}

function focusableElement(host: Host): HostElement {
	const element = host.createElement('input');
	element.attach = (node) => setFocusable(node);
	return element;
}
