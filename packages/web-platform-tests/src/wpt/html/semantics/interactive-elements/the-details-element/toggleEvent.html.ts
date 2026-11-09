import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function testEvent(evt: ToggleEvent, ToggleEvent: typeof globalThis.ToggleEvent) {
		expect(evt.isTrusted, 'event is trusted').toBe(true);
		expect(evt.bubbles, "event doesn't bubble").toBe(false);
		expect(evt.cancelable, 'event is not cancelable').toBe(false);
		expect(Object.getPrototypeOf(evt), 'Prototype of toggle event is ToggleEvent.prototype').toBe(
			ToggleEvent.prototype,
		);
	}
	{
		const content = `<!doctype html><details id=details1>
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Adding open to 'details' should fire a toggle event at the 'details' element, with 'oldState: closed' and 'newState: open'",
			async (fixture) => {
				const { document } = fixture;
				const details1 = document.getElementById('details1') as HTMLDetailsElement;
				const ToggleEvent = fixture.ToggleEvent;
				await new Promise<void>((resolve) => {
					details1.ontoggle = (evt) => {
						fixture.step(() => {
							expect((evt as ToggleEvent).oldState).toBe('closed');
							expect((evt as ToggleEvent).newState).toBe('open');
							expect(details1.open).toBe(true);
							testEvent(evt as ToggleEvent, ToggleEvent);
						})();
						resolve();
					};
					details1.open = true;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const content = `<!doctype html><details id=details2>
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Adding open to 'details' and then removing open from that 'details' should fire only one toggle event at the 'details' element, with 'oldState: closed' and 'newState: closed'",
			async (fixture) => {
				const { document } = fixture;
				const details2 = document.getElementById('details2') as HTMLDetailsElement;
				const ToggleEvent = fixture.ToggleEvent;
				await new Promise<void>((resolve) => {
					details2.ontoggle = (evt) => {
						fixture.step(() => {
							expect((evt as ToggleEvent).oldState).toBe('closed');
							expect((evt as ToggleEvent).newState).toBe('closed');
							expect(details2.open).toBe(false);
							testEvent(evt as ToggleEvent, ToggleEvent);
						})();
						resolve();
					};
					details2.open = true;
					details2.open = false;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const content = `<!doctype html><details id=details3 style="display:none;">
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Adding open to 'details' (display:none) should fire a toggle event at the 'details' element, with 'oldState: closed' and 'newState: open'",
			async (fixture) => {
				const { document } = fixture;
				const details3 = document.getElementById('details3') as HTMLDetailsElement;
				const ToggleEvent = fixture.ToggleEvent;
				await new Promise<void>((resolve) => {
					details3.ontoggle = (evt) => {
						fixture.step(() => {
							expect((evt as ToggleEvent).oldState).toBe('closed');
							expect((evt as ToggleEvent).newState).toBe('open');
							expect(details3.open).toBe(true);
							testEvent(evt as ToggleEvent, ToggleEvent);
						})();
						resolve();
					};
					details3.open = true;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const content = '<!doctype html><details id=details4>\n</details>';
		context.test(
			"Adding open to 'details' (no children) should fire a toggle event at the 'details' element, with 'oldState: closed' and 'newState: open'",
			async (fixture) => {
				const { document } = fixture;
				const details4 = document.getElementById('details4') as HTMLDetailsElement;
				const ToggleEvent = fixture.ToggleEvent;
				await new Promise<void>((resolve) => {
					details4.ontoggle = (evt) => {
						fixture.step(() => {
							expect((evt as ToggleEvent).oldState).toBe('closed');
							expect((evt as ToggleEvent).newState).toBe('open');
							expect(details4.open).toBe(true);
							testEvent(evt as ToggleEvent, ToggleEvent);
						})();
						resolve();
					};
					details4.open = true;
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const content = `<!doctype html><details id=details7>
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Adding open to 'details' using setAttribute('open', '') should fire a toggle event at the 'details' element, with 'oldState: closed' and 'newState: open'",
			async (fixture) => {
				const { document } = fixture;
				const details7 = document.getElementById('details7') as HTMLDetailsElement;
				const ToggleEvent = fixture.ToggleEvent;
				await new Promise<void>((resolve) => {
					details7.ontoggle = (evt) => {
						fixture.step(() => {
							expect((evt as ToggleEvent).oldState).toBe('closed');
							expect((evt as ToggleEvent).newState).toBe('open');
							expect(details7.open).toBe(true);
							testEvent(evt as ToggleEvent, ToggleEvent);
						})();
						resolve();
					};
					details7.setAttribute('open', '');
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	{
		const content = `<!doctype html><details id=details8>
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Adding open to 'details' and then calling removeAttribute('open') should fire only one toggle event at the 'details' element, with 'oldState: closed' and 'newState: closed'",
			async (fixture) => {
				const { document } = fixture;
				const details8 = document.getElementById('details8') as HTMLDetailsElement;
				const ToggleEvent = fixture.ToggleEvent;
				await new Promise<void>((resolve) => {
					details8.ontoggle = (evt) => {
						fixture.step(() => {
							expect((evt as ToggleEvent).oldState).toBe('closed');
							expect((evt as ToggleEvent).newState).toBe('closed');
							expect(details8.open).toBe(false);
							testEvent(evt as ToggleEvent, ToggleEvent);
						})();
						resolve();
					};
					details8.open = true;
					details8.removeAttribute('open');
				});
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	context.test(
		"Adding open to 'details' (not in the document) should fire a toggle event at the 'details' element, with 'oldState: closed' and 'newState: open'",
		async ({ document, ToggleEvent, step }) => {
			let details5 = document.createElement('details');
			await new Promise<void>((resolve) => {
				details5.ontoggle = (evt) => {
					step(() => {
						expect((evt as ToggleEvent).oldState).toBe('closed');
						expect((evt as ToggleEvent).newState).toBe('open');
						expect(details5.open).toBe(true);
						testEvent(evt as ToggleEvent, ToggleEvent);
					})();
					resolve();
				};
				details5.open = true;
			});
		},
	);
	{
		const content = `<!doctype html><details id=details6>
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Adding open to 'details' and then removing open from that 'details' and then again adding open to that 'details' should fire only one toggle event at the 'details' element, with 'oldState: closed' and 'newState: closed'",
			async ({ document, step }) => {
				const details6 = document.getElementById('details6') as HTMLDetailsElement;
				let loop = false;
				details6.open = true;
				details6.open = false;
				details6.ontoggle = step((evt) => {
					if (loop) {
						expect.unreachable('toggle event fired twice');
					} else {
						expect((evt as ToggleEvent).oldState).toBe('closed');
						expect((evt as ToggleEvent).newState).toBe('closed');
						loop = true;
					}
				});
				await new Promise<void>((resolve) =>
					setTimeout(() => {
						step(() => expect(loop).toBe(true))();
						resolve();
					}, 0),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}

	{
		const content = `<!doctype html><details id=details10>
  <summary>Lorem ipsum</summary>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</details>`;
		context.test(
			"Setting open=false on a closed 'details' element should not fire a toggle event at the 'details' element",
			async ({ document, step }) => {
				const details10 = document.getElementById('details10') as HTMLDetailsElement;
				details10.ontoggle = step(() =>
					expect.unreachable('toggle event fired on closed details element'),
				);
				details10.open = false;
				await new Promise<void>((resolve) =>
					setTimeout(() => {
						step(() => expect(details10.open).toBe(false))();
						resolve();
					}, 0),
				);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
	context.test('Setting open from the parser fires a toggle event', async ({ DOMParser, step }) => {
		await new Promise<void>((resolve) => {
			new DOMParser()
				.parseFromString('<details open>', 'text/html')
				.querySelector('details')!.ontoggle = (e) => {
				step(() => expect((e.target as HTMLDetailsElement).open).toBe(true))();
				resolve();
			};
		});
	});
}
