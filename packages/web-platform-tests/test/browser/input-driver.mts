import type { DOMInputDriver, DOMMouseButton } from '../../src/compatibility/input-driver.ts';

export type BrowserInputCommand =
	| { type: 'keyDown' | 'keyUp'; key: string }
	| { type: 'insertText'; text: string }
	| { type: 'move'; x: number; y: number }
	| { type: 'down' | 'up'; button: DOMMouseButton }
	| { type: 'reset' };

export type BrowserInputBridge = (command: BrowserInputCommand) => Promise<void>;

class BrowserInputError extends Error {
	readonly target: Element;
	constructor(message: string, target: Element) {
		super(message);
		this.name = 'BrowserInputError';
		this.target = target;
	}
}

/** The bridge delivers trusted input through browser automation, outside this realm. */
export function createBrowserInputDriver(
	document: Document,
	send: BrowserInputBridge,
): DOMInputDriver {
	return {
		keyboard: {
			keyDown: (key) => send({ type: 'keyDown', key }),
			keyUp: (key) => send({ type: 'keyUp', key }),
		},
		insertText: (text) => send({ type: 'insertText', text }),
		mouse: {
			async move(element) {
				// The generic suite's contract enters the native-browser adapter here.
				const target = element as unknown as Element;
				if (target.ownerDocument !== document || !target.isConnected)
					throw new BrowserInputError(
						'Mouse target must be connected to the fixture document',
						target,
					);
				target.scrollIntoView({ block: 'center', inline: 'center' });
				const rect = target.getBoundingClientRect();
				if (!rect.width || !rect.height)
					throw new BrowserInputError('Mouse target has no rendered box', target);
				let x = rect.left + rect.width / 2;
				let y = rect.top + rect.height / 2;
				let view = document.defaultView;
				while (view?.frameElement) {
					const frame = view.frameElement;
					const frameRect = frame.getBoundingClientRect();
					x += frameRect.left + frame.clientLeft;
					y += frameRect.top + frame.clientTop;
					view = frame.ownerDocument.defaultView;
				}
				await send({ type: 'move', x, y });
			},
			down: (button) => send({ type: 'down', button }),
			up: (button) => send({ type: 'up', button }),
		},
		reset: () => send({ type: 'reset' }),
	};
}
