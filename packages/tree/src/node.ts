export interface Node {
	parent?: Node;
	contexts: Record<string, unknown>;
	children: Readonly<Set<Node>>;
}

export function createNode(parent?: Node): Node {
	const contexts = Object.create(parent ? parent.contexts : null);
	return {
		parent,
		contexts,
		children: new Set(),
	};
}
