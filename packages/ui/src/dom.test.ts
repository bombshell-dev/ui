import { afterEach, describe, expect, test, vi } from 'vitest';
import { installDOMGlobals } from './dom.ts';
import { createHost } from './host.ts';
import { installBrowserFacade } from './browser-facade.ts';

const globalNames = [
	'window',
	'document',
	'Element',
	'HTMLElement',
	'Node',
	'PointerEvent',
	'Event',
	'ResizeObserver',
	'requestAnimationFrame',
	'cancelAnimationFrame',
	'getComputedStyle',
] as const;

const releases: (() => void)[] = [];

afterEach(() => {
	for (const release of releases.splice(0).reverse()) release();
	vi.unstubAllGlobals();
});

function install(host = createHost()) {
	const release = installDOMGlobals(host);
	releases.push(release);
	return release;
}

describe('DOM global ownership', () => {
	test('installs the host document and restores every original descriptor', () => {
		const previous = globalNames.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
		const host = createHost();
		const release = install(host);
		const browser = installBrowserFacade(host);
		expect(globalThis.document).toBe(browser.document);
		expect(globalThis.window).toBe(browser.window);
		release();
		for (const [index, name] of globalNames.entries()) {
			expect(Object.getOwnPropertyDescriptor(globalThis, name)).toEqual(previous[index]);
		}
	});

	test('keeps same-host installs alive until every lease is released', () => {
		const host = createHost();
		const first = install(host);
		const second = install(host);
		const document = globalThis.document;
		first();
		first();
		expect(globalThis.document).toBe(document);
		const third = install(host);
		second();
		expect(globalThis.document).toBe(document);
		third();
		expect(globalThis.document).toBeUndefined();
	});

	test('rejects competing hosts even though facade globals are present', () => {
		const host = createHost();
		const first = install(host);
		const second = install(host);
		const competing = createHost();
		expect(() => installDOMGlobals(competing)).toThrow(
			'Only one Host can own the process-global DOM facade at a time',
		);
		first();
		expect(() => installDOMGlobals(competing)).toThrow();
		second();
		const release = install(competing);
		first();
		expect(globalThis.document).toBe(installBrowserFacade(competing).document);
		release();
	});

	test.each(['window', 'document'] as const)(
		'leaves existing browser globals untouched when %s already exists',
		(name) => {
			vi.stubGlobal(name, { browser: true });
			const previous = globalNames.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
			const first = install();
			const second = install();
			first();
			second();
			for (const [index, key] of globalNames.entries()) {
				expect(Object.getOwnPropertyDescriptor(globalThis, key)).toEqual(previous[index]);
			}
		},
	);

	test('restores preexisting accessor globals rather than only their values', () => {
		const original = Object.getOwnPropertyDescriptor(globalThis, 'Event');
		const getter = () => class BrowserEvent {};
		Object.defineProperty(globalThis, 'Event', {
			configurable: true,
			enumerable: true,
			get: getter,
		});
		try {
			const release = install();
			release();
			expect(Object.getOwnPropertyDescriptor(globalThis, 'Event')).toEqual({
				configurable: true,
				enumerable: true,
				get: getter,
				set: undefined,
			});
		} finally {
			if (original) Object.defineProperty(globalThis, 'Event', original);
			else Reflect.deleteProperty(globalThis, 'Event');
		}
	});

	test('exposes element and text node identities plus traversal constants', () => {
		const host = createHost();
		install(host);
		const element = host.createElement('button');
		const text = { type: 'literal', nodeType: 3, content: 'label' };
		expect(element instanceof globalThis.Element).toBe(true);
		expect(element instanceof globalThis.HTMLElement).toBe(true);
		expect(element instanceof globalThis.Node).toBe(true);
		expect(text instanceof globalThis.Element).toBe(false);
		expect(text instanceof globalThis.Node).toBe(true);
		expect(globalThis.Node.ELEMENT_NODE).toBe(1);
		expect(globalThis.Node.TEXT_NODE).toBe(3);
		expect(globalThis.Node.DOCUMENT_POSITION_DISCONNECTED).toBe(1);
		expect(globalThis.Node.DOCUMENT_POSITION_PRECEDING).toBe(2);
		expect(globalThis.Node.DOCUMENT_POSITION_FOLLOWING).toBe(4);
		expect(globalThis.Node.DOCUMENT_POSITION_CONTAINS).toBe(8);
		expect(globalThis.Node.DOCUMENT_POSITION_CONTAINED_BY).toBe(16);
	});
});
