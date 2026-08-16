import type { Context } from './context.ts';

export class Node {
	readonly parent?: Node;
	readonly children: Set<Node>;

	contexts?: Map<Context<unknown>, unknown>;

	constructor(parent?: Node) {
		this.parent = parent;
		this.children = new Set();
	}
}
