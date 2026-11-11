import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function testPassiveValue(
		{ EventTarget, Event, step }: DOMFixture,
		optionsValue: unknown,
		expectedDefaultPrevented: boolean,
		existingEventTarget?: EventTarget,
	) {
		let defaultPrevented: boolean | undefined = undefined;
		let handler = step(function handler(e: Event) {
			expect(e.defaultPrevented, 'Event prematurely marked defaultPrevented').toBe(false);
			e.preventDefault();
			defaultPrevented = e.defaultPrevented;
		});
		const et = existingEventTarget || new EventTarget();
		et.addEventListener('test', handler, optionsValue as AddEventListenerOptions);
		let uncanceled = et.dispatchEvent(new Event('test', { bubbles: true, cancelable: true }));

		expect(
			defaultPrevented,
			'Incorrect defaultPrevented for options: ' + JSON.stringify(optionsValue),
		).toBe(expectedDefaultPrevented);
		expect(uncanceled, 'Incorrect return value from dispatchEvent').toBe(!expectedDefaultPrevented);

		et.removeEventListener('test', handler, optionsValue as AddEventListenerOptions);
	}
	function testPassiveValueOnReturnValue(
		{ EventTarget, Event, step }: DOMFixture,
		optionsValue: unknown,
		expectedDefaultPrevented: boolean,
	) {
		let defaultPrevented: boolean | undefined = undefined;
		let handler = step((e: Event) => {
			expect(e.defaultPrevented, 'Event prematurely marked defaultPrevented').toBe(false);
			e.returnValue = false;
			defaultPrevented = e.defaultPrevented;
		});
		const et = new EventTarget();
		et.addEventListener('test', handler, optionsValue as AddEventListenerOptions);
		let uncanceled = et.dispatchEvent(new Event('test', { bubbles: true, cancelable: true }));

		expect(
			defaultPrevented,
			'Incorrect defaultPrevented for options: ' + JSON.stringify(optionsValue),
		).toBe(expectedDefaultPrevented);
		expect(uncanceled, 'Incorrect return value from dispatchEvent').toBe(!expectedDefaultPrevented);

		et.removeEventListener('test', handler, optionsValue as AddEventListenerOptions);
	}
	function testPassiveWithOtherHandlers(
		fixture: DOMFixture,
		optionsValue: unknown,
		expectedDefaultPrevented: boolean,
	) {
		const { EventTarget } = fixture;
		let handlerInvoked1 = false;
		let dummyHandler1 = function () {
			handlerInvoked1 = true;
		};
		let handlerInvoked2 = false;
		let dummyHandler2 = function () {
			handlerInvoked2 = true;
		};

		const et = new EventTarget();
		et.addEventListener('test', dummyHandler1, { passive: true });
		et.addEventListener('test', dummyHandler2);

		testPassiveValue(fixture, optionsValue, expectedDefaultPrevented, et);

		expect(handlerInvoked1, 'Extra passive handler not invoked').toBe(true);
		expect(handlerInvoked2, 'Extra non-passive handler not invoked').toBe(true);

		et.removeEventListener('test', dummyHandler1);
		et.removeEventListener('test', dummyHandler2);
	}
	function testOptionEquivalence(
		{ EventTarget, Event }: DOMFixture,
		optionValue1: unknown,
		optionValue2: unknown,
		expectedEquality: boolean,
	) {
		let invocationCount = 0;
		let handler = function handler(e: Event) {
			invocationCount++;
		};
		const et = new EventTarget();
		et.addEventListener('test', handler, optionValue1 as AddEventListenerOptions);
		et.addEventListener('test', handler, optionValue2 as AddEventListenerOptions);
		et.dispatchEvent(new Event('test', { bubbles: true }));
		expect(
			invocationCount,
			'equivalence of options ' +
				JSON.stringify(optionValue1) +
				' and ' +
				JSON.stringify(optionValue2),
		).toBe(expectedEquality ? 1 : 2);
		et.removeEventListener('test', handler, optionValue1 as AddEventListenerOptions);
		et.removeEventListener('test', handler, optionValue2 as AddEventListenerOptions);
	}
	context.test('Supports passive option on addEventListener only', ({ EventTarget }) => {
		let supportsPassive = false;
		let query_options = {
			get passive() {
				supportsPassive = true;
				return false;
			},
			get dummy() {
				expect.unreachable('dummy value getter invoked');
				return false;
			},
		};

		const et = new EventTarget();
		et.addEventListener('test_event', null, query_options);
		expect(supportsPassive, "addEventListener doesn't support the passive option").toBe(true);

		supportsPassive = false;
		et.removeEventListener('test_event', null, query_options as EventListenerOptions);
		expect(
			supportsPassive,
			'removeEventListener supports the passive option when it should not',
		).toBe(false);
	});
	context.test(
		'preventDefault should be ignored if-and-only-if the passive option is true',
		(fixture) => {
			testPassiveValue(fixture, undefined, true);
			testPassiveValue(fixture, {}, true);
			testPassiveValue(fixture, { passive: false }, true);
			testPassiveValue(fixture, { passive: true }, false);
			testPassiveValue(fixture, { passive: 0 }, true);
			testPassiveValue(fixture, { passive: 1 }, false);
		},
	);
	context.test(
		'returnValue should be ignored if-and-only-if the passive option is true',
		(fixture) => {
			testPassiveValueOnReturnValue(fixture, undefined, true);
			testPassiveValueOnReturnValue(fixture, {}, true);
			testPassiveValueOnReturnValue(fixture, { passive: false }, true);
			testPassiveValueOnReturnValue(fixture, { passive: true }, false);
			testPassiveValueOnReturnValue(fixture, { passive: 0 }, true);
			testPassiveValueOnReturnValue(fixture, { passive: 1 }, false);
		},
	);
	context.test(
		'passive behavior of one listener should be unaffected by the presence of other listeners',
		(fixture) => {
			testPassiveWithOtherHandlers(fixture, {}, true);
			testPassiveWithOtherHandlers(fixture, { passive: false }, true);
			testPassiveWithOtherHandlers(fixture, { passive: true }, false);
		},
	);
	context.test('Equivalence of option values', (fixture) => {
		// Sanity check options that should be treated as distinct handlers
		testOptionEquivalence(fixture, { capture: true }, { capture: false, passive: false }, false);
		testOptionEquivalence(fixture, { capture: true }, { passive: true }, false);

		// Option values that should be treated as equivalent
		testOptionEquivalence(fixture, {}, { passive: false }, true);
		testOptionEquivalence(fixture, { passive: true }, { passive: false }, true);
		testOptionEquivalence(fixture, undefined, { passive: true }, true);
		testOptionEquivalence(
			fixture,
			{ capture: true, passive: false },
			{ capture: true, passive: true },
			true,
		);
	});
}
