/* oxlint-disable max-params -- host-config signatures are fixed by react-reconciler */
import { createContext } from 'react';
import createReconciler, { type ReactContext } from 'react-reconciler';
import { DefaultEventPriority, NoEventPriority } from 'react-reconciler/constants.js';

/** A retained host element; the commit walk turns these into `@clack/ui` `box`/`text` calls. */
export interface HostInstance {
	type: 'tui-box' | 'tui-text';
	props: Record<string, unknown>;
	children: AnyInstance[];
}

/** A retained text leaf. Discriminate with `'text' in node`. */
export interface HostTextInstance {
	text: string;
}

export type AnyInstance = HostInstance | HostTextInstance;

/** The root container react renders into; `onCommit` fires once per committed frame. */
export interface Container {
	children: AnyInstance[];
	onCommit: () => void;
}

function stripChildren(props: Record<string, unknown>): Record<string, unknown> {
	const { children: _children, ...rest } = props;
	return rest;
}

function insert(list: AnyInstance[], child: AnyInstance, before: AnyInstance): void {
	const index = list.indexOf(before);
	list.splice(index === -1 ? list.length : index, 0, child);
}

function remove(list: AnyInstance[], child: AnyInstance): void {
	const index = list.indexOf(child);
	if (index !== -1) list.splice(index, 1);
}

let currentUpdatePriority: number = NoEventPriority;
const hostContext = {};

// The host config `react-reconciler@0.33` requires. Mutation mode: react calls the
// append/insert/remove hooks to keep our retained instance tree in sync, then
// `resetAfterCommit` triggers one frame render. No diffing here — `Term.render`
// diffs at the cell level, so rebuilding the full op stream per commit is cheap.
export const reconciler = createReconciler<
	string, // Type
	Record<string, unknown>, // Props
	Container,
	HostInstance,
	HostTextInstance,
	never, // SuspenseInstance
	never, // HydratableInstance
	never, // FormInstance
	AnyInstance, // PublicInstance
	object, // HostContext
	never, // ChildSet
	ReturnType<typeof setTimeout>, // TimeoutHandle
	number, // NoTimeout
	null // TransitionStatus
>(
	{
		supportsMutation: true,
		supportsPersistence: false,
		supportsHydration: false,
		isPrimaryRenderer: true,

		createInstance: (type: HostInstance['type'], props: Record<string, unknown>): HostInstance => ({
			type,
			props: stripChildren(props),
			children: [],
		}),
		createTextInstance: (text: string): HostTextInstance => ({ text }),

		appendInitialChild: (parent: HostInstance, child: AnyInstance) =>
			void parent.children.push(child),
		appendChild: (parent: HostInstance, child: AnyInstance) => void parent.children.push(child),
		appendChildToContainer: (container: Container, child: AnyInstance) =>
			void container.children.push(child),
		insertBefore: (parent: HostInstance, child: AnyInstance, before: AnyInstance) =>
			insert(parent.children, child, before),
		insertInContainerBefore: (container: Container, child: AnyInstance, before: AnyInstance) =>
			insert(container.children, child, before),
		removeChild: (parent: HostInstance, child: AnyInstance) => remove(parent.children, child),
		removeChildFromContainer: (container: Container, child: AnyInstance) =>
			remove(container.children, child),
		clearContainer: (container: Container) => void (container.children.length = 0),

		commitUpdate: (
			instance: HostInstance,
			_type: string,
			_oldProps: unknown,
			newProps: Record<string, unknown>,
		) => void (instance.props = stripChildren(newProps)),
		commitTextUpdate: (instance: HostTextInstance, _old: string, next: string) =>
			void (instance.text = next),

		prepareForCommit: () => null,
		resetAfterCommit: (container: Container) => container.onCommit(),

		setCurrentUpdatePriority: (priority: number) => void (currentUpdatePriority = priority),
		getCurrentUpdatePriority: () => currentUpdatePriority,
		resolveUpdatePriority: () =>
			currentUpdatePriority !== NoEventPriority ? currentUpdatePriority : DefaultEventPriority,

		supportsMicrotasks: true,
		scheduleMicrotask: queueMicrotask,
		scheduleTimeout: setTimeout,
		cancelTimeout: clearTimeout,
		noTimeout: -1,

		// A non-null value; `null` makes react warn "Expected host context to exist".
		getRootHostContext: () => hostContext,
		getChildHostContext: () => hostContext,
		shouldSetTextContent: () => false,
		finalizeInitialChildren: () => false,
		getPublicInstance: (instance: AnyInstance) => instance,
		preparePortalMount: () => {},
		detachDeletedInstance: () => {},
		getInstanceFromNode: () => null,
		beforeActiveInstanceBlur: () => {},
		afterActiveInstanceBlur: () => {},
		prepareScopeUpdate: () => {},
		getInstanceFromScope: () => null,
		resetTextContent: () => {},
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
		// React's runtime context object has the internal fields the reconciler reads;
		// the public `Context` type just doesn't declare them.
		HostTransitionContext: createContext(null) as unknown as ReactContext<null>,
		resetFormInstance: () => {},
		requestPostPaintCallback: () => {},
		shouldAttemptEagerTransition: () => false,
		trackSchedulerEvent: () => {},
		resolveEventType: () => null,
		resolveEventTimeStamp: () => -1.1,
	},
);
