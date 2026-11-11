export type DOMInputCapability = 'keyboard' | 'text' | 'mouse';
export type DOMMouseButton = 0 | 1 | 2;

/** Host input, delivered through the implementation's normal input pipeline. */
export interface DOMInputDriver {
	keyboard?: {
		/** DOM key values, including 'Enter', 'Shift', 'Tab', and ' ' for Space. */
		keyDown(key: string): Promise<void>;
		keyUp(key: string): Promise<void>;
	};
	/** Insert text through the host editing path, without synthesizing key events. */
	insertText?(text: string): Promise<void>;
	mouse?: {
		/** Resolve a point using host layout, then relocate there without intermediate steps. */
		move(element: Element): Promise<void>;
		/** Move to coordinates relative to the fixture's viewport. */
		moveViewport(x: number, y: number): Promise<void>;
		down(button: DOMMouseButton): Promise<void>;
		up(button: DOMMouseButton): Promise<void>;
	};
	/** Release held input and clear session state before the fixture is disposed. */
	reset(): Promise<void>;
}

/** Test conveniences only sequence input; default actions belong to the host. */
export interface DOMTestInput {
	keyDown(key: string): Promise<void>;
	keyUp(key: string): Promise<void>;
	press(key: string): Promise<void>;
	insertText(text: string): Promise<void>;
	move(element: Element): Promise<void>;
	moveViewport(x: number, y: number): Promise<void>;
	down(button?: DOMMouseButton): Promise<void>;
	up(button?: DOMMouseButton): Promise<void>;
	click(element: Element, button?: DOMMouseButton): Promise<void>;
}

/** Compatibility MissingInputError support. */
export class MissingInputError extends Error {
	constructor(capability?: DOMInputCapability) {
		super(capability ? `Missing input.${capability} driver capability` : 'Missing input driver');
		this.name = 'MissingInputError';
	}
}

/** Compatibility testInput support. */
export function testInput(driver: DOMInputDriver): DOMTestInput {
	function keyboard(): NonNullable<DOMInputDriver['keyboard']> {
		if (!driver.keyboard) throw new MissingInputError('keyboard');
		return driver.keyboard;
	}
	function mouse(): NonNullable<DOMInputDriver['mouse']> {
		if (!driver.mouse) throw new MissingInputError('mouse');
		return driver.mouse;
	}

	return {
		async keyDown(key) {
			await keyboard().keyDown(key);
		},
		async keyUp(key) {
			await keyboard().keyUp(key);
		},
		async press(key) {
			await keyboard().keyDown(key);
			await keyboard().keyUp(key);
		},
		async insertText(text) {
			if (!driver.insertText) throw new MissingInputError('text');
			await driver.insertText(text);
		},
		async move(element) {
			await mouse().move(element);
		},
		async moveViewport(x, y) {
			await mouse().moveViewport(x, y);
		},
		async down(button = 0) {
			await mouse().down(button);
		},
		async up(button = 0) {
			await mouse().up(button);
		},
		async click(element, button = 0) {
			await mouse().move(element);
			await mouse().down(button);
			await mouse().up(button);
		},
	};
}
