import type { DOMDocumentFragment, DOMNode } from './nodes.ts';
import type { DOMShadowRoot } from './shadow.ts';

/** https://dom.spec.whatwg.org/#interface-staticrange */
export interface DOMStaticRange {
	readonly startContainer: DOMNode;
	readonly startOffset: number;
	readonly endContainer: DOMNode;
	readonly endOffset: number;
	readonly collapsed: boolean;
}

/** https://dom.spec.whatwg.org/#interface-range */
export interface DOMRange extends DOMStaticRange {
	readonly commonAncestorContainer: DOMNode;
	readonly START_TO_START: 0;
	readonly START_TO_END: 1;
	readonly END_TO_END: 2;
	readonly END_TO_START: 3;
	setStart(node: DOMNode, offset: number): void;
	setEnd(node: DOMNode, offset: number): void;
	setStartBefore(node: DOMNode): void;
	setStartAfter(node: DOMNode): void;
	setEndBefore(node: DOMNode): void;
	setEndAfter(node: DOMNode): void;
	selectNode(node: DOMNode): void;
	selectNodeContents(node: DOMNode): void;
	collapse(toStart?: boolean): void;
	compareBoundaryPoints(how: number, sourceRange: DOMRange): number;
	comparePoint(node: DOMNode, offset: number): number;
	isPointInRange(node: DOMNode, offset: number): boolean;
	intersectsNode(node: DOMNode): boolean;
	cloneRange(): DOMRange;
	cloneContents(): DOMDocumentFragment;
	extractContents(): DOMDocumentFragment;
	deleteContents(): void;
	insertNode(node: DOMNode): void;
	surroundContents(newParent: DOMNode): void;
	detach(): void;
	toString(): string;
}

/** https://w3c.github.io/selection-api/#selection-interface */
export interface DOMSelection {
	readonly anchorNode: DOMNode | null;
	readonly anchorOffset: number;
	readonly focusNode: DOMNode | null;
	readonly focusOffset: number;
	readonly isCollapsed: boolean;
	readonly rangeCount: number;
	readonly type: string;
	readonly direction: string;
	addRange(range: DOMRange): void;
	removeRange(range: DOMRange): void;
	removeAllRanges(): void;
	empty(): void;
	getRangeAt(index: number): DOMRange;
	getComposedRanges(options?: { shadowRoots?: readonly DOMShadowRoot[] }): DOMStaticRange[];
	collapse(node: DOMNode | null, offset?: number): void;
	setPosition(node: DOMNode | null, offset?: number): void;
	collapseToStart(): void;
	collapseToEnd(): void;
	extend(node: DOMNode, offset?: number): void;
	setBaseAndExtent(
		anchorNode: DOMNode,
		anchorOffset: number,
		focusNode: DOMNode,
		focusOffset: number,
	): void;
	selectAllChildren(node: DOMNode): void;
	modify(alter?: string, direction?: string, granularity?: string): void;
	deleteFromDocument(): void;
	containsNode(node: DOMNode, allowPartialContainment?: boolean): boolean;
	toString(): string;
}
