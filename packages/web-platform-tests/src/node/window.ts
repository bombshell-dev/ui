import { setMaxListeners } from 'node:events';

/** Fixture script global with an event target independent of its document. */
export class Window extends EventTarget {
	// Installed after initializing upstream testharness.js in its shell environment.
	declare readonly document: Document;

	constructor() {
		super();
		// Whole WPT files register hundreds of load listeners on the same window.
		setMaxListeners(0, this);
	}
}
