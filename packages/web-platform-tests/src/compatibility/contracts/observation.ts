import type { DOMNode } from './nodes.ts';
import type { DOMNodeList } from './collections.ts';

export interface DOMMutationObserverInit {
	childList?: boolean;
	attributes?: boolean;
	characterData?: boolean;
	subtree?: boolean;
	attributeOldValue?: boolean;
	characterDataOldValue?: boolean;
	attributeFilter?: string[];
}

/** https://dom.spec.whatwg.org/#interface-mutationrecord */
export interface DOMMutationRecord {
	readonly type: string;
	readonly target: DOMNode;
	readonly addedNodes: DOMNodeList;
	readonly removedNodes: DOMNodeList;
	readonly previousSibling: DOMNode | null;
	readonly nextSibling: DOMNode | null;
	readonly attributeName: string | null;
	readonly attributeNamespace: string | null;
	readonly oldValue: string | null;
}

export interface DOMMutationObserver {
	observe(target: DOMNode, options?: DOMMutationObserverInit): void;
	takeRecords(): DOMMutationRecord[];
	disconnect(): void;
}

export interface DOMMutationObserverConstructor {
	new (
		callback: (
			this: DOMMutationObserver,
			records: DOMMutationRecord[],
			observer: DOMMutationObserver,
		) => void,
	): DOMMutationObserver;
}
