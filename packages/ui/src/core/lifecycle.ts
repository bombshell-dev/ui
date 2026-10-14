import { Node } from './node.ts';
import { createContext } from './context.ts';
import { Api } from './api.ts';

export class LifecycleApi extends Api {
	ids = 0;
	global: Node;
	constructor(global: Node) {
		super(global);
		this.global = global;
		IdContext.set(this.global, 'root');
	}

	create(parent: Node = this.global) {
		const node = new Node(parent);
		parent.children.add(node);
		IdContext.set(node, `${this.ids++}`);
		return node;
	}

	destroy(node: Node) {
		for (const child of node.children) {
			LifecycleApi.at(child).destroy(child);
		}
		node.parent?.children.delete(node);
	}

	id(node: Node): string {
		return IdContext.expect(node);
	}
}

const IdContext = createContext<string>('id');

export const lifecycle = LifecycleApi.init(new Node());

export function id(node: Node): string {
	return LifecycleApi.at(node).id(node);
}
