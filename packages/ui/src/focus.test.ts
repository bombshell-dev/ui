import { lifecycle, LifecycleApi, type Node } from './core.ts';
import { describe, expect, test } from 'vitest';
import { FocusApi } from './focus.ts';
import { createHost as createHostWithoutFocus, type Host } from './host.ts';
import type { HostElement } from './elements.ts';

describe('focus', () => {
	describe('focusability', () => {
		test('skips destroyed physical siblings while replacing focus', () => {
			const host = createHost();
			const first = focusableElement(host);
			const destroyed = focusableElement(host);
			const last = focusableElement(host);
			host.element.append(first, destroyed, last);
			LifecycleApi.at(destroyed.node!).destroy(destroyed.node!);
			first.remove();
			expect(getFocus(host.root)).toBe(last.node);
			expect(first.node).toBeNull();
			destroy(host.root);
		});
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
		test('updates current before callbacks and preserves blur-before-focus order', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);
			host.element.append(first, second);
			const calls: string[] = [];
			first.blurredCallback = (node) => {
				expect(node).toBe(first.node);
				expect(getFocus(host.root)).toBe(second.node);
				expect(FocusApi.at(host.root).current).toBe(second.node);
				calls.push('first blur');
				setFocus(second.node!);
			};
			second.focusedCallback = (node) => {
				expect(node).toBe(second.node);
				expect(getFocus(host.root)).toBe(second.node);
				calls.push('second focus');
			};

			setFocus(second.node!);
			setFocus(second.node!);

			expect(calls).toEqual(['first blur', 'second focus']);
			first.blurredCallback = undefined;
			second.focusedCallback = undefined;
			destroy(host.root);
		});

		test('notifies the requested target only once after a blur redirect away and back', () => {
			const host = createHost();
			const first = focusableElement(host);
			const second = focusableElement(host);
			const third = focusableElement(host);
			host.element.append(first, second, third);
			const calls: string[] = [];
			first.blurredCallback = () => {
				expect(getFocus(host.root)).toBe(second.node);
				calls.push('first blur');
				setFocus(third.node!);
				setFocus(second.node!);
			};
			second.blurredCallback = () => {
				expect(getFocus(host.root)).toBe(third.node);
				calls.push('second blur');
			};
			third.focusedCallback = () => {
				expect(getFocus(host.root)).toBe(third.node);
				calls.push('third focus');
			};
			third.blurredCallback = () => {
				expect(getFocus(host.root)).toBe(second.node);
				calls.push('third blur');
			};
			second.focusedCallback = () => {
				expect(getFocus(host.root)).toBe(second.node);
				calls.push('second focus');
			};

			setFocus(second.node!);

			expect(getFocus(host.root)).toBe(second.node);
			expect(calls).toEqual([
				'first blur',
				'second blur',
				'third focus',
				'third blur',
				'second focus',
			]);
			second.blurredCallback = undefined;
			destroy(host.root);
		});

		test.each(['blur', 'focus'] as const)(
			'preserves redirects to a third node from a %s callback',
			(callback) => {
				const host = createHost();
				const first = focusableElement(host);
				const second = focusableElement(host);
				const third = focusableElement(host);
				host.element.append(first, second, third);
				const calls: string[] = [];
				first.blurredCallback = () => {
					expect(getFocus(host.root)).toBe(second.node);
					calls.push('first blur');
					if (callback === 'blur') setFocus(third.node!);
				};
				second.focusedCallback = () => {
					expect(getFocus(host.root)).toBe(second.node);
					calls.push('second focus');
					if (callback === 'focus') setFocus(third.node!);
				};
				second.blurredCallback = () => {
					expect(getFocus(host.root)).toBe(third.node);
					calls.push('second blur');
				};
				third.focusedCallback = () => {
					expect(getFocus(host.root)).toBe(third.node);
					calls.push('third focus');
				};

				setFocus(second.node!);

				expect(getFocus(host.root)).toBe(third.node);
				expect(calls).toEqual(
					callback === 'blur'
						? ['first blur', 'second blur', 'third focus']
						: ['first blur', 'second focus', 'second blur', 'third focus'],
				);
				destroy(host.root);
			},
		);

		test.each(['remove', 'disable', 'destroy'] as const)(
			'does not notify a target invalidated by %s during blur',
			(action) => {
				const host = createHost();
				const first = focusableElement(host);
				const second = focusableElement(host);
				const third = focusableElement(host);
				host.element.append(first, second, third);
				const target = second.node!;
				const calls: string[] = [];
				first.blurredCallback = () => {
					expect(getFocus(host.root)).toBe(target);
					calls.push('first blur');
					if (action === 'remove') second.remove();
					else if (action === 'disable') FocusApi.at(target).setFocusable(false);
					else LifecycleApi.at(target).destroy(target);
				};
				second.focusedCallback = () => calls.push('second focus');
				second.blurredCallback = () => {
					expect(getFocus(host.root)).not.toBe(target);
					calls.push('second blur');
				};
				third.focusedCallback = () => {
					expect(getFocus(host.root)).toBe(third.node);
					calls.push('third focus');
				};

				expect(() => setFocus(target)).not.toThrow();

				expect(getFocus(host.root)).toBe(action === 'remove' ? third.node : host.root);
				expect(calls).toEqual(
					action === 'remove'
						? ['first blur', 'second blur', 'third focus']
						: ['first blur', 'second blur'],
				);
				if (action !== 'disable') expect(second.node).toBeNull();
				destroy(host.root);
			},
		);

		test.each(['blur', 'focus'] as const)(
			'keeps selected state truthful when a %s callback throws',
			(callback) => {
				const host = createHost();
				const first = focusableElement(host);
				const second = focusableElement(host);
				host.element.append(first, second);
				const error = new Error('callback failed');
				const calls: string[] = [];
				first.blurredCallback = () => {
					expect(getFocus(host.root)).toBe(second.node);
					calls.push('first blur');
					if (callback === 'blur') throw error;
				};
				second.focusedCallback = () => {
					expect(getFocus(host.root)).toBe(second.node);
					calls.push('second focus');
					throw error;
				};

				expect(() => setFocus(second.node!)).toThrow(error);

				expect(getFocus(host.root)).toBe(second.node);
				expect(calls).toEqual(
					callback === 'blur' ? ['first blur'] : ['first blur', 'second focus'],
				);
				destroy(host.root);
			},
		);

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
		test('allows removal from disconnected portal containers', () => {
			const host = createHost();
			const parent = host.createElement('box');
			const child = focusableElement(host);
			host.insertBefore(parent, child);

			expect(() => host.removeChild(parent, child)).not.toThrow();
			expect(parent.childNodes).toEqual([]);
			expect(child.parent).toBeNull();
			expect(getFocus(host.root)).toBe(host.root);
			destroy(host.root);
		});

		test('allows removal of a destroyed element from a connected parent', () => {
			const host = createHost();
			const child = focusableElement(host);
			host.insertBefore(host.element, child);
			LifecycleApi.at(child.node!).destroy(child.node!);

			expect(() => host.removeChild(host.element, child)).not.toThrow();
			expect(host.element.childNodes).toEqual([]);
			expect(child.parent).toBeNull();
			destroy(host.root);
		});

		test('clears focus on direct lifecycle destruction', () => {
			const host = createHost();
			const input = focusableElement(host);
			host.insertBefore(host.element, input);

			LifecycleApi.at(input.node!).destroy(input.node!);

			expect(getFocus(host.root)).toBe(host.root);
			expect(input.node).toBeNull();
			destroy(host.root);
		});

		test('does not steal focus when a non-focused element moves', () => {
			const host = createHost();
			const destination = host.createElement('box');
			const first = focusableElement(host);
			const second = focusableElement(host);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);
			host.insertBefore(host.element, destination);

			host.insertBefore(destination, second);

			expect(getFocus(host.root)).toBe(first.node);
			destroy(host.root);
		});

		test('does not retain a destroyed focused node after a cross-parent move', () => {
			const host = createHost();
			const first = host.createElement('box');
			const second = host.createElement('box');
			const input = focusableElement(host);
			host.insertBefore(first, input);
			host.insertBefore(host.element, first);
			host.insertBefore(host.element, second);
			const previous = input.node;

			host.insertBefore(second, input);

			expect(input.node).not.toBe(previous);
			expect(getFocus(host.root)).toBe(input.node);
			advanceFocus(host.root);
			retreatFocus(host.root);
			expect(getFocus(host.root)).toBe(input.node);
			destroy(host.root);
		});

		test('clears focus when a focused descendant is destroyed during a subtree move', () => {
			const host = createHost();
			const parent = host.createElement('box');
			const destination = host.createElement('box');
			const input = focusableElement(host);
			host.insertBefore(parent, input);
			host.insertBefore(host.element, parent);
			host.insertBefore(host.element, destination);
			const previous = input.node;

			host.insertBefore(destination, parent);

			expect(input.node).not.toBe(previous);
			expect(getFocus(host.root)).toBe(input.node);
			destroy(host.root);
		});

		test('restores the exact second focused input after moving its subtree', () => {
			const host = createHost();
			const parent = host.createElement('box');
			const destination = host.createElement('box');
			const first = focusableElement(host);
			const second = focusableElement(host);
			host.insertBefore(parent, first);
			host.insertBefore(parent, second);
			host.insertBefore(host.element, parent);
			host.insertBefore(host.element, destination);
			setFocus(second.node!);
			const previousFirst = first.node;
			const previousSecond = second.node;

			host.insertBefore(destination, parent);

			expect(first.node).not.toBe(previousFirst);
			expect(second.node).not.toBe(previousSecond);
			expect(getFocus(host.root)).toBe(second.node);
			expect(getFocus(host.root)).not.toBe(first.node);
			advanceFocus(host.root);
			expect(getFocus(host.root)).toBe(first.node);
			retreatFocus(host.root);
			expect(getFocus(host.root)).toBe(second.node);
			destroy(host.root);
		});

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
	FocusApi.init(host.root);
	return host;
}

function focusableElement(host: Host): HostElement {
	const element = host.createElement('input');
	element.attach = (node) => setFocusable(node);
	return element;
}

function advanceFocus(node: Node): void {
	FocusApi.at(node).advanceFocus();
}

function getFocus(node: Node): Node {
	return FocusApi.at(node).getFocus();
}

function retreatFocus(node: Node): void {
	FocusApi.at(node).retreatFocus();
}

function setFocus(node: Node): void {
	FocusApi.at(node).setFocus(node);
}

function setFocusable(node: Node): void {
	FocusApi.at(node).setFocusable();
}

function destroy(node: Node): void {
	lifecycle.destroy(node);
}
