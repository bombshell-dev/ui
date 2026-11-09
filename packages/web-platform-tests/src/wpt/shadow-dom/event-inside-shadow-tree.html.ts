import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function dispatchEventWithLog(target: Node, event: Event) {
		var log: (Node | EventTarget | null)[][] = [];

		for (
			var node: Node | null = target;
			node;
			node = node.parentNode || (node as ShadowRoot).host
		) {
			node.addEventListener(
				event.type,
				function (this: Node, event: Event) {
					log.push([this, event.target]);
				}.bind(node),
			);
		}

		target.dispatchEvent(event);

		return log;
	}
	function createShadowRootWithGrandChild(document: Document, mode: ShadowRootMode) {
		var host = document.createElement('div');
		var root = host.attachShadow({ mode: mode });

		var parent = document.createElement('span');
		root.appendChild(parent);

		var target = document.createElement('b');
		parent.appendChild(target);
		return { target: target, parent: parent, root: root, host: host };
	}
	function createNestedShadowRoot(
		document: Document,
		innerMode: ShadowRootMode,
		outerMode: ShadowRootMode,
	) {
		var outerHost = document.createElement('div');
		var outerRoot = outerHost.attachShadow({ mode: outerMode });

		var outerChild = document.createElement('p');
		outerRoot.appendChild(outerChild);

		var innerHost = document.createElement('span');
		outerChild.appendChild(innerHost);

		var innerRoot = innerHost.attachShadow({ mode: innerMode });
		var innerChild = document.createElement('span');
		innerRoot.appendChild(innerChild);

		return {
			target: innerChild,
			innerRoot: innerRoot,
			innerHost: innerHost,
			outerChild: outerChild,
			outerRoot: outerRoot,
			outerHost: outerHost,
		};
	}
	for (const mode of ['open', 'closed'] as const) {
		context.test(
			'Firing an event inside a grand child of a detached ' + mode + ' mode shadow tree',
			({ document, Event }) => {
				var shadow = createShadowRootWithGrandChild(document, mode);

				const log = dispatchEventWithLog(
					shadow.target,
					new Event('foo', { composed: true, bubbles: true }),
				);

				expect(
					log.length,
					'EventPath must contain [target, parent, shadow root, shadow host]',
				).toBe(4);
				{
					const actual = log[0]!;
					const expected = [shadow.target, shadow.target];
					expect(actual.length, 'EventPath[0] must be the target').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[0] must be the target').toBe(expected[index]);
				}
				{
					const actual = log[1]!;
					const expected = [shadow.parent, shadow.target];
					expect(actual.length, 'EventPath[1] must be the parent of the target').toBe(
						expected.length,
					);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[1] must be the parent of the target').toBe(
							expected[index],
						);
				}
				{
					const actual = log[2]!;
					const expected = [shadow.root, shadow.target];
					expect(actual.length, 'EventPath[2] must be the shadow root').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[2] must be the shadow root').toBe(expected[index]);
				}
				{
					const actual = log[3]!;
					const expected = [shadow.host, shadow.host];
					expect(actual.length, 'EventPath[3] must be the shadow host').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[3] must be the shadow host').toBe(expected[index]);
				}
			},
		);
		context.test(
			'Firing an event inside a grand child of an in-document ' + mode + ' mode shadow tree',
			({ document, Event }) => {
				var shadow = createShadowRootWithGrandChild(document, mode);
				document.body.appendChild(shadow.host);

				const log = dispatchEventWithLog(
					shadow.target,
					new Event('foo', { composed: true, bubbles: true }),
				);

				expect(
					log.length,
					'EventPath must contain [target, parent, shadow root, shadow host, body, html, document]',
				).toBe(7);
				{
					const actual = log[0]!;
					const expected = [shadow.target, shadow.target];
					expect(actual.length, 'EventPath[0] must be the target').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[0] must be the target').toBe(expected[index]);
				}
				{
					const actual = log[1]!;
					const expected = [shadow.parent, shadow.target];
					expect(actual.length, 'EventPath[1] must be the parent of the target').toBe(
						expected.length,
					);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[1] must be the parent of the target').toBe(
							expected[index],
						);
				}
				{
					const actual = log[2]!;
					const expected = [shadow.root, shadow.target];
					expect(actual.length, 'EventPath[2] must be the shadow root').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[2] must be the shadow root').toBe(expected[index]);
				}
				{
					const actual = log[3]!;
					const expected = [shadow.host, shadow.host];
					expect(actual.length, 'EventPath[3] must be the shadow host').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[3] must be the shadow host').toBe(expected[index]);
				}
				{
					const actual = log[4]!;
					const expected = [document.body, shadow.host];
					expect(
						actual.length,
						'EventPath[4] must be the body element (parent of shadow host)',
					).toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(
							actual[index],
							'EventPath[4] must be the body element (parent of shadow host)',
						).toBe(expected[index]);
				}
				{
					const actual = log[5]!;
					const expected = [document.documentElement, shadow.host];
					expect(actual.length, 'EventPath[5] must be the html element').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[5] must be the html element').toBe(expected[index]);
				}
				{
					const actual = log[6]!;
					const expected = [document, shadow.host];
					expect(actual.length, 'EventPath[6] must be the document node').toBe(expected.length);
					for (let index = 0; index < expected.length; index++)
						expect(actual[index], 'EventPath[6] must be the document node').toBe(expected[index]);
				}
			},
		);
	}
	for (const innerMode of ['open', 'closed'] as const)
		for (const outerMode of ['open', 'closed'] as const) {
			context.test(
				'Firing an event inside a detached ' +
					innerMode +
					' mode shadow tree inside ' +
					outerMode +
					' mode shadow tree',
				({ document, Event }) => {
					var shadow = createNestedShadowRoot(document, innerMode, outerMode);

					const log = dispatchEventWithLog(
						shadow.target,
						new Event('bar', { composed: true, bubbles: true }),
					);

					expect(
						log.length,
						'EventPath must contain [target, inner root, inner host, parent, outer root, outer host]',
					).toBe(6);
					{
						const actual = log[0]!;
						const expected = [shadow.target, shadow.target];
						expect(actual.length, 'EventPath[0] must be the target').toBe(expected.length);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[0] must be the target').toBe(expected[index]);
					}
					{
						const actual = log[1]!;
						const expected = [shadow.innerRoot, shadow.target];
						expect(actual.length, 'EventPath[1] must be the inner shadow root').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[1] must be the inner shadow root').toBe(
								expected[index],
							);
					}
					{
						const actual = log[2]!;
						const expected = [shadow.innerHost, shadow.innerHost];
						expect(actual.length, 'EventPath[2] must be the inner shadow host').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[2] must be the inner shadow host').toBe(
								expected[index],
							);
					}
					{
						const actual = log[3]!;
						const expected = [shadow.outerChild, shadow.innerHost];
						expect(actual.length, 'EventPath[3] must be the parent of the inner shadow host').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(
								actual[index],
								'EventPath[3] must be the parent of the inner shadow host',
							).toBe(expected[index]);
					}
					{
						const actual = log[4]!;
						const expected = [shadow.outerRoot, shadow.innerHost];
						expect(actual.length, 'EventPath[4] must be the outer shadow root').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[4] must be the outer shadow root').toBe(
								expected[index],
							);
					}
					{
						const actual = log[5]!;
						const expected = [shadow.outerHost, shadow.outerHost];
						expect(actual.length, 'EventPath[5] must be the outer shadow host').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[5] must be the outer shadow host').toBe(
								expected[index],
							);
					}
				},
			);
			context.test(
				'Firing an event inside an in-document ' +
					innerMode +
					' mode shadow tree inside ' +
					outerMode +
					' mode shadow tree',
				({ document, Event }) => {
					var shadow = createNestedShadowRoot(document, innerMode, outerMode);
					document.body.appendChild(shadow.outerHost);

					const log = dispatchEventWithLog(
						shadow.target,
						new Event('bar', { composed: true, bubbles: true }),
					);

					expect(
						log.length,
						'EventPath must contain [target, inner root, inner host, parent, outer root, outer host]',
					).toBe(9);
					{
						const actual = log[0]!;
						const expected = [shadow.target, shadow.target];
						expect(actual.length, 'EventPath[0] must be the target').toBe(expected.length);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[0] must be the target').toBe(expected[index]);
					}
					{
						const actual = log[1]!;
						const expected = [shadow.innerRoot, shadow.target];
						expect(actual.length, 'EventPath[1] must be the inner shadow root').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[1] must be the inner shadow root').toBe(
								expected[index],
							);
					}
					{
						const actual = log[2]!;
						const expected = [shadow.innerHost, shadow.innerHost];
						expect(actual.length, 'EventPath[2] must be the inner shadow host').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[2] must be the inner shadow host').toBe(
								expected[index],
							);
					}
					{
						const actual = log[3]!;
						const expected = [shadow.outerChild, shadow.innerHost];
						expect(actual.length, 'EventPath[3] must be the parent of the inner shadow host').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(
								actual[index],
								'EventPath[3] must be the parent of the inner shadow host',
							).toBe(expected[index]);
					}
					{
						const actual = log[4]!;
						const expected = [shadow.outerRoot, shadow.innerHost];
						expect(actual.length, 'EventPath[4] must be the outer shadow root').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[4] must be the outer shadow root').toBe(
								expected[index],
							);
					}
					{
						const actual = log[5]!;
						const expected = [shadow.outerHost, shadow.outerHost];
						expect(actual.length, 'EventPath[5] must be the outer shadow host').toBe(
							expected.length,
						);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[5] must be the outer shadow host').toBe(
								expected[index],
							);
					}
					{
						const actual = log[6]!;
						const expected = [document.body, shadow.outerHost];
						expect(actual.length, 'EventPath[6] must be the body element').toBe(expected.length);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[6] must be the body element').toBe(expected[index]);
					}
					{
						const actual = log[7]!;
						const expected = [document.documentElement, shadow.outerHost];
						expect(actual.length, 'EventPath[7] must be the html element').toBe(expected.length);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[7] must be the html element').toBe(expected[index]);
					}
					{
						const actual = log[8]!;
						const expected = [document, shadow.outerHost];
						expect(actual.length, 'EventPath[8] must be the document node').toBe(expected.length);
						for (let index = 0; index < expected.length; index++)
							expect(actual[index], 'EventPath[8] must be the document node').toBe(expected[index]);
					}
				},
			);
		}
}
