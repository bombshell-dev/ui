export class Node {
	readonly parent?: Node;
	readonly children: Set<Node>;
	readonly id: string;

	contexts?: Map<string, unknown>;
	ondestroy?: (node: Node) => void;

	private constructor(parent?: Node) {
		this.parent = parent;
		this.children = new Set();
		this.id = `${nextId++}`;
	}

	static createRoot(): Node {
		return new Node();
	}

	createChild(): Node {
		const child = new Node(this);
		this.children.add(child);
		return child;
	}

	destroy(): void {
		this.ondestroy?.(this);
		for (const child of this.children) {
			child.destroy();
		}
		this.parent?.children.delete(this);
	}
}

let nextId = 0;
