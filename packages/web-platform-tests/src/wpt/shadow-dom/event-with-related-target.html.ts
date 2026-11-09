import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function dispatchEventWithEventLog(
		shadow: Record<string, Node>,
		target: Node,
		event: MouseEvent,
	) {
		var eventPath: (string | undefined)[] = [];
		var targets: (EventTarget | null)[] = [];
		var relatedTargets: (string | undefined | null)[] = [];
		var pathAtTargets: (string | undefined)[][] = [];

		var attachedNodes: Node[] = [];
		for (var nodeKey in shadow) {
			var startingNode = shadow[nodeKey]!;
			for (var node: Node | null = startingNode; node; node = node.parentNode) {
				if (attachedNodes.indexOf(node) >= 0) continue;
				attachedNodes.push(node);
				node.addEventListener(
					event.type,
					function (this: Node & { label?: string }, event: Event) {
						eventPath.push(this.label);
						relatedTargets.push(
							(event as MouseEvent).relatedTarget
								? ((event as MouseEvent).relatedTarget as Node & { label?: string }).label
								: null,
						);

						pathAtTargets.push(
							event.composedPath().map(function (node) {
								return (node as Node & { label?: string }).label;
							}),
						);
						targets.push(event.target);
					}.bind(node),
				);
			}
		}

		target.dispatchEvent(event);

		return {
			event: event,
			targets: targets,
			eventPath: eventPath,
			relatedTargets: relatedTargets,
			pathAtTargets: pathAtTargets,
		};
	}
	function createFixedTestTree(document: Document, mode: ShadowRootMode) {
		var namedNodes: Record<string, Node> = {};

		function element(name: string, ..._children: (Node | ((element: HTMLElement) => void))[]) {
			var element = document.createElement(
				name.indexOf('-S') > 0 ? 'slot' : 'div',
			) as unknown as HTMLElement & { label: string };
			element.label = name;
			namedNodes[name] = element;
			for (var i = 1; i < arguments.length; i++) {
				var item = arguments[i];
				if (typeof item == 'function') item(element);
				else element.appendChild(item);
			}
			return element;
		}

		function shadow(name: string, ..._children: Node[]) {
			var children: Node[] = [];
			for (var i = 1; i < arguments.length; i++) children.push(arguments[i]);
			return function (element: HTMLElement) {
				var shadowRoot = element.attachShadow({ mode: mode });
				(shadowRoot as ShadowRoot & { label: string }).label = name;
				namedNodes[name] = shadowRoot;
				for (var child of children) shadowRoot.appendChild(child);
			};
		}

		var host = element(
			'A',
			shadow('A-SR', element('A1', shadow('A1-SR', element('A1a'))), element('A2-S')),
			element(
				'B',
				shadow(
					'B-SR',
					element(
						'B1',
						shadow(
							'B1-SR',
							element('B1b', shadow('B1b-SR', element('B1b1'), element('B1b2'))),
							element('B1c-S'),
						),
						element('B1a'),
					),
				),
				element('C'),
				element('D', shadow('D-SR', element('D1'))),
			),
		);

		return namedNodes;
	}
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			'Firing an event at B1a with relatedNode at B1 with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.B1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.B1! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['B1a', 'B1c-S', 'B1-SR', 'B1', 'B-SR'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['B1', 'B1', 'B1', 'B1', 'B1'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at B1a with relatedNode at B1b1 with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.B1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.B1b1! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['B1a', 'B1c-S', 'B1-SR', 'B1', 'B-SR'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['B1', 'B1b', 'B1b', 'B1', 'B1'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at B1b1 with relatedNode at B1a with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.B1b1!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.B1a! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['B1b1', 'B1b-SR', 'B1b', 'B1-SR', 'B1', 'B-SR'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['B1a', 'B1a', 'B1a', 'B1a', 'B1a', 'B1a'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at B1a with relatedNode at D1 with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.B1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.D1! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['B1a', 'B1c-S', 'B1-SR', 'B1', 'B-SR', 'B', 'A2-S', 'A-SR', 'A'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'D'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at D1 with relatedNode at B1a with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.D1!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.B1a! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['D1', 'D-SR', 'D', 'B', 'A2-S', 'A-SR', 'A'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['B', 'B', 'B', 'B', 'B', 'B', 'B'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at B1a with relatedNode at A1a with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.B1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.A1a! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['B1a', 'B1c-S', 'B1-SR', 'B1', 'B-SR', 'B', 'A2-S', 'A-SR', 'A'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['A', 'A', 'A', 'A', 'A', 'A', 'A1', 'A1', 'A'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at A1a with relatedNode at B1a with ' + mode + ' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				const log = dispatchEventWithEventLog(
					nodes,
					nodes.A1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.B1a! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['A1a', 'A1-SR', 'A1', 'A-SR', 'A'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['B', 'B', 'B', 'B', 'B'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at B1a with relatedNode at A1a (detached) with ' +
				mode +
				' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				nodes['A-SR']!.removeChild(nodes.A1!);
				const log = dispatchEventWithEventLog(
					nodes,
					nodes.B1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.A1a! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['B1a', 'B1c-S', 'B1-SR', 'B1', 'B-SR', 'B', 'A2-S', 'A-SR', 'A'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1', 'A1'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event at A1a with relatedNode at B1a (detached) with ' +
				mode +
				' mode shadow trees',
			({ document, MouseEvent }) => {
				var nodes = createFixedTestTree(document, mode);

				nodes['A-SR']!.removeChild(nodes.A1!);
				const log = dispatchEventWithEventLog(
					nodes,
					nodes.A1a!,
					new MouseEvent('foo', { bubbles: true, composed: true, relatedTarget: nodes.B1a! }),
				);

				{
					const actual = log.eventPath;
					const expected = ['A1a', 'A1-SR', 'A1'];
					expect(actual.length, 'The event path must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The event path must be correct.').toBe(expected[index]);
				}
				{
					const actual = log.relatedTargets;
					const expected = ['B', 'B', 'B'];
					expect(actual.length, 'The related targets must be correct.').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'The related targets must be correct.').toBe(expected[index]);
				}
			},
		);
	}
}
