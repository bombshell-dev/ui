export class Node {
	readonly parent?: Node;
	readonly contexts: Record<string, unknown>;
	readonly children: Set<Node>;

	constructor(parent?: Node) {
		this.parent = parent;
		this.contexts = Object.create(parent ? parent.contexts : null);
		this.children = new Set();
	}
}
