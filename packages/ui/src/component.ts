// oxlint-disable bombshell-dev/exported-function-async -- Component definitions are synchronous.
import { HostApi, type Host, type ElementDefinition } from './host.ts';
import type { HostElement, HostElementChildInput, PropertyChange } from './elements.ts';
import type { Node } from './core.ts';
import type { Op } from '@bomb.sh/tty';
import type { KeyDown, KeyRepeat } from './keyboard.ts';
import type { HostEventData } from './events.ts';
import type { EventResult } from './event-api.ts';

/** A framework-neutral component registered as a named host element. */
export interface Component<Props extends object = Record<string, unknown>> {
	readonly name: string;
	readonly kind: DefinitionKind;
	create(host: Host, properties?: Props, ...children: HostElementChildInput[]): HostElement;
	register(host: Host): void;
}

/** Bind a registered component factory to a host for declarative child creation. */
export function template<Props extends object>(
	host: Host,
	component: Component<Props>,
): (properties?: Props, ...children: HostElementChildInput[]) => HostElement {
	return (properties, ...children) => component.create(host, properties, ...children);
}

export type DefinitionKind = 'element' | 'component' | 'primitive';

export type CreateResult =
	| HostElement
	| { implementation: HostElement; contentContainer?: HostElement }
	| void;

export interface Registration {
	register(host: Host): void;
}

interface ComponentOptions<Props extends object> {
	define: ElementDefinition | ComponentConstructor<Props>;
	dependencies?: readonly Registration[];
}

const registrationPlans = new WeakMap<
	object,
	{
		dependencies: readonly Registration[];
		install(host: Host): void;
	}
>();

/** Register components and their dependencies once for this registration pass. */
export function registerComponents(host: Host, components: readonly Registration[]): void {
	const registered = new Set<object>();
	const visit = (component: Registration): void => {
		if (registered.has(component)) return;
		registered.add(component);
		const plan = registrationPlans.get(component);
		if (!plan) {
			component.register(host);
			return;
		}
		for (const dependency of plan.dependencies) visit(dependency);
		plan.install(host);
	};
	for (const component of components) visit(component);
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

	get host(): Host {
		if (!this.node) throw new DetachedComponentError(this.element);
		return HostApi.at(this.node).getHost();
	}

	/** Emit from this persistent element without exposing its runtime node. */
	emit(data: HostEventData): EventResult {
		return this.element.emit(data);
	}

	/** Create this element's persistent child tree once. */
	create(): CreateResult {}

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

class DetachedComponentError extends Error {
	constructor(element: HostElement) {
		super(`component <${element.name}> must be connected before accessing its host`);
		this.name = 'DetachedComponentError';
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
	definitionOrOptions: ElementDefinition | ComponentConstructor<Props> | ComponentOptions<Props>,
): Component<Props> {
	return defineRegistration({ name, kind: 'component' }, definitionOrOptions);
}

/** Define a standard semantic element using the shared component runtime. */
export function defineElement<Props extends object = Record<string, unknown>>(
	name: string,
	definitionOrOptions: ElementDefinition | ComponentConstructor<Props> | ComponentOptions<Props>,
): Component<Props> {
	return defineRegistration({ name, kind: 'element' }, definitionOrOptions);
}

function defineRegistration<Props extends object>(
	{ name, kind }: { name: string; kind: DefinitionKind },
	definitionOrOptions: ElementDefinition | ComponentConstructor<Props> | ComponentOptions<Props>,
): Component<Props> {
	const options = isComponentOptions<Props>(definitionOrOptions)
		? definitionOrOptions
		: { define: definitionOrOptions };
	const { define, dependencies = [] } = options;
	const Constructor = isComponentConstructor(define) ? define : undefined;
	const instances = new WeakMap<HostElement, ComponentElement<Props>>();
	const definition: ElementDefinition = Constructor
		? createClassDefinition(Constructor, instances)
		: (define as ElementDefinition);

	const component: Component<Props> = {
		name,
		kind,
		create(host, properties, ...children) {
			if (properties === undefined) {
				return host.createElement(name, ...children);
			}
			return host.createElement(name, properties as Record<string, unknown>, ...children);
		},
		register(host) {
			registerComponents(host, [component]);
		},
	};
	registrationPlans.set(component, {
		dependencies,
		install: (host) => host.defineElement(name, definition),
	});
	return component;
}

/** Define a tty-backed primitive as a named host element. */
export function definePrimitive<Props extends object = Record<string, unknown>>(
	name: string,
	define: new (element: HostElement) => PrimitiveElement<Props>,
): Component<Props> {
	return defineRegistration({ name, kind: 'primitive' }, define);
}

function isComponentConstructor<Props extends object>(
	value: ElementDefinition | ComponentConstructor<Props>,
): value is ComponentConstructor<Props> {
	return value.prototype instanceof ComponentElement;
}

function isComponentOptions<Props extends object>(
	value: ElementDefinition | ComponentConstructor<Props> | ComponentOptions<Props>,
): value is ComponentOptions<Props> {
	return typeof value === 'object' && value !== null && 'define' in value;
}

function createClassDefinition<Props extends object>(
	Constructor: ComponentConstructor<Props>,
	instances: WeakMap<HostElement, ComponentElement<Props>>,
): ElementDefinition {
	return (element) => {
		const component = new Constructor(element);
		instances.set(element, component);
		let created = false;
		let creating = false;
		const pendingChanges: PropertyChange[] = [];

		element.attach = (node) => {
			component.node = node;
			if (!created) {
				creating = true;
				let result: CreateResult;
				try {
					result = component.create();
				} finally {
					creating = false;
				}
				// View references are ready before insertion connects implementation children.
				created = true;
				for (const change of pendingChanges.splice(0)) component.propertyChanged(change);
				if (result !== undefined) {
					const projection = 'implementation' in result ? result : { implementation: result };
					const { implementation, contentContainer } = projection;
					if (contentContainer) contentContainer.append([...element.childNodes]);
					HostApi.at(node).getHost().insertBefore(element, implementation);
					if (contentContainer) element.childrenContainer = contentContainer;
				}
			}
			if (component.node !== node) return;
			component.connectedCallback(node);
		};
		element.detach = (node) => {
			component.disconnectedCallback(node);
			component.node = null;
		};
		element.focusedCallback = (node) => component.focusedCallback(node);
		element.blurredCallback = (node) => component.blurredCallback(node);
		element.propertyChanged = (change) => {
			if (created) {
				component.propertyChanged(change);
			} else if (creating) {
				pendingChanges.push(change);
			}
		};
		element.keydown = (event) => component.keydown(event);
		element.keyrepeat = (event) => component.keyrepeat(event);
		if (component instanceof PrimitiveElement) {
			element.layout = () => component.layout();
		}
	};
}
