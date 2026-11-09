import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function treeName(mode: ShadowRootMode, connectedToDocument: boolean) {
		return (
			(mode == 'open' ? 'an ' : 'a ') +
			mode +
			' shadow root ' +
			(connectedToDocument ? '' : ' not') +
			' in a document'
		);
	}
	for (const [mode, connectedToDocument] of [
		['open', true],
		['closed', true],
		['open', false],
		['closed', false],
	] as const) {
		context.test(
			'slotchange event must fire at the end of current microtask after mutation observers are invoked inside ' +
				treeName(mode, connectedToDocument) +
				" when slots's contents change",
			async ({ document, MutationObserver, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					let slot!: HTMLSlotElement;
					var eventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						slot = document.createElement('slot');

						slot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.type, 'slotchange event\'s type must be "slotchange"').toBe(
									'slotchange',
								);
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									slot,
								);
							})();
							eventCount++;
						});

						shadowRoot.appendChild(slot);
					})();

					var element = document.createElement('div');

					new MutationObserver(function () {
						step(function () {
							expect(
								eventCount,
								'slotchange event must not be fired before mutation records are delivered',
							).toBe(0);
						})();
						host.appendChild(document.createElement('span'));
						element.setAttribute('title', 'bar');
					}).observe(element, { attributes: true, attributeFilter: ['id'] });

					new MutationObserver(function () {
						step(function () {
							expect(
								eventCount,
								'slotchange event must be fired during a single compound microtask',
							).toBe(1);
						})();
					}).observe(element, { attributes: true, attributeFilter: ['title'] });

					element.setAttribute('id', 'foo');
					host.appendChild(document.createElement('div'));

					setTimeout(function () {
						step(function () {
							expect(
								eventCount,
								'a distinct slotchange event must be enqueued for changes made during a mutation observer delivery',
							).toBe(2);
						})();
						resolve();
					}, 0);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content: `<!DOCTYPE html>
<html>
<head>
<title>Shadow DOM: slotchange event</title>
<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">
<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">



</head>
<body>
<div id="log"></div>

</body>
</html>
`,
				},
			},
		);
	}

	function testAppendingSpanToShadowRootWithDefaultSlot(
		mode: ShadowRootMode,
		connectedToDocument: boolean,
	) {
		context.test(
			'slotchange event must fire on a default slot element inside ' +
				treeName(mode, connectedToDocument),
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					let slot!: HTMLSlotElement;
					var eventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						slot = document.createElement('slot');

						slot.addEventListener('slotchange', function (event) {
							if ((event as Event & { isFakeEvent?: boolean }).isFakeEvent) return;

							step(function () {
								expect(event.type, 'slotchange event\'s type must be "slotchange"').toBe(
									'slotchange',
								);
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									slot,
								);
								expect(
									(event as Event & { relatedTarget?: EventTarget }).relatedTarget,
									'slotchange must not set relatedTarget',
								).toBe(undefined);
							})();
							eventCount++;
						});

						shadowRoot.appendChild(slot);

						host.appendChild(document.createElement('span'));
						host.appendChild(document.createElement('b'));

						expect(eventCount, 'slotchange event must not be fired synchronously').toBe(0);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								eventCount,
								'slotchange must be fired exactly once after the assigned nodes changed',
							).toBe(1);

							host.appendChild(document.createElement('i'));
						})();

						setTimeout(function () {
							step(function () {
								expect(
									eventCount,
									'slotchange must be fired exactly once after the assigned nodes changed',
								).toBe(2);

								host.appendChild(document.createTextNode('hello'));

								var fakeEvent = new Event('slotchange') as Event & { isFakeEvent?: boolean };
								fakeEvent.isFakeEvent = true;
								slot.dispatchEvent(fakeEvent);
							})();

							setTimeout(function () {
								step(function () {
									expect(
										eventCount,
										'slotchange must be fired exactly once after the assigned nodes changed' +
											' event if there was a synthetic slotchange event fired',
									).toBe(3);
								})();
								resolve();
							}, 1);
						}, 1);
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testAppendingSpanToShadowRootWithDefaultSlot('open', true);
	testAppendingSpanToShadowRootWithDefaultSlot('open', false);
	testAppendingSpanToShadowRootWithDefaultSlot('closed', true);
	testAppendingSpanToShadowRootWithDefaultSlot('closed', false);
	function testAppendingSpanToShadowRootWithNamedSlot(
		mode: ShadowRootMode,
		connectedToDocument: boolean,
	) {
		context.test(
			'slotchange event must fire on a named slot element inside' +
				treeName(mode, connectedToDocument),
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					let slot!: HTMLSlotElement;
					var eventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						slot = document.createElement('slot');
						slot.name = 'someSlot';

						slot.addEventListener('slotchange', function (event) {
							if ((event as Event & { isFakeEvent?: boolean }).isFakeEvent) return;

							step(function () {
								expect(event.type, 'slotchange event\'s type must be "slotchange"').toBe(
									'slotchange',
								);
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									slot,
								);
								expect(
									(event as Event & { relatedTarget?: EventTarget }).relatedTarget,
									'slotchange must not set relatedTarget',
								).toBe(undefined);
							})();
							eventCount++;
						});

						shadowRoot.appendChild(slot);

						var span = document.createElement('span');
						span.slot = 'someSlot';
						host.appendChild(span);

						var b = document.createElement('b');
						b.slot = 'someSlot';
						host.appendChild(b);

						expect(eventCount, 'slotchange event must not be fired synchronously').toBe(0);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								eventCount,
								'slotchange must be fired exactly once after the assigned nodes changed',
							).toBe(1);

							var i = document.createElement('i');
							i.slot = 'someSlot';
							host.appendChild(i);
						})();

						setTimeout(function () {
							step(function () {
								expect(
									eventCount,
									'slotchange must be fired exactly once after the assigned nodes changed',
								).toBe(2);

								var em = document.createElement('em');
								em.slot = 'someSlot';
								host.appendChild(em);

								var fakeEvent = new Event('slotchange') as Event & { isFakeEvent?: boolean };
								fakeEvent.isFakeEvent = true;
								slot.dispatchEvent(fakeEvent);
							})();

							setTimeout(function () {
								step(function () {
									expect(
										eventCount,
										'slotchange must be fired exactly once after the assigned nodes changed' +
											' event if there was a synthetic slotchange event fired',
									).toBe(3);
								})();
								resolve();
							}, 1);
						}, 1);
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testAppendingSpanToShadowRootWithNamedSlot('open', true);
	testAppendingSpanToShadowRootWithNamedSlot('open', false);
	testAppendingSpanToShadowRootWithNamedSlot('closed', true);
	testAppendingSpanToShadowRootWithNamedSlot('closed', false);
	function testSlotchangeDoesNotFireWhenOtherSlotsChange(
		mode: ShadowRootMode,
		connectedToDocument: boolean,
	) {
		context.test(
			'slotchange event must not fire on a slot element inside ' +
				treeName(mode, connectedToDocument) +
				" when another slot's assigned nodes change",
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					var defaultSlotEventCount = 0;
					var namedSlotEventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						var defaultSlot = document.createElement('slot');
						defaultSlot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									defaultSlot,
								);
							})();
							defaultSlotEventCount++;
						});

						var namedSlot = document.createElement('slot');
						namedSlot.name = 'slotName';
						namedSlot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									namedSlot,
								);
							})();
							namedSlotEventCount++;
						});

						shadowRoot.appendChild(defaultSlot);
						shadowRoot.appendChild(namedSlot);

						host.appendChild(document.createElement('span'));

						expect(defaultSlotEventCount, 'slotchange event must not be fired synchronously').toBe(
							0,
						);
						expect(namedSlotEventCount, 'slotchange event must not be fired synchronously').toBe(0);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								defaultSlotEventCount,
								'slotchange must be fired exactly once after the assigned nodes change on a default slot',
							).toBe(1);
							expect(
								namedSlotEventCount,
								'slotchange must not be fired on a named slot after the assigned nodes change on a default slot',
							).toBe(0);

							var span = document.createElement('span');
							span.slot = 'slotName';
							host.appendChild(span);
						})();

						setTimeout(function () {
							step(function () {
								expect(
									defaultSlotEventCount,
									'slotchange must not be fired on a default slot after the assigned nodes change on a named slot',
								).toBe(1);
								expect(
									namedSlotEventCount,
									'slotchange must be fired exactly once after the assigned nodes change on a default slot',
								).toBe(1);
							})();
							resolve();
						}, 1);
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testSlotchangeDoesNotFireWhenOtherSlotsChange('open', true);
	testSlotchangeDoesNotFireWhenOtherSlotsChange('open', false);
	testSlotchangeDoesNotFireWhenOtherSlotsChange('closed', true);
	testSlotchangeDoesNotFireWhenOtherSlotsChange('closed', false);
	function testSlotchangeDoesFireAtInsertedAndDoesNotFireForMutationAfterRemoved(
		mode: ShadowRootMode,
		connectedToDocument: boolean,
	) {
		context.test(
			'slotchange event must fire on a slot element when a shadow host has a slottable and the slot was inserted' +
				' and must not fire when the shadow host was mutated after the slot was removed inside ' +
				treeName(mode, connectedToDocument),
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					let slot!: HTMLSlotElement;
					var eventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						slot = document.createElement('slot');
						slot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									slot,
								);
							})();
							eventCount++;
						});

						host.appendChild(document.createElement('span'));
						shadowRoot.appendChild(slot);

						expect(eventCount, 'slotchange event must not be fired synchronously').toBe(0);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								eventCount,
								'slotchange must be fired on a slot element if there is assigned nodes when the slot was inserted',
							).toBe(1);
							host.removeChild(host.firstChild!);
						})();

						setTimeout(function () {
							step(function () {
								expect(
									eventCount,
									'slotchange must be fired after the assigned nodes change on a slot while the slot element was in the tree',
								).toBe(2);
								slot.parentNode!.removeChild(slot);
								host.appendChild(document.createElement('span'));
							})();

							setTimeout(function () {
								expect(
									eventCount,
									'slotchange must not be fired on a slot element if the assigned nodes changed after the slot was removed',
								).toBe(2);
								resolve();
							}, 1);
						}, 1);
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testSlotchangeDoesFireAtInsertedAndDoesNotFireForMutationAfterRemoved('open', true);
	testSlotchangeDoesFireAtInsertedAndDoesNotFireForMutationAfterRemoved('open', false);
	testSlotchangeDoesFireAtInsertedAndDoesNotFireForMutationAfterRemoved('closed', true);
	testSlotchangeDoesFireAtInsertedAndDoesNotFireForMutationAfterRemoved('closed', false);
	function testSlotchangeFiresOnTransientlyPresentSlot(
		mode: ShadowRootMode,
		connectedToDocument: boolean,
	) {
		context.test(
			'slotchange event must fire on a slot element inside ' +
				treeName(mode, connectedToDocument) +
				' even if the slot was removed immediately after the assigned nodes were mutated',
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					let slot!: HTMLSlotElement;
					let anotherSlot!: HTMLSlotElement;
					var slotEventCount = 0;
					var anotherSlotEventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						slot = document.createElement('slot');
						slot.name = 'someSlot';
						slot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									slot,
								);
							})();
							slotEventCount++;
						});

						anotherSlot = document.createElement('slot');
						anotherSlot.name = 'someSlot';
						anotherSlot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									anotherSlot,
								);
							})();
							anotherSlotEventCount++;
						});

						shadowRoot.appendChild(slot);

						var span = document.createElement('span');
						span.slot = 'someSlot';
						host.appendChild(span);

						shadowRoot.removeChild(slot);
						shadowRoot.appendChild(anotherSlot);

						var span = document.createElement('span');
						span.slot = 'someSlot';
						host.appendChild(span);

						shadowRoot.removeChild(anotherSlot);

						expect(slotEventCount, 'slotchange event must not be fired synchronously').toBe(0);
						expect(anotherSlotEventCount, 'slotchange event must not be fired synchronously').toBe(
							0,
						);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								slotEventCount,
								'slotchange must be fired on a slot element if the assigned nodes changed while the slot was present',
							).toBe(1);
							expect(
								anotherSlotEventCount,
								'slotchange must be fired on a slot element if the assigned nodes changed while the slot was present',
							).toBe(1);
						})();
						resolve();
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testSlotchangeFiresOnTransientlyPresentSlot('open', true);
	testSlotchangeFiresOnTransientlyPresentSlot('open', false);
	testSlotchangeFiresOnTransientlyPresentSlot('closed', true);
	testSlotchangeFiresOnTransientlyPresentSlot('closed', false);
	function testSlotchangeFiresOnInnerHTML(mode: ShadowRootMode, connectedToDocument: boolean) {
		context.test(
			'slotchange event must fire on a slot element inside ' +
				treeName(mode, connectedToDocument) +
				' when innerHTML modifies the children of the shadow host',
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					let host!: HTMLElement;
					let defaultSlot!: HTMLSlotElement;
					let namedSlot!: HTMLSlotElement;
					var defaultSlotEventCount = 0;
					var namedSlotEventCount = 0;

					step(function () {
						host = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(host);

						var shadowRoot = host.attachShadow({ mode: mode });
						defaultSlot = document.createElement('slot');
						defaultSlot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									defaultSlot,
								);
							})();
							defaultSlotEventCount++;
						});

						namedSlot = document.createElement('slot');
						namedSlot.name = 'someSlot';
						namedSlot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									namedSlot,
								);
							})();
							namedSlotEventCount++;
						});
						shadowRoot.appendChild(namedSlot);
						shadowRoot.appendChild(defaultSlot);
						host.innerHTML = 'foo <b>bar</b>';

						expect(defaultSlotEventCount, 'slotchange event must not be fired synchronously').toBe(
							0,
						);
						expect(namedSlotEventCount, 'slotchange event must not be fired synchronously').toBe(0);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								defaultSlotEventCount,
								'slotchange must be fired on a slot element if the assigned nodes are changed by innerHTML',
							).toBe(1);
							expect(
								namedSlotEventCount,
								'slotchange must not be fired on a slot element if the assigned nodes are not changed by innerHTML',
							).toBe(0);
							host.innerHTML = 'baz';
						})();
						setTimeout(function () {
							step(function () {
								expect(
									defaultSlotEventCount,
									'slotchange must be fired on a slot element if the assigned nodes are changed by innerHTML',
								).toBe(2);
								expect(
									namedSlotEventCount,
									'slotchange must not be fired on a slot element if the assigned nodes are not changed by innerHTML',
								).toBe(0);
								host.innerHTML = '';
							})();
							setTimeout(function () {
								step(function () {
									expect(
										defaultSlotEventCount,
										'slotchange must be fired on a slot element if the assigned nodes are changed by innerHTML',
									).toBe(3);
									expect(
										namedSlotEventCount,
										'slotchange must not be fired on a slot element if the assigned nodes are not changed by innerHTML',
									).toBe(0);
									host.innerHTML = '<b slot="someSlot">content</b>';
								})();
								setTimeout(function () {
									step(function () {
										expect(
											defaultSlotEventCount,
											'slotchange must not be fired on a slot element if the assigned nodes are not changed by innerHTML',
										).toBe(3);
										expect(
											namedSlotEventCount,
											'slotchange must not be fired on a slot element if the assigned nodes are changed by innerHTML',
										).toBe(1);
										host.innerHTML = '';
									})();
									setTimeout(function () {
										step(function () {
											// FIXME: This test would fail in the current implementation because we can't tell
											// whether a text node was removed in AllChildrenRemoved or not.
											//                            assert_equals(defaultSlotEventCount, 3,
											//                                'slotchange must not be fired on a slot element if the assigned nodes are not changed by innerHTML');
											expect(
												namedSlotEventCount,
												'slotchange must not be fired on a slot element if the assigned nodes are changed by innerHTML',
											).toBe(2);
										})();
										resolve();
									}, 1);
								}, 1);
							}, 1);
						}, 1);
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testSlotchangeFiresOnInnerHTML('open', true);
	testSlotchangeFiresOnInnerHTML('open', false);
	testSlotchangeFiresOnInnerHTML('closed', true);
	testSlotchangeFiresOnInnerHTML('closed', false);
	function testSlotchangeFiresWhenNestedSlotChange(
		mode: ShadowRootMode,
		connectedToDocument: boolean,
	) {
		context.test(
			'slotchange event must fire on a slot element inside ' +
				treeName(mode, connectedToDocument) +
				" when nested slots's contents change",
			async ({ document, Event, step }) => {
				await new Promise<void>((resolve) => {
					var outerHost;
					var innerHost;
					let outerSlot!: HTMLSlotElement;
					let innerSlot!: HTMLSlotElement;
					var outerSlotEventCount = 0;
					var innerSlotEventCount = 0;

					step(function () {
						outerHost = document.createElement('div');
						if (connectedToDocument) document.body.appendChild(outerHost);

						var outerShadow = outerHost.attachShadow({ mode: mode });
						outerShadow.appendChild(document.createElement('span'));
						outerSlot = document.createElement('slot');
						outerSlot.addEventListener('slotchange', function (event) {
							step(function () {
								expect(event.target, "slotchange event's target must be the slot element").toBe(
									outerSlot,
								);
							})();
							outerSlotEventCount++;
						});

						innerHost = document.createElement('div');
						innerHost.appendChild(outerSlot);
						outerShadow.appendChild(innerHost);

						var innerShadow = innerHost.attachShadow({ mode: mode });
						innerShadow.appendChild(document.createElement('span'));
						innerSlot = document.createElement('slot');
						innerSlot.addEventListener('slotchange', function (event) {
							event.stopPropagation();
							step(function () {
								if (innerSlotEventCount === 0) {
									expect(
										event.target,
										"slotchange event's target must be the inner slot element at 1st slotchange",
									).toBe(innerSlot);
								} else if (innerSlotEventCount === 1) {
									expect(
										event.target,
										"slotchange event's target must be the outer slot element at 2nd sltochange",
									).toBe(outerSlot);
								}
							})();
							innerSlotEventCount++;
						});
						innerShadow.appendChild(innerSlot);

						outerHost.appendChild(document.createElement('span'));

						expect(innerSlotEventCount, 'slotchange event must not be fired synchronously').toBe(0);
						expect(outerSlotEventCount, 'slotchange event must not be fired synchronously').toBe(0);
					})();

					setTimeout(function () {
						step(function () {
							expect(
								outerSlotEventCount,
								'slotchange must be fired on a slot element if the assigned nodes changed',
							).toBe(1);
							expect(
								innerSlotEventCount,
								'slotchange must be fired on a slot element and must bubble',
							).toBe(2);
						})();
						resolve();
					}, 1);
				});
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<html>\n<head>\n<title>Shadow DOM: slotchange event</title>\n<meta name="author" title="Ryosuke Niwa" href="mailto:rniwa@webkit.org">\n<meta name="author" title="Hayato Ito" href="mailto:hayato@google.com">\n<link rel="help" href="https://dom.spec.whatwg.org/#signaling-slot-change">\n\n\n</head>\n<body>\n<div id="log"></div>\n\n</body>\n</html>\n',
				},
			},
		);
	}
	testSlotchangeFiresWhenNestedSlotChange('open', true);
	testSlotchangeFiresWhenNestedSlotChange('open', false);
	testSlotchangeFiresWhenNestedSlotChange('closed', true);
	testSlotchangeFiresWhenNestedSlotChange('closed', false);
}
