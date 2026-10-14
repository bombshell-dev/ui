import { createElement } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import {
	createHost,
	HostApi,
	EventApi,
	HostDOMEvent,
	installBrowserCompat,
	type HostElement,
	type BrowserElement,
} from '@clack/ui';
import { createRoot } from './root.ts';

const restoreBootstrapGlobals = installBrowserCompat(createHost());
const { Slider } = await import('@base-ui/react/slider').finally(restoreBootstrapGlobals);

let cleanup: (() => void) | undefined;

afterEach(() => {
	cleanup?.();
	cleanup = undefined;
});

test('Base UI Slider drags, commits, and releases capture through native pointer events', () => {
	const host = createHost();
	cleanup = installBrowserCompat(host);
	const browserRoot = host.element as BrowserElement;
	expect(Reflect.get(globalThis, 'document')).toBe(browserRoot.ownerDocument);
	expect(Reflect.get(globalThis, 'window')).toBe(browserRoot.ownerDocument.defaultView);
	const onValueChange = vi.fn();
	const onValueCommitted = vi.fn();
	const errors: unknown[] = [];
	const root = createRoot(host.element, { onError: (error) => errors.push(error) });
	cleanup = chainCleanup(cleanup, () => root.unmount());

	root.render(
		createElement(
			Slider.Root,
			{ defaultValue: 50, onValueChange, onValueCommitted },
			createElement(
				Slider.Control,
				null,
				createElement(Slider.Track, null, createElement(Slider.Indicator)),
				createElement(Slider.Thumb),
			),
		),
	);
	HostApi.at(host.root).setRenderInfo({
		get: () => ({ bounds: { x: 0, y: 0, width: 20, height: 3 } }),
	});
	const control = findPointerControl(host.element, host);
	if (!control?.node) throw new Error('Base UI Slider did not render a pointer control');

	control.dispatchEvent(
		new HostDOMEvent('pointerdown', {
			bubbles: true,
			cancelable: true,
			button: 0,
			buttons: 1,
			clientX: 18,
			clientY: 0,
			pointerId: 1,
			pointerType: 'mouse',
		}),
	);

	expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(90);
	expect(control.hasPointerCapture(1)).toBe(true);
	expect(onValueCommitted).not.toHaveBeenCalled();

	const move = new HostDOMEvent('pointermove', {
		bubbles: true,
		cancelable: true,
		buttons: 1,
		clientX: 6,
		clientY: 0,
		pointerId: 1,
		pointerType: 'mouse',
	});
	// Native element events must reach Base UI's ownerDocument drag listeners.
	control.dispatchEvent(move);
	expect(onValueChange.mock.calls.at(-1)?.[0]).toBe(30);
	// Slider clones change events to expose a form-compatible target.value.
	expect(onValueChange.mock.calls.at(-1)?.[1].event).toMatchObject({
		type: 'pointermove',
		pointerId: 1,
		clientX: 6,
		target: { value: 30 },
	});
	expect(onValueCommitted).not.toHaveBeenCalled();

	const up = new HostDOMEvent('pointerup', {
		bubbles: true,
		cancelable: true,
		button: 0,
		buttons: 0,
		clientX: 6,
		clientY: 0,
		pointerId: 1,
		pointerType: 'mouse',
	});
	control.dispatchEvent(up);
	expect(onValueCommitted).toHaveBeenCalledExactlyOnceWith(
		30,
		expect.objectContaining({ event: up }),
	);
	expect(control.hasPointerCapture(1)).toBe(false);
	expect(errors).toEqual([]);

	const changesAfterRelease = onValueChange.mock.calls.length;
	control.dispatchEvent(move);
	control.dispatchEvent(up);
	expect(onValueChange).toHaveBeenCalledTimes(changesAfterRelease);
	expect(onValueCommitted).toHaveBeenCalledTimes(1);
});

function findPointerControl(
	root: HostElement,
	host: ReturnType<typeof createHost>,
): BrowserElement | undefined {
	if (
		root.properties['data-index'] === undefined &&
		EventApi.at(host.root).hasEventListener(root, 'pointerDown')
	) {
		return root as BrowserElement;
	}
	for (const child of root.children) {
		if (child.type !== 'element') continue;
		const match = findPointerControl(child, host);
		if (match) return match;
	}
	return undefined;
}

function chainCleanup(first: () => void, second: () => void): () => void {
	return () => {
		try {
			second();
		} finally {
			first();
		}
	};
}
