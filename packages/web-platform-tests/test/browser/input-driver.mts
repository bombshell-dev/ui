import type { DOMInputDriver, DOMMouseButton } from '../../src/shared/input-driver.ts';

type BrowserInputCommand =
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
	async function moveViewport(x: number, y: number): Promise<void> {
		let view = document.defaultView;
		while (view?.frameElement) {
			const frame = view.frameElement;
			const rect = frame.getBoundingClientRect();
			x += rect.left + frame.clientLeft;
			y += rect.top + frame.clientTop;
			view = frame.ownerDocument.defaultView;
		}
		await send({ type: 'move', x, y });
	}
	return {
		keyboard: {
			keyDown: (key) => send({ type: 'keyDown', key }),
			keyUp: (key) => send({ type: 'keyUp', key }),
		},
		insertText: (text) => send({ type: 'insertText', text }),
		mouse: {
			async move(target) {
				if (target.ownerDocument !== document || !target.isConnected)
					throw new BrowserInputError(
						'Mouse target must be connected to the fixture document',
						target,
					);
				target.scrollIntoView({ block: 'center', inline: 'center' });
				const rect = target.getBoundingClientRect();
				if (!rect.width || !rect.height)
					throw new BrowserInputError('Mouse target has no rendered box', target);
				const view = document.defaultView!;
				const x = (Math.max(0, rect.left) + Math.min(view.innerWidth, rect.right)) / 2;
				const y = (Math.max(0, rect.top) + Math.min(view.innerHeight, rect.bottom)) / 2;
				await moveViewport(Math.floor(x), Math.floor(y));
			},
			moveViewport,
			down: (button) => send({ type: 'down', button }),
			up: (button) => send({ type: 'up', button }),
		},
		reset: () => send({ type: 'reset' }),
	};
}
