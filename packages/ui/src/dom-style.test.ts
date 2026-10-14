import { afterEach, expect, test } from 'vitest';
import { installDOMGlobals } from './dom.ts';
import { createHost } from './host.ts';
import { installBrowserFacade } from './browser-facade.ts';

let restore: (() => void) | undefined;
afterEach(() => {
	restore?.();
	restore = undefined;
});

test('computed style preserves CSS custom properties and delegates inline property lookup', () => {
	const host = createHost();
	restore = installDOMGlobals(host);
	const element = installBrowserFacade(host).document.createElement('div');
	element.style.setProperty('--popup-width', '12px');
	element.style.setProperty('margin-left', '3px');
	const computed = element.ownerDocument.defaultView.getComputedStyle(element);
	const getPropertyValue = computed.getPropertyValue as (name: string) => string;

	expect(getPropertyValue('--popup-width')).toBe('12px');
	expect(getPropertyValue('margin-left')).toBe('3px');
	expect(computed.marginLeft).toBe('3px');
	expect(getPropertyValue('--missing')).toBe('');
	element.style.removeProperty('--popup-width');
	expect(getPropertyValue('--popup-width')).toBe('');
});

test('computed style supplies usable defaults when the inline style bridge returns empty strings', () => {
	const host = createHost();
	restore = installDOMGlobals(host);
	const element = installBrowserFacade(host).document.createElement('div');
	const computed = element.ownerDocument.defaultView.getComputedStyle(element);
	const getPropertyValue = computed.getPropertyValue as (name: string) => string;

	expect(computed).toMatchObject({
		display: 'block',
		position: 'static',
		visibility: 'visible',
		overflow: 'visible',
		overflowX: 'visible',
		overflowY: 'visible',
		direction: 'ltr',
		animationName: 'none',
		animationDuration: '0s',
		transitionDuration: '0s',
	});
	for (const property of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']) {
		expect(Number.parseFloat(computed[property] as string)).toBe(0);
	}
	expect(getPropertyValue('margin-left')).toBe('0px');
	element.style.display = 'none';
	element.style.position = 'fixed';
	element.style.overflowY = 'hidden';
	expect(computed.display).toBe('none');
	expect(computed.position).toBe('fixed');
	expect(getPropertyValue('overflow-y')).toBe('hidden');
	element.style.removeProperty('display');
	expect(computed.display).toBe('block');
});
