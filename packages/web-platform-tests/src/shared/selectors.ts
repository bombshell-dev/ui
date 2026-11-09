import type { DOMFixture } from './context.ts';
import type { Selector } from '../wpt/dom/nodes/selectors.js.ts';
import { elements, specialElements } from '../wpt/dom/nodes/ParentNode-querySelector-All.js.ts';

export type Root = Document | Element | DocumentFragment;
export type Kind = 'document' | 'detached' | 'fragment' | 'element' | 'empty';
export const roots = {
	document: 'Document',
	detached: 'Detached Element',
	fragment: 'Fragment',
	element: 'In-document Element',
} as const;

export function prepare({ document }: DOMFixture, kind: Kind): Root {
	const element = document.getElementById('root')!;
	specialElements(document, element);
	if (kind === 'document') return document;
	if (kind === 'empty') return document.createElement('div');
	if (kind === 'detached') return element.cloneNode(true) as Element;
	if (kind === 'fragment') {
		const fragment = document.createDocumentFragment();
		fragment.appendChild(element.cloneNode(true));
		return fragment;
	}
	// The upstream connected-element queries must exclude this indistinguishable sibling tree.
	const clone = element.cloneNode(true);
	for (const descendant of elements(clone)) descendant.setAttribute('data-clone', '');
	document.body.appendChild(clone);
	return element;
}

export function prepareQueryMutations({ document }: DOMFixture, root: Root): void {
	const connected = document.getElementById('root')!;
	// Both connected mutations precede valid queries in the upstream wrapper.
	document.body.appendChild(document.createElement('div'));
	connected.appendChild(document.createElement('div'));
	if (root !== document && root !== connected) root.appendChild(document.createElement('div'));
}

export function permitted(
	row: Selector,
	context: { kind: Kind; xml: boolean; mask: number },
): boolean {
	return (
		Boolean(row.testType & context.mask) &&
		!row.exclude?.includes(context.kind) &&
		!row.exclude?.includes(context.xml ? 'xhtml' : 'html')
	);
}
