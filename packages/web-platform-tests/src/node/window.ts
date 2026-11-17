import { setMaxListeners } from 'node:events';

const getTarget = Object.getOwnPropertyDescriptor(Event.prototype, 'target')!.get!;
const getCurrentTarget = Object.getOwnPropertyDescriptor(Event.prototype, 'currentTarget')!.get!;
const composedPath = Event.prototype.composedPath;

/** Delegate window events while exposing the worker global as their receiver. */
export class Window extends EventTarget {
	readonly #scope: object;
	readonly #listeners = new WeakMap<EventListener, EventListener>();

	constructor(scope: object) {
		super();
		this.#scope = scope;
		// Whole WPT files register hundreds of load listeners on the same window.
		setMaxListeners(0, this);
	}

	override addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: AddEventListenerOptions | boolean,
	): void {
		if (typeof callback === 'function') {
			let listener = this.#listeners.get(callback);
			if (!listener) {
				listener = (event) => Reflect.apply(callback, this.#scope, [event]);
				this.#listeners.set(callback, listener);
			}
			super.addEventListener(type, listener, options);
		} else {
			super.addEventListener(type, callback, options);
		}
	}

	override removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean,
	): void {
		super.removeEventListener(
			type,
			typeof callback === 'function' ? (this.#listeners.get(callback) ?? callback) : callback,
			options,
		);
	}

	override dispatchEvent(event: Event): boolean {
		const retarget = (target: EventTarget | null): object | null =>
			target === this ? this.#scope : target;
		const descriptors: PropertyDescriptorMap = {
			target: { get: () => retarget(getTarget.call(event)) },
			currentTarget: { get: () => retarget(getCurrentTarget.call(event)) },
			srcElement: { get: () => event.target },
			composedPath: { value: () => composedPath.call(event).map(retarget), writable: true },
		};
		for (const [name, descriptor] of Object.entries(descriptors)) {
			// Preserve explicit targets, including document on the window load event.
			if (!Object.hasOwn(event, name)) {
				Object.defineProperty(event, name, { ...descriptor, configurable: true });
			}
		}
		return super.dispatchEvent(event);
	}
}
