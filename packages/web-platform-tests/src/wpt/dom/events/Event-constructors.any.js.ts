import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		context.test(
			'CustomEvent constructor preserves detail and ignores extra dictionary members',
			({ CustomEvent }) => {
				let ev = new CustomEvent('$', {
					detail: 54,
					sweet: 'x',
					sweet2: 'x',
					cancelable: true,
				} as CustomEventInit);
				expect(ev.type).toBe('$');
				expect(ev.bubbles).toBe(false);
				expect(ev.cancelable).toBe(true);
				expect((ev as CustomEvent & { sweet?: unknown }).sweet).toBe(undefined);
				expect(ev.detail).toBe(54);
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test('Event constructor requires new with an empty type', ({ Event, TypeError }) => {
			expect(
				() => (Event as unknown as (type: string) => Event)(''),
				"Calling Event constructor without 'new' must throw",
			).toThrow(expect.objectContaining({ constructor: TypeError }));
		});
		context.test('Event constructor requires a type argument', ({ Event, TypeError }) => {
			expect(function () {
				new (Event as unknown as new () => Event)();
			}).toThrow(expect.objectContaining({ constructor: TypeError }));
		});
		context.test('Event constructor propagates type conversion errors', ({ Event }) => {
			let test_error = { name: 'test' };
			let caught: unknown;
			try {
				new Event({
					toString() {
						throw test_error;
					},
				} as unknown as string);
			} catch (error) {
				caught = error;
			}
			expect(caught).toBe(test_error);
		});
		context.test('Event constructor defaults with an empty type', ({ Event }) => {
			let ev = new Event('');
			expect(ev.type).toBe('');
			expect(ev.target).toBe(null);
			expect(ev.srcElement).toBe(null);
			expect(ev.currentTarget).toBe(null);
			expect(ev.eventPhase).toBe(Event.NONE);
			expect(ev.bubbles).toBe(false);
			expect(ev.cancelable).toBe(false);
			expect(ev.defaultPrevented).toBe(false);
			expect(ev.returnValue).toBe(true);
			expect(ev.isTrusted).toBe(false);
			expect(ev.timeStamp > 0).toBe(true);
			expect('initEvent' in ev).toBe(true);
		});
		context.test('Event constructor defaults with type test', ({ Event }) => {
			let ev = new Event('test');
			expect(ev.type).toBe('test');
			expect(ev.target).toBe(null);
			expect(ev.srcElement).toBe(null);
			expect(ev.currentTarget).toBe(null);
			expect(ev.eventPhase).toBe(Event.NONE);
			expect(ev.bubbles).toBe(false);
			expect(ev.cancelable).toBe(false);
			expect(ev.defaultPrevented).toBe(false);
			expect(ev.returnValue).toBe(true);
			expect(ev.isTrusted).toBe(false);
			expect(ev.timeStamp > 0).toBe(true);
			expect('initEvent' in ev).toBe(true);
		});
		context.test('Event constructor requires new with type test', ({ Event, TypeError }) => {
			expect(function () {
				(Event as unknown as (type: string) => Event)('test');
			}, 'Calling Event constructor without "new" must throw').toThrow(
				expect.objectContaining({ constructor: TypeError }),
			);
		});
		context.test('Event constructor honors bubbles', ({ Event }) => {
			let ev = new Event('I am an event', { bubbles: true, cancelable: false } as EventInit);
			expect(ev.type).toBe('I am an event');
			expect(ev.bubbles).toBe(true);
			expect(ev.cancelable).toBe(false);
		});
		context.test('Event constructor ignores bubblesIGNORED', ({ Event }) => {
			let ev = new Event('@', { bubblesIGNORED: true, cancelable: true } as EventInit);
			expect(ev.type).toBe('@');
			expect(ev.bubbles).toBe(false);
			expect(ev.cancelable).toBe(true);
		});
		context.test(
			'Event constructor ignores a dictionary member containing a null character',
			({ Event }) => {
				let ev = new Event('@', { 'bubbles\0IGNORED': true, cancelable: true } as EventInit);
				expect(ev.type).toBe('@');
				expect(ev.bubbles).toBe(false);
				expect(ev.cancelable).toBe(true);
			},
		);
		context.test('Event constructor honors cancelable', ({ Event }) => {
			let ev = new Event('Xx', { cancelable: true } as EventInit);
			expect(ev.type).toBe('Xx');
			expect(ev.bubbles).toBe(false);
			expect(ev.cancelable).toBe(true);
		});
		context.test('Event constructor accepts an empty dictionary', ({ Event }) => {
			let ev = new Event('Xx', {} as EventInit);
			expect(ev.type).toBe('Xx');
			expect(ev.bubbles).toBe(false);
			expect(ev.cancelable).toBe(false);
		});
		context.test('Event constructor ignores sweet', ({ Event }) => {
			let ev = new Event('Xx', { bubbles: true, cancelable: false, sweet: 'x' } as EventInit);
			expect(ev.type).toBe('Xx');
			expect(ev.bubbles).toBe(true);
			expect(ev.cancelable).toBe(false);
			expect((ev as Event & { sweet?: unknown }).sweet).toBe(undefined);
		});
		context.test('Event constructor reads dictionary members in order', ({ Event }) => {
			let called: string[] = [];
			let ev = new Event('Xx', {
				get cancelable() {
					called.push('cancelable');
					return false;
				},
				get bubbles() {
					called.push('bubbles');
					return true;
				},
				get sweet() {
					called.push('sweet');
					return 'x';
				},
			} as EventInit);
			expect(called).toHaveLength(2);
			expect(called[0]).toBe('bubbles');
			expect(called[1]).toBe('cancelable');
			expect(ev.type).toBe('Xx');
			expect(ev.bubbles).toBe(true);
			expect(ev.cancelable).toBe(false);
			expect((ev as Event & { sweet?: unknown }).sweet).toBe(undefined);
		});
	}
}
