import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		context.test(
			'the this value inside the event listener callback should be the node',
			({ document, CustomEvent, step }) => {
				const nodes = [
					document.createElement('p'),
					document.createTextNode('some text'),
					document.createDocumentFragment(),
					document.createComment('a comment'),
					document.createProcessingInstruction('target', 'data'),
				];

				let callCount = 0;
				for (const node of nodes) {
					node.addEventListener(
						'someevent',
						step(function (this: Node) {
							++callCount;
							expect(this).toBe(node);
						}),
					);

					node.dispatchEvent(new CustomEvent('someevent'));
				}

				expect(callCount).toBe(nodes.length);
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test(
			'the this value inside the event listener object handleEvent should be the object',
			({ document, CustomEvent, step }) => {
				const nodes = [
					document.createElement('p'),
					document.createTextNode('some text'),
					document.createDocumentFragment(),
					document.createComment('a comment'),
					document.createProcessingInstruction('target', 'data'),
				];

				let callCount = 0;
				for (const node of nodes) {
					const handler = {
						handleEvent: step(function (this: EventListenerObject) {
							++callCount;
							expect(this).toBe(handler);
						}),
					};

					node.addEventListener('someevent', handler);

					node.dispatchEvent(new CustomEvent('someevent'));
				}

				expect(callCount).toBe(nodes.length);
			},
		);
		context.test(
			'dispatchEvent should invoke the current handleEvent method of the object',
			({ document, CustomEvent, step }) => {
				const nodes = [
					document.createElement('p'),
					document.createTextNode('some text'),
					document.createDocumentFragment(),
					document.createComment('a comment'),
					document.createProcessingInstruction('target', 'data'),
				];

				let callCount = 0;
				for (const node of nodes) {
					const handler = {
						handleEvent: step(function (this: EventListenerObject) {
							expect.unreachable('should not call the old handleEvent method');
						}),
					};

					node.addEventListener('someevent', handler);
					handler.handleEvent = step(function (this: EventListenerObject) {
						++callCount;
						expect(this).toBe(handler);
					});

					node.dispatchEvent(new CustomEvent('someevent'));
				}

				expect(callCount).toBe(nodes.length);
			},
		);
		context.test(
			'addEventListener should not require handleEvent to be defined on object listeners',
			({ document, CustomEvent, step }) => {
				const nodes = [
					document.createElement('p'),
					document.createTextNode('some text'),
					document.createDocumentFragment(),
					document.createComment('a comment'),
					document.createProcessingInstruction('target', 'data'),
				];

				let callCount = 0;
				for (const node of nodes) {
					const handler = {} as EventListenerObject;

					node.addEventListener('someevent', handler);
					handler.handleEvent = step(function (this: EventListenerObject) {
						++callCount;
						expect(this).toBe(handler);
					});

					node.dispatchEvent(new CustomEvent('someevent'));
				}

				expect(callCount).toBe(nodes.length);
			},
		);
		context.test(
			'handleEvent properties added to a function before addEventListener are not reached',
			({ document, CustomEvent, step }) => {
				const nodes = [
					document.createElement('p'),
					document.createTextNode('some text'),
					document.createDocumentFragment(),
					document.createComment('a comment'),
					document.createProcessingInstruction('target', 'data'),
				];

				let callCount = 0;
				for (const node of nodes) {
					const handler = step(function (this: Node) {
						++callCount;
						expect(this).toBe(node);
					}) as EventListener & { handleEvent?: () => void };

					handler.handleEvent = step(() => {
						expect.unreachable('should not call the handleEvent method on a function');
					});

					node.addEventListener('someevent', handler);

					node.dispatchEvent(new CustomEvent('someevent'));
				}

				expect(callCount).toBe(nodes.length);
			},
		);
		context.test(
			'handleEvent properties added to a function after addEventListener are not reached',
			({ document, CustomEvent, step }) => {
				const nodes = [
					document.createElement('p'),
					document.createTextNode('some text'),
					document.createDocumentFragment(),
					document.createComment('a comment'),
					document.createProcessingInstruction('target', 'data'),
				];

				let callCount = 0;
				for (const node of nodes) {
					const handler = step(function (this: Node) {
						++callCount;
						expect(this).toBe(node);
					}) as EventListener & { handleEvent?: () => void };

					node.addEventListener('someevent', handler);

					handler.handleEvent = step(() => {
						expect.unreachable('should not call the handleEvent method on a function');
					});

					node.dispatchEvent(new CustomEvent('someevent'));
				}

				expect(callCount).toBe(nodes.length);
			},
		);
	}
}
