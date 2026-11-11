import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'clicking a button with .click() should trigger a submit (form connected)',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect(ev.target).toBe(form);
					})(ev);
					resolve();
				});

				button.click();
			});
		},
	);
	context.test(
		'clicking a button with .click() should not trigger a submit (form disconnected)',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				form.appendChild(button);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				button.click();
				setTimeout(resolve, 500);
			});
		},
	);
	context.test(
		'clicking a button by dispatching an event should trigger a submit (form connected)',
		async ({ document, MouseEvent, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect(ev.target).toBe(form);
					})(ev);
					resolve();
				});

				const e = new MouseEvent('click');
				button.dispatchEvent(e);
			});
		},
	);
	context.test(
		'clicking a button by dispatching an event should not trigger a submit (form disconnected)',
		async ({ document, MouseEvent, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				form.appendChild(button);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				const e = new MouseEvent('click');
				button.dispatchEvent(e);
				setTimeout(resolve, 500);
			});
		},
	);
	context.test(
		'clicking a button that cancels the event should not trigger a submit',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				form.appendChild(button);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				button.addEventListener(
					'click',
					step((ev) => {
						ev.preventDefault();
						setTimeout(resolve, 500);
					}),
				);
				button.click();
			});
		},
	);
	context.test(
		'clicking a disabled button (via disabled attribute) should not trigger submit',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				button.setAttribute('disabled', '');
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				button.click();
				setTimeout(resolve, 500);
			});
		},
	);
	context.test(
		'clicking a disabled button (via ancestor fieldset) should not trigger submit',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				form.innerHTML = `<fieldset disabled><button>hello</button></fieldset>`;
				const button = form.querySelector('button')!;
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				button.click();
				setTimeout(resolve, 500);
			});
		},
	);
	context.test(
		"clicking a button inside a disabled fieldset's legend *should* trigger submit",
		({ document, step }) => {
			const form = document.createElement('form');
			form.innerHTML = `<fieldset disabled><legend><button>hello</button></legend></fieldset>`;
			const button = form.querySelector('button')!;
			document.body.appendChild(form);

			form.addEventListener(
				'submit',
				step((ev: Event) => {
					ev.preventDefault();
					expect(ev.target).toBe(form);
				}),
			);

			button.click();
		},
	);
	context.test(
		'clicking the child of a button with .click() should trigger a submit',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				const span = document.createElement('span');
				button.appendChild(span);
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect(ev.target).toBe(form);
					})(ev);
					resolve();
				});

				span.click();
			});
		},
	);
	context.test(
		'clicking the child of a button by dispatching a bubbling event should trigger a submit',
		async ({ document, MouseEvent, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				const span = document.createElement('span');
				button.appendChild(span);
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect(ev.target).toBe(form);
					})(ev);
					resolve();
				});

				const e = new MouseEvent('click', { bubbles: true });
				span.dispatchEvent(e);
			});
		},
	);
	context.test(
		'clicking the child of a button by dispatching a non-bubbling event should not trigger submit',
		async ({ document, MouseEvent, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				const span = document.createElement('span');
				button.appendChild(span);
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				span.addEventListener(
					'click',
					step((ev) => {
						setTimeout(resolve, 500);
					}),
				);

				const e = new MouseEvent('click', { bubbles: false });
				span.dispatchEvent(e);
			});
		},
	);
	context.test(
		'clicking the child of a disabled button with .click() should not trigger submit',
		async ({ document, step }) => {
			await new Promise<void>((resolve) => {
				const form = document.createElement('form');
				const button = document.createElement('button');
				button.disabled = true;
				const span = document.createElement('span');
				button.appendChild(span);
				form.appendChild(button);
				document.body.appendChild(form);

				form.addEventListener('submit', (ev: Event) => {
					step((ev: Event) => {
						ev.preventDefault();
						expect.unreachable('Form should not be submitted');
					})(ev);
					resolve();
				});

				span.addEventListener(
					'click',
					step((ev) => {
						expect(true, 'span was clicked').toBe(true);
						setTimeout(resolve, 500);
					}),
				);

				span.click();
			});
		},
	);
}
