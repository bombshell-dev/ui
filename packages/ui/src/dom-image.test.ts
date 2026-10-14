import { afterEach, expect, test, vi } from 'vitest';
import { installDOMGlobals } from './dom.ts';
import { HostDOMEvent, type BrowserElement } from './browser-types.ts';
import { installBrowserFacade } from './browser-facade.ts';
import { createHost } from './host.ts';

type ImageElement = BrowserElement & {
	src: string;
	srcset: string;
	sizes: string;
	crossOrigin: string | null;
	referrerPolicy: string;
	complete: boolean;
	naturalWidth: number;
	onload: ((event: HostDOMEvent) => void) | null;
	onerror: ((event: HostDOMEvent) => void) | null;
	addEventListener(type: string, listener: (event: HostDOMEvent) => void): void;
	removeEventListener(type: string, listener: (event: HostDOMEvent) => void): void;
};

let restore: (() => void) | undefined;
afterEach(() => {
	restore?.();
	restore = undefined;
});

test('Host Image rejects unsupported image requests without claiming decoded pixels', async () => {
	const host = createHost();
	restore = installDOMGlobals(host);
	const { document } = installBrowserFacade(host);
	const Image = Reflect.get(document.defaultView, 'Image') as new (
		width?: number,
		height?: number,
	) => ImageElement;
	const image = new Image(10, 20);
	const onload = vi.fn();
	const onerror = vi.fn();
	const listener = vi.fn();
	image.onload = onload;
	image.onerror = onerror;
	image.addEventListener('error', listener);
	image.crossOrigin = 'anonymous';
	image.referrerPolicy = 'no-referrer';
	image.sizes = '10px';
	image.srcset = '/avatar-2x.png 2x';
	image.src = '/avatar.png';

	expect(image.name).toBe('img');
	expect(image.ownerDocument).toBe(document);
	expect(image.isConnected).toBe(false);
	expect(image.properties).toMatchObject({
		width: 10,
		height: 20,
		crossOrigin: 'anonymous',
		referrerPolicy: 'no-referrer',
		sizes: '10px',
		srcset: '/avatar-2x.png 2x',
		src: '/avatar.png',
	});
	expect(image.complete).toBe(false);
	await Promise.resolve();
	expect(image.complete).toBe(true);
	expect(image.naturalWidth).toBe(0);
	expect(onload).not.toHaveBeenCalled();
	expect(onerror).toHaveBeenCalledTimes(1);
	expect(listener).toHaveBeenCalledTimes(1);
	expect(listener.mock.calls[0]?.[0]).toMatchObject({ type: 'error', target: image });

	image.removeEventListener('error', listener);
	image.dispatchEvent(new HostDOMEvent('error'));
	expect(listener).toHaveBeenCalledTimes(1);
	expect(onerror).toHaveBeenCalledTimes(2);
});
