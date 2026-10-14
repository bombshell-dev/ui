import { type Node, PrimitiveElement, type PropertyChange, layout } from '@clack/ui';
import { text as ttyText, type Op } from '@bomb.sh/tty';

type AttributeBinding = (instance: object, value: unknown) => void;

export class ClackElement<Props extends object> extends PrimitiveElement<Props> {
	static attributes: Record<string, AttributeBinding> = {};

	override create(): void {
		this.syncAttributes();
		this.render();
	}

	override propertyChanged(change: PropertyChange): void {
		super.propertyChanged(change);
		this.applyAttribute(change.name, change.value);
		this.update(change);
	}

	protected render(): void {}

	protected update(_change?: PropertyChange): void {}

	*layout(): Iterable<Op> {
		let content = '';
		for (const child of this.element.childNodes) {
			if (child.type === 'element') {
				if (content !== '') {
					yield ttyText(content);
					content = '';
				}
				yield* layout(child.node!);
			} else {
				content += child.content;
			}
		}
		if (content !== '') yield ttyText(content);
	}

	private syncAttributes(): void {
		const attributes = getAttributes(this);
		for (const name of Object.keys(attributes)) {
			if (name in this.element.properties) {
				this.applyAttribute(name, this.element.properties[name]);
			}
		}
	}

	private applyAttribute(name: string, value: unknown): void {
		getAttributes(this)[name]?.(this, value);
	}
}

export function reflects(property: string): AttributeBinding {
	return (instance, value) => {
		Reflect.set(instance, property, value);
	};
}

export function elementId(node: Node): string {
	let value = ids.get(node);
	if (!value) {
		value = `class-model-${nextId++}`;
		ids.set(node, value);
	}
	return value;
}

function getAttributes<Props extends object>(
	instance: ClackElement<Props>,
): Record<string, AttributeBinding> {
	return (instance.constructor as typeof ClackElement).attributes;
}

const ids = new WeakMap<Node, string>();
let nextId = 0;
