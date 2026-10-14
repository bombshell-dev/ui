/* oxlint-disable max-params -- host-config signatures are fixed by react-reconciler */
import { EventApi, getElementHost, type Host } from '@clack/ui';
import type { HostElement, HostElementChild, HostLiteral } from '@clack/ui/elements';
import type { HostEventListener, HostEventType } from '@clack/ui/events';
import { createContext } from 'react';
import createReconciler, { type Fiber, type ReactContext } from 'react-reconciler';
import { DefaultEventPriority, NoEventPriority } from 'react-reconciler/constants.js';

type Props = Record<string, unknown>;
type Instance = HostElement;
type TextInstance = HostLiteral;
type PublicInstance = HostElementChild;

export interface Container {
	element: HostElement;
	host: Host;
	onCommit(): void;
}

type HostContainer = Container | HostElement;

const hostCommits = new WeakMap<Host, () => void>();

export function registerHostCommit(host: Host, onCommit: () => void): void {
	hostCommits.set(host, onCommit);
	installReactEvents(host);
}

function installReactEvents(host: Host): void {
	if (eventHosts.has(host)) return;
	eventHosts.add(host);
	EventApi.decorate(host.root, () => ({
		getEventParent(element) {
			const handle = handles.get(element);
			// Deleted fibers lose ancestry before passive cleanup releases their handles.
			if (!handle?.return) return super.getEventParent(element);
			// Portal fibers retain the logical React ancestry, not the mount container's.
			for (let parent: Fiber | null = handle.return; parent; parent = parent.return) {
				if (handles.has(parent.stateNode)) return parent.stateNode as HostElement;
				if (parent.tag === 3) return containerParts(parent.stateNode.containerInfo).element;
			}
			return null;
		},
	}));
}

export const reconciler = createReconciler<
	string,
	Props,
	HostContainer,
	Instance,
	TextInstance,
	never,
	never,
	never,
	never,
	PublicInstance,
	object,
	never,
	ReturnType<typeof setTimeout>,
	number,
	null,
	null,
	null,
	never,
	never,
	never
>({
	rendererVersion: '0.0.0',
	rendererPackageName: '@clack/ui-react',
	extraDevToolsConfig: null,
	bindToConsole(methodName, args) {
		return () => {
			const method = console[methodName as keyof Console];
			if (typeof method === 'function') Reflect.apply(method, console, args);
		};
	},
	supportsMutation: true,
	supportsPersistence: false,
	supportsHydration: false,
	isPrimaryRenderer: true,

	createInstance(type, props, container, _context, internalInstanceHandle) {
		const { host } = containerParts(container);
		installReactEvents(host);
		const instance = host.createElement(type);
		owners.set(instance, host);
		handles.set(instance, internalInstanceHandle);
		updateProperties({ host, instance, previous: {}, next: props });
		return instance;
	},
	createTextInstance(content, container) {
		const { host } = containerParts(container);
		const instance = host.createLiteral(content);
		owners.set(instance, host);
		return instance;
	},

	appendInitialChild(parent, child) {
		owner(parent).insertBefore(parent, child);
	},
	appendChild(parent, child) {
		owner(parent).insertBefore(parent, child);
	},
	appendChildToContainer(container, child) {
		const { host, element } = containerParts(container);
		host.insertBefore(element, child);
	},
	insertBefore(parent, child, anchor) {
		owner(parent).insertBefore(parent, child, anchor);
	},
	insertInContainerBefore(container, child, anchor) {
		const { host, element } = containerParts(container);
		host.insertBefore(element, child, anchor);
	},
	removeChild(parent, child) {
		owner(parent).removeChild(parent, child);
	},
	removeChildFromContainer(container, child) {
		const { host, element } = containerParts(container);
		host.removeChild(element, child);
	},
	clearContainer(container) {
		const { host, element } = containerParts(container);
		removeAllChildren(host, element);
	},

	commitUpdate(instance, _type, previous, next, internalInstanceHandle) {
		handles.set(instance, internalInstanceHandle);
		updateProperties({ host: owner(instance), instance, previous, next });
	},
	commitTextUpdate(instance, _previous, next) {
		owner(instance).setText(instance, next);
	},

	prepareForCommit: () => null,
	resetAfterCommit(container) {
		containerParts(container).onCommit();
	},

	setCurrentUpdatePriority(priority) {
		currentUpdatePriority = priority;
	},
	getCurrentUpdatePriority: () => currentUpdatePriority,
	resolveUpdatePriority: () =>
		currentUpdatePriority !== NoEventPriority ? currentUpdatePriority : DefaultEventPriority,

	supportsMicrotasks: true,
	scheduleMicrotask: queueMicrotask,
	scheduleTimeout: setTimeout,
	cancelTimeout: clearTimeout,
	noTimeout: -1,

	getRootHostContext: () => hostContext,
	getChildHostContext: () => hostContext,
	shouldSetTextContent: () => false,
	finalizeInitialChildren: () => false,
	getPublicInstance: (instance) => instance,
	preparePortalMount: () => {},
	detachDeletedInstance(instance) {
		handles.delete(instance);
	},
	getInstanceFromNode: () => null,
	beforeActiveInstanceBlur: () => {},
	afterActiveInstanceBlur: () => {},
	prepareScopeUpdate: () => {},
	getInstanceFromScope: () => null,
	resetTextContent(instance) {
		removeAllChildren(owner(instance), instance);
	},
	hideInstance: () => {},
	unhideInstance: () => {},
	hideTextInstance: () => {},
	unhideTextInstance: () => {},
	maySuspendCommit: () => false,
	maySuspendCommitOnUpdate: () => false,
	maySuspendCommitInSyncRender: () => false,
	preloadInstance: () => true,
	startSuspendingCommit: () => null,
	suspendInstance: () => {},
	suspendOnActiveViewTransition: () => {},
	waitForCommitToBeReady: () => null,
	getSuspendedCommitReason: () => null,
	NotPendingTransition: null,
	HostTransitionContext: createContext(null) as unknown as ReactContext<null>,
	resetFormInstance: () => {},
	requestPostPaintCallback: () => {},
	shouldAttemptEagerTransition: () => false,
	trackSchedulerEvent: () => {},
	resolveEventType: () => null,
	resolveEventTimeStamp: () => -1.1,
});

const owners = new WeakMap<HostElementChild, Host>();
const handles = new WeakMap<HostElement, Fiber>();
const eventHosts = new WeakSet<Host>();
const hostContext = {};
let currentUpdatePriority: number = NoEventPriority;

function containerParts(container: HostContainer): Container {
	if ('host' in container && 'element' in container) return container;
	const host = getElementHost(container);
	owners.set(container, host);
	return {
		host,
		element: container,
		onCommit: () => hostCommits.get(host)?.(),
	};
}

class MissingHostOwnerError extends Error {
	readonly code = 'CLACK_REACT_MISSING_HOST_OWNER';
	readonly instance: HostElementChild;

	constructor(instance: HostElementChild) {
		super('React instance does not belong to a Host');
		this.name = 'MissingHostOwnerError';
		this.instance = instance;
	}
}

function owner(instance: HostElementChild): Host {
	const host = owners.get(instance);
	if (!host) throw new MissingHostOwnerError(instance);
	return host;
}

function propertyNames(props: Props): string[] {
	return Object.keys(props).filter((name) => name !== 'children');
}

function eventType(name: string): HostEventType | undefined {
	const first = name[2];
	if (!name.startsWith('on') || !first || first === first.toLowerCase()) return;
	return `${first.toLowerCase()}${name.slice(3)}` as HostEventType;
}

function eventListener(value: unknown): HostEventListener<HostEventType> | undefined {
	return typeof value === 'function' ? (value as HostEventListener<HostEventType>) : undefined;
}

interface PropertyUpdate {
	host: Host;
	instance: HostElement;
	name: string;
	previous: unknown;
	next: unknown;
}

function updateProperty({ host, instance, name, previous, next }: PropertyUpdate): void {
	const type = eventType(name);
	if (type) {
		const previousListener = eventListener(previous);
		const nextListener = eventListener(next);
		if (previousListener) host.removeEventListener(instance, type, previousListener);
		if (nextListener) host.addEventListener(instance, type, nextListener);
	} else {
		host.setProperty(instance, name, next);
	}
}

interface PropertiesUpdate {
	host: Host;
	instance: HostElement;
	previous: Props;
	next: Props;
}

function updateProperties({ host, instance, previous, next }: PropertiesUpdate): void {
	for (const name of propertyNames(previous)) {
		if (!(name in next))
			updateProperty({ host, instance, name, previous: previous[name], next: undefined });
	}
	for (const name of propertyNames(next)) {
		if (!Object.is(previous[name], next[name])) {
			updateProperty({ host, instance, name, previous: previous[name], next: next[name] });
		}
	}
}

function removeAllChildren(host: Host, parent: HostElement): void {
	for (const child of (parent.childrenContainer ?? parent).childNodes.slice()) {
		host.removeChild(parent, child);
	}
}
