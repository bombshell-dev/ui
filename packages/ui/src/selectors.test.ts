import { describe, expect, test } from 'vitest';
import type { BrowserElement, BrowserLiteral } from './browser-types.ts';
import { compareDocumentPosition, matchesSelector, queryElements } from './selectors.ts';

// oxlint-disable-next-line bombshell-dev/max-params -- Selector fixtures use tag, properties, and child nodes.
function element(
	name: string,
	properties: Record<string, unknown> = {},
	...children: BrowserElement[]
): BrowserElement {
	const result = {
		name,
		tagName: name.toUpperCase(),
		properties,
		parent: null,
		get parentElement(): BrowserElement | null {
			return result.parent;
		},
		children,
		childNodes: [...children],
		get disabled() {
			return Boolean(properties.disabled);
		},
		getAttribute(attribute: string) {
			const value = properties[attribute];
			return value === undefined ? null : String(value ?? '');
		},
	} as unknown as BrowserElement;
	for (const child of children) child.parent = result;
	return result;
}

describe('selector matching', () => {
	test('matches Base UI tabbable candidates without treating text as elements', () => {
		const button = element('button');
		const link = element('a', { href: '/home' });
		const editable = element('div', { contenteditable: 'true' });
		const notEditable = element('div', { contenteditable: 'false' });
		const tabstop = element('div', { tabIndex: 0 });
		const audio = element('audio', { controls: '' });
		const plain = element('span');
		const root = element('div', {}, button, link, editable, notEditable, tabstop, audio, plain);
		root.childNodes.unshift({ type: 'literal', nodeType: 3, content: 'text' } as BrowserLiteral);
		const selector =
			'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
		expect(queryElements(root, selector)).toEqual([button, link, editable, tabstop, audio]);
	});

	test('matches Base UI typeable and focus-manager exclusions', () => {
		const input = element('input');
		const hidden = element('input', { type: 'hidden' });
		const disabled = element('textarea', { disabled: true });
		const textarea = element('textarea');
		const editable = element('div', { contenteditable: '' });
		const root = element('div', {}, input, hidden, disabled, textarea, editable);
		expect(
			queryElements(
				root,
				"input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])",
			),
		).toEqual([input, textarea, editable]);
		expect(
			matchesSelector(element('div', { tabIndex: -1 }), '[tabindex]:not([tabindex="-1"])'),
		).toBe(false);
		expect(
			matchesSelector(element('div', { 'data-base-ui-portal': '' }), '[data-base-ui-portal]'),
		).toBe(true);
	});

	test.each([
		['button', true],
		['BUTTON', true],
		['*', true],
		['#save.primary', true],
		['button.primary.secondary', true],
		['.prim', false],
		['#other', false],
		['input', false],
		['[data-label]', true],
		['[missing]', false],
		['[data-label="hello world"]', true],
		['[data-label^="hello"]', true],
		['[data-label$="world"]', true],
		['[data-label*="lo wo"]', true],
		['[data-label~="world"]', true],
		['[data-label~="lo"]', false],
		['[data-label~="hello world"]', false],
		['[lang|="en"]', true],
		['[lang|="e"]', false],
		['[data-label^=""]', false],
		['[data-label$=""]', false],
		['[data-label*=""]', false],
		[':not(input, textarea)', true],
		[':not(button, textarea)', false],
		[':not(:not(button))', true],
		[':scope', true],
	] as const)('matches %s as %s', (selector, expected) => {
		const button = element('button', {
			id: 'save',
			className: 'primary secondary',
			'data-label': 'hello world',
			lang: 'en-US',
		});
		expect(matchesSelector(button, selector)).toBe(expected);
	});

	test('does not split commas or combinators in quoted attributes and nested negations', () => {
		const node = element('div', { 'data-value': 'a, b > (c)', 'data-other': 'x)y' });
		expect(matchesSelector(node, '[data-value="a, b > (c)"], input')).toBe(true);
		expect(matchesSelector(node, ':not([data-other="x)y"], :not(div))')).toBe(false);
	});

	test.each([
		'',
		'button:hover',
		'button:focus-visible',
		':not(:unknown)',
		':nth-child(1)',
		'button + input',
		'button ~ input',
		'[value!=x]',
		'[value=x i]',
		'button[',
		'button,',
		',button',
		'button > > input',
		':not()',
		'button::before',
		'button:not(input',
		'button\\.escaped',
		'button, :unknown',
	])('rejects unsupported or malformed selector %s', (selector) => {
		expect(matchesSelector(element('button'), selector)).toBe(false);
		expect(queryElements(element('div', {}, element('button')), selector)).toEqual([]);
	});

	test('limits enabled/disabled to form controls and handles disabled ancestors', () => {
		expect(matchesSelector(element('button'), ':enabled')).toBe(true);
		expect(matchesSelector(element('button', { disabled: true }), ':disabled')).toBe(true);
		expect(matchesSelector(element('div', { disabled: true }), ':disabled, :enabled')).toBe(false);
		const exempt = element('input');
		const input = element('input');
		const secondLegendInput = element('input');
		element(
			'fieldset',
			{ disabled: true },
			element('legend', {}, exempt),
			input,
			element('legend', {}, secondLegendInput),
		);
		expect(matchesSelector(exempt, ':enabled')).toBe(true);
		expect(matchesSelector(input, ':disabled')).toBe(true);
		expect(matchesSelector(secondLegendInput, ':disabled')).toBe(true);
		const option = element('option');
		element('optgroup', { disabled: true }, option);
		expect(matchesSelector(option, ':disabled')).toBe(true);
	});
});

describe('physical element queries', () => {
	test('excludes self, deduplicates lists, and preserves depth-first document order', () => {
		const nested = element('button', { id: 'nested' });
		const wrapper = element('div', {}, nested);
		const sibling = element('button');
		const root = element('button', {}, wrapper, sibling);
		root.childrenContainer = wrapper;
		expect(queryElements(root, 'button, #nested')).toEqual([nested, sibling]);
		expect(queryElements(root, '*')).toEqual([wrapper, nested, sibling]);
		expect(queryElements(root, ':scope')).toEqual([]);
	});

	test('supports descendant and child combinators and query-root scope', () => {
		const nested = element('button', { className: 'action' });
		const wrapper = element('section', {}, nested);
		const direct = element('button');
		const root = element('div', {}, wrapper, direct);
		expect(queryElements(root, ':scope > button')).toEqual([direct]);
		expect(queryElements(root, ':scope button')).toEqual([nested, direct]);
		expect(queryElements(root, 'div > section > button.action')).toEqual([nested]);
		expect(queryElements(root, ' div  >  section   button ')).toEqual([nested]);
		expect(matchesSelector(nested, 'div > button')).toBe(false);
		expect(matchesSelector(nested, 'div button:not(section > input)')).toBe(true);
	});

	test('first-child counts elements, not literals', () => {
		const first = element('button');
		const second = element('button');
		const root = element('div', {}, first, second);
		root.childNodes.unshift({
			type: 'literal',
			nodeType: 3,
			content: 'before',
		} as BrowserLiteral);
		expect(queryElements(root, ':scope > :first-child')).toEqual([first]);
		expect(matchesSelector(second, ':first-child')).toBe(false);
		expect(matchesSelector(element('button'), ':first-child')).toBe(true);
	});

	test('backtracks descendant ancestors when a nearer match fails a child combinator', () => {
		const button = element('button');
		const root = element('section', {}, element('div', {}, element('div', {}, button)));
		expect(queryElements(root, 'section > div button')).toEqual([button]);
	});
});

describe('document position', () => {
	test('reports equality and disconnected physical roots', () => {
		const first = element('div');
		const second = element('div');
		expect(compareDocumentPosition(first, first)).toBe(0);
		expect(compareDocumentPosition(first, second)).toBe(1);
		expect(compareDocumentPosition(second, first)).toBe(1);
	});

	test('reports ancestor containment with DOM bitmask direction', () => {
		const leaf = element('button');
		const parent = element('div', {}, leaf);
		const root = element('div', {}, parent);
		expect(compareDocumentPosition(root, leaf)).toBe(4 | 16);
		expect(compareDocumentPosition(leaf, root)).toBe(2 | 8);
		expect(compareDocumentPosition(parent, leaf)).toBe(4 | 16);
	});

	test('orders siblings and cousins by physical tree position', () => {
		const first = element('button');
		const second = element('button');
		const left = element('section', {}, first);
		const right = element('section', {}, second);
		element('div', {}, left, right);
		expect(compareDocumentPosition(left, right)).toBe(4);
		expect(compareDocumentPosition(right, left)).toBe(2);
		expect(compareDocumentPosition(first, second)).toBe(4);
		expect(compareDocumentPosition(second, first)).toBe(2);
		expect(compareDocumentPosition(first, right)).toBe(4);
	});
});
