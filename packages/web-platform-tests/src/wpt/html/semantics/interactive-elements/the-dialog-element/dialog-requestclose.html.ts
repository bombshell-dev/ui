import type { CompatibilityContext, DOMFixture } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function openDialog(dialog: HTMLDialogElement, openMethod: string) {
		expect(dialog.open).toBe(false);
		expect(dialog.matches('[open]')).toBe(false);
		switch (openMethod) {
			case 'modeless':
				dialog.show();
				break;
			case 'modal':
				dialog.showModal();
				break;
			case 'open':
				dialog.open = true;
				break;
			default:
				expect.unreachable('Unknown open method');
		}
		expect(dialog.open).toBe(true);
		expect(dialog.matches('[open]')).toBe(true);
		expect(dialog.matches(':modal')).toBe(openMethod === 'modal');
	}
	function setup(fixture: DOMFixture, dialog: HTMLDialogElement, closedby?: string | null) {
		fixture.cleanup(() => {
			dialog.close();
			dialog.removeAttribute('closedby');
			dialog.returnValue = '';
		});
		expect(dialog.hasAttribute('closedby')).toBe(false);
		if (closedby) {
			dialog.setAttribute('closedby', closedby);
		}
		const AbortController = fixture.AbortController;
		const controller = new AbortController();
		fixture.cleanup(() => controller.abort());
		return controller.signal;
	}
	const content =
		'<!doctype html>\n<meta charset="utf-8">\n\n\n\n\n\n\n\n<dialog>Dialog</dialog>\n\n\n';
	for (const openMethod of ['modeless', 'modal', 'open']) {
		for (const closedby of [null, 'any', 'closedrequest', 'none']) {
			const testDescription = `for ${openMethod} dialog with closedby=${closedby}`;
			context.test(
				`requestClose basic behavior ${testDescription}`,
				async (fixture) => {
					const { document } = fixture;
					const dialog = document.querySelector('dialog')!;

					setup(fixture, dialog, closedby);
					openDialog(dialog, openMethod);
					dialog.requestClose();
					expect(dialog.open).toBe(false);
					expect(dialog.matches('[open]')).toBe(false);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				`requestClose fires both cancel and close ${testDescription}`,
				async (fixture) => {
					const { document } = fixture;
					const dialog = document.querySelector('dialog')!;

					const signal = setup(fixture, dialog, closedby);
					let events: string[] = [];
					const { promise: untilFullyClosed, resolve: hasClosed } = Promise.withResolvers<void>();
					dialog.addEventListener('cancel', () => events.push('cancel'), { signal });
					dialog.addEventListener(
						'close',
						() => {
							events.push('close');
							hasClosed();
						},
						{ signal },
					);
					openDialog(dialog, openMethod);
					expect(events).toHaveLength(0);
					dialog.requestClose();
					expect(dialog.open).toBe(false);
					expect(dialog.matches('[open]')).toBe(false);
					expect(events, 'close is scheduled').toHaveLength(1);
					expect(events[0], 'close is scheduled').toBe('cancel');
					await untilFullyClosed;
					expect(events).toHaveLength(2);
					expect(events[0]).toBe('cancel');
					expect(events[1]).toBe('close');
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				`closedby has no effect on dialog.requestClose() ${testDescription}`,
				async (fixture) => {
					const { document } = fixture;
					const dialog = document.querySelector('dialog')!;

					const signal = setup(fixture, dialog, 'none');
					let events: string[] = [];
					const { promise: untilFullyClosed, resolve: hasClosed } = Promise.withResolvers<void>();
					const { promise: untilFullyClosedAgain, resolve: hasClosedAgain } =
						Promise.withResolvers<void>();
					const closeResolvers = [hasClosed, hasClosedAgain];
					dialog.addEventListener('cancel', () => events.push('cancel'), { signal });
					dialog.addEventListener(
						'close',
						() => {
							events.push('close');
							closeResolvers.shift()!();
						},
						{ signal },
					);
					openDialog(dialog, openMethod);
					dialog.setAttribute('closedby', closedby as unknown as string);
					expect(events).toHaveLength(0);
					dialog.requestClose();
					expect(dialog.open, 'Adding closedby after dialog is open').toBe(false);
					expect(dialog.matches('[open]')).toBe(false);
					expect(events).toHaveLength(1);
					expect(events[0]).toBe('cancel');
					await untilFullyClosed;
					events = [];
					openDialog(dialog, openMethod);
					dialog.removeAttribute('closedby');
					expect(events).toHaveLength(0);
					dialog.requestClose();
					expect(dialog.open, 'Removing closedby after dialog is open').toBe(false);
					expect(events).toHaveLength(1);
					expect(events[0]).toBe('cancel');
					await untilFullyClosedAgain;
					expect(events).toHaveLength(2);
					expect(events[0]).toBe('cancel');
					expect(events[1]).toBe('close');
				},
				{ document: { contentType: 'text/html', content } },
			);
			if (closedby !== 'none') {
				context.test(
					`requestClose can be cancelled ${testDescription}`,
					async (fixture) => {
						const { document } = fixture;
						const dialog = document.querySelector('dialog')!;

						const signal = setup(fixture, dialog, closedby);
						let shouldPreventDefault = true;
						dialog.addEventListener(
							'cancel',
							(e) => {
								if (shouldPreventDefault) {
									e.preventDefault();
								}
							},
							{ signal },
						);
						openDialog(dialog, openMethod);
						dialog.requestClose();
						expect(dialog.open, "cancel event was cancelled - dialog shouldn't close").toBe(true);
						expect(dialog.matches('[open]')).toBe(true);
						shouldPreventDefault = false;
						dialog.requestClose();
						expect(dialog.open, 'cancel event was not cancelled - dialog should now close').toBe(
							false,
						);
						expect(dialog.matches('[open]')).toBe(false);
					},
					{ document: { contentType: 'text/html', content } },
				);
				context.test(
					`requestClose avoids abuse prevention logic ${testDescription}`,
					async (fixture) => {
						const { document } = fixture;
						const dialog = document.querySelector('dialog')!;

						const signal = setup(fixture, dialog, closedby);
						dialog.addEventListener('cancel', (e) => e.preventDefault(), { signal });
						openDialog(dialog, openMethod);
						// No user activation here.
						dialog.requestClose();
						dialog.requestClose();
						dialog.requestClose();
						expect(dialog.open, "cancel event was cancelled - dialog shouldn't close").toBe(true);
						expect(dialog.matches('[open]')).toBe(true);
					},
					{ document: { contentType: 'text/html', content } },
				);
				context.test(
					`requestClose(returnValue) passes along the return value ${testDescription}`,
					async (fixture) => {
						const { document } = fixture;
						const dialog = document.querySelector('dialog')!;

						setup(fixture, dialog, closedby);
						openDialog(dialog, openMethod);
						expect(dialog.returnValue, 'Return value starts out empty').toBe('');
						const returnValue = 'The return value';
						dialog.requestClose(returnValue);
						expect(dialog.open).toBe(false);
						expect(dialog.matches('[open]')).toBe(false);
						expect(dialog.returnValue, 'Return value should be set').toBe(returnValue);
						dialog.show();
						dialog.close();
						expect(dialog.returnValue, 'Return value should not be changed by close()').toBe(
							returnValue,
						);
						dialog.show();
						dialog.close('another');
						expect(dialog.returnValue, 'Return value changes via close(value)').toBe('another');
					},
					{ document: { contentType: 'text/html', content } },
				);
				context.test(
					`requestClose(returnValue) doesn't change returnvalue when cancelled ${testDescription}`,
					async (fixture) => {
						const { document } = fixture;
						const dialog = document.querySelector('dialog')!;

						setup(fixture, dialog, closedby);
						dialog.addEventListener('cancel', (e) => e.preventDefault(), { once: true });
						openDialog(dialog, openMethod);
						dialog.returnValue = 'foo';
						expect(dialog.returnValue).toBe('foo');
						dialog.requestClose('This should not get saved');
						expect(dialog.open, 'cancelled').toBe(true);
						expect(dialog.matches('[open]')).toBe(true);
						expect(dialog.returnValue, 'Return value should not be changed').toBe('foo');
					},
					{ document: { contentType: 'text/html', content } },
				);
			}
		}
	}
	context.test(
		`requestClose basic behavior when dialog is open via attribute`,
		async (fixture) => {
			const { document } = fixture;
			const dialog = document.querySelector('dialog')!;

			setup(fixture, dialog);
			dialog.open = true;
			dialog.requestClose();
			expect(dialog.open).toBe(false);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		`requestClose fires cancel and close when dialog is open via attribute`,
		async (fixture) => {
			const { document } = fixture;
			const dialog = document.querySelector('dialog')!;

			const signal = setup(fixture, dialog);
			let events: string[] = [];
			const { promise: untilFullyClosed, resolve: hasClosed } = Promise.withResolvers<void>();
			dialog.addEventListener('cancel', () => events.push('cancel'), { signal });
			dialog.addEventListener(
				'close',
				() => {
					events.push('close');
					hasClosed();
				},
				{ signal },
			);
			dialog.open = true;
			expect(events).toHaveLength(0);
			dialog.requestClose();
			expect(dialog.open).toBe(false);
			expect(events, 'close is scheduled').toHaveLength(1);
			expect(events[0], 'close is scheduled').toBe('cancel');
			await untilFullyClosed;
			expect(events).toHaveLength(2);
			expect(events[0]).toBe('cancel');
			expect(events[1]).toBe('close');
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		`requestClose(returnValue) passes along the return value when dialog is open via attribute`,
		async (fixture) => {
			const { document } = fixture;
			const dialog = document.querySelector('dialog')!;

			await setup(fixture, dialog);
			dialog.open = true;
			expect(dialog.returnValue, 'Return value starts out empty').toBe('');
			const returnValue = 'The return value';
			dialog.requestClose(returnValue);
			expect(dialog.open).toBe(false);
			expect(dialog.returnValue, 'Return value should be set').toBe(returnValue);
			dialog.show();
			dialog.close();
			expect(dialog.returnValue, 'Return value should not be changed by close()').toBe(returnValue);
			dialog.show();
			dialog.close('another');
			expect(dialog.returnValue, 'Return value changes via close(value)').toBe('another');
		},
		{ document: { contentType: 'text/html', content } },
	);
}
