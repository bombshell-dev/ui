// oxlint-disable bombshell-dev/exported-function-async -- Component definitions are synchronous.
import type { Host, ElementDefinition } from './host.ts';
import type { HostElement, HostElementChildInput, PropertyChange } from './elements.ts';
import type { Node } from './core.ts';
import type { Op } from '@bomb.sh/tty';
import type { KeyDown, KeyRepeat } from './keyboard.ts';

/** A framework-neutral component registered as a named host element. */
export interface Component<Props extends object = Record<string, unknown>> {
	readonly name: string;
	create(host: Host, properties?: Props, ...children: HostElementChildInput[]): HostElement;
	register(host: Host): void;
}

/** Base class for framework-neutral component instances. */
export abstract class ComponentElement<Props extends object = Record<string, unknown>> {
	readonly element: HostElement;
	node: Node | null = null;

	constructor(element: HostElement) {
		this.element = element;
	}

	get props(): Props {
		return this.element.properties as Props;
	}

	/** Create this element's persistent child tree once. */
	create(): void {}

	/** React to one changed property after the component has been created. */
	propertyChanged(_change: PropertyChange): void {}

	connectedCallback(_node: Node): void {}

	disconnectedCallback(_node: Node): void {}

	focusedCallback(_node: Node): void {}

	blurredCallback(_node: Node): void {}

	keydown(_event: KeyDown): boolean {
		return false;
	}

	keyrepeat(_event: KeyRepeat): boolean {
		return false;
	}
}

/** Base class for elements whose implementation directly emits tty operations. */
export abstract class PrimitiveElement<
	Props extends object = Record<string, unknown>,
> extends ComponentElement<Props> {
	abstract layout(): Iterable<Op>;
}

export type ComponentConstructor<Props extends object = Record<string, unknown>> = new (
	element: HostElement,
) => ComponentElement<Props>;

/**
 * Define a reusable component that can be created directly or used through
 * any of the framework bindings as its named host element.
 */
export function defineComponent<Props extends object = Record<string, unknown>>(
	name: string,
	define: ElementDefinition | ComponentConstructor<Props>,
): Component<Props> {
	const Constructor = isComponentConstructor(define) ? define : undefined;
	const instances = new WeakMap<HostElement, ComponentElement<Props>>();
	const definition = Constructor ? createClassDefinition(Constructor, instances) : define;

	return {
		name,
		create(host, properties, ...children) {
			if (properties === undefined) {
				return host.createElement(name, ...children);
			}
			return host.createElement(name, properties, ...children);
		},
		register(host) {
			host.defineElement(name, definition);
		},
	};
}

/** Define a tty-backed primitive as a named host element. */
export function definePrimitive<Props extends object = Record<string, unknown>>(
	name: string,
	define: new (element: HostElement) => PrimitiveElement<Props>,
): Component<Props> {
	return defineComponent(name, define);
}

function isComponentConstructor<Props extends object>(
	value: ElementDefinition | ComponentConstructor<Props>,
): value is ComponentConstructor<Props> {
	return value.prototype instanceof ComponentElement;
}

function createClassDefinition<Props extends object>(
	Constructor: ComponentConstructor<Props>,
	instances: WeakMap<HostElement, ComponentElement<Props>>,
): ElementDefinition {
	return (element) => {
		const component = new Constructor(element);
		instances.set(element, component);
		let created = false;

		element.attach = (node) => {
			component.node = node;
			if (!created) {
				component.create();
				created = true;
			}
			component.connectedCallback(node);
		};
		element.detach = (node) => {
			component.disconnectedCallback(node);
			component.node = null;
		};
		element.focus = (node) => component.focusedCallback(node);
		element.blur = (node) => component.blurredCallback(node);
		element.propertyChanged = (change) => {
			if (created) {
				component.propertyChanged(change);
			}
		};
		element.keydown = (event) => component.keydown(event);
		element.keyrepeat = (event) => component.keyrepeat(event);
		if (component instanceof PrimitiveElement) {
			element.layout = () => component.layout();
		}
	};
}
