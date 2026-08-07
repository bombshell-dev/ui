/* oxlint-disable max-params -- host-config signatures are fixed by react-reconciler */
import type { Host } from '@clack/ui';
import type { HostElement, HostElementChild, HostLiteral } from '@clack/ui/elements';
import type { HostEventListener, HostEventType } from '@clack/ui/events';
import { createContext } from 'react';
import createReconciler, { type ReactContext } from 'react-reconciler';
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

export const reconciler = createReconciler<
	string,
	Props,
	Container,
	Instance,
	TextInstance,
	never,
	never,
	never,
	PublicInstance,
	object,
	never,
	ReturnType<typeof setTimeout>,
	number,
	null
>({
	supportsMutation: true,
	supportsPersistence: false,
	supportsHydration: false,
	isPrimaryRenderer: true,

	createInstance(type, props, container) {
		const instance = container.host.createElement(type);
		owners.set(instance, container.host);
		updateProperties(container.host, instance, {}, props);
		return instance;
	},
	createTextInstance(content, container) {
		const instance = container.host.createLiteral(content);
		owners.set(instance, container.host);
		return instance;
	},

	appendInitialChild(parent, child) {
		owner(parent).insertBefore(parent, child);
	},
	appendChild(parent, child) {
		owner(parent).insertBefore(parent, child);
	},
	appendChildToContainer(container, child) {
		container.host.insertBefore(container.element, child);
	},
	insertBefore(parent, child, anchor) {
		owner(parent).insertBefore(parent, child, anchor);
	},
	insertInContainerBefore(container, child, anchor) {
		container.host.insertBefore(container.element, child, anchor);
	},
	removeChild(parent, child) {
		owner(parent).removeChild(parent, child);
	},
	removeChildFromContainer(container, child) {
		container.host.removeChild(container.element, child);
	},
	clearContainer(container) {
		removeAllChildren(container.host, container.element);
	},

	commitUpdate(instance, _type, previous, next) {
		updateProperties(owner(instance), instance, previous, next);
	},
	commitTextUpdate(instance, _previous, next) {
		owner(instance).setText(instance, next);
	},

	prepareForCommit: () => null,
	resetAfterCommit: (container) => container.onCommit(),

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
	detachDeletedInstance: () => {},
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
	preloadInstance: () => true,
	startSuspendingCommit: () => {},
	suspendInstance: () => {},
	waitForCommitToBeReady: () => null,
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
const hostContext = {};
let currentUpdatePriority: number = NoEventPriority;

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

function updateProperty(
	host: Host,
	instance: HostElement,
	name: string,
	previous: unknown,
	next: unknown,
): void {
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

function updateProperties(host: Host, instance: HostElement, previous: Props, next: Props): void {
	for (const name of propertyNames(previous)) {
		if (!(name in next)) updateProperty(host, instance, name, previous[name], undefined);
	}
	for (const name of propertyNames(next)) {
		if (!Object.is(previous[name], next[name])) {
			updateProperty(host, instance, name, previous[name], next[name]);
		}
	}
}

function removeAllChildren(host: Host, parent: HostElement): void {
	for (const child of parent.children.slice()) host.removeChild(parent, child);
}
