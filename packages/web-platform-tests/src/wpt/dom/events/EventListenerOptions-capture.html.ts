import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('Capture boolean should be honored correctly', ({ document, Event, step }) => {
		function testCaptureValue(captureValue: unknown, expectedValue: number) {
			let handlerPhase: number | undefined = undefined;
			let handler = step(function handler(e: Event) {
				expect(handlerPhase, 'Handler invoked after remove').toBe(undefined);
				handlerPhase = e.eventPhase;
			});
			document.addEventListener('test', handler, captureValue as boolean | AddEventListenerOptions);
			document.body.dispatchEvent(new Event('test', { bubbles: true }));
			document.removeEventListener(
				'test',
				handler,
				captureValue as boolean | AddEventListenerOptions,
			);
			document.body.dispatchEvent(new Event('test', { bubbles: true }));
			expect(handlerPhase, 'Incorrect event phase for value: ' + JSON.stringify(captureValue)).toBe(
				expectedValue,
			);
		}

		testCaptureValue(true, Event.CAPTURING_PHASE);
		testCaptureValue(false, Event.BUBBLING_PHASE);
		testCaptureValue(null, Event.BUBBLING_PHASE);
		testCaptureValue(undefined, Event.BUBBLING_PHASE);
		testCaptureValue(2.3, Event.CAPTURING_PHASE);
		testCaptureValue(-1000.3, Event.CAPTURING_PHASE);
		testCaptureValue(NaN, Event.BUBBLING_PHASE);
		testCaptureValue(+0.0, Event.BUBBLING_PHASE);
		testCaptureValue(-0.0, Event.BUBBLING_PHASE);
		testCaptureValue('', Event.BUBBLING_PHASE);
		testCaptureValue('AAAA', Event.CAPTURING_PHASE);
	});
	context.test('Capture option should be honored correctly', ({ document, Event, step }) => {
		function testCaptureValue(captureValue: unknown, expectedValue: number) {
			let handlerPhase: number | undefined = undefined;
			let handler = step(function handler(e: Event) {
				expect(handlerPhase, 'Handler invoked after remove').toBe(undefined);
				handlerPhase = e.eventPhase;
			});
			document.addEventListener('test', handler, captureValue as boolean | AddEventListenerOptions);
			document.body.dispatchEvent(new Event('test', { bubbles: true }));
			document.removeEventListener(
				'test',
				handler,
				captureValue as boolean | AddEventListenerOptions,
			);
			document.body.dispatchEvent(new Event('test', { bubbles: true }));
			expect(handlerPhase, 'Incorrect event phase for value: ' + JSON.stringify(captureValue)).toBe(
				expectedValue,
			);
		}

		testCaptureValue({}, Event.BUBBLING_PHASE);
		testCaptureValue({ capture: true }, Event.CAPTURING_PHASE);
		testCaptureValue({ capture: false }, Event.BUBBLING_PHASE);
		testCaptureValue({ capture: 2 }, Event.CAPTURING_PHASE);
		testCaptureValue({ capture: 0 }, Event.BUBBLING_PHASE);
	});
	context.test('Supports capture option', ({ document }) => {
		let supportsCapture = false;
		let query_options = {
			get capture() {
				supportsCapture = true;
				return false;
			},
			get dummy() {
				expect.unreachable('dummy value getter invoked');
				return false;
			},
		};

		document.addEventListener('test_event', null as unknown as EventListener, query_options);
		expect(supportsCapture, "addEventListener doesn't support the capture option").toBe(true);
		supportsCapture = false;
		document.removeEventListener('test_event', null as unknown as EventListener, query_options);
		expect(supportsCapture, "removeEventListener doesn't support the capture option").toBe(true);
	});
	context.test('Equivalence of option values', ({ document, Event, step }) => {
		function testOptionEquality(
			addOptionValue: unknown,
			removeOptionValue: unknown,
			expectedEquality: boolean,
		) {
			let handlerInvoked = false;
			let handler = step(function handler(e: Event) {
				expect(handlerInvoked, 'Handler invoked multiple times').toBe(false);
				handlerInvoked = true;
			});
			document.addEventListener(
				'test',
				handler,
				addOptionValue as boolean | AddEventListenerOptions,
			);
			document.removeEventListener(
				'test',
				handler,
				removeOptionValue as boolean | AddEventListenerOptions,
			);
			document.body.dispatchEvent(new Event('test', { bubbles: true }));
			expect(
				!handlerInvoked,
				'equivalence of options ' +
					JSON.stringify(addOptionValue) +
					' and ' +
					JSON.stringify(removeOptionValue),
			).toBe(expectedEquality);
			if (handlerInvoked)
				document.removeEventListener(
					'test',
					handler,
					addOptionValue as boolean | AddEventListenerOptions,
				);
		}

		// Option values that should be treated as equivalent
		testOptionEquality({}, false, true);
		testOptionEquality({ capture: false }, false, true);
		testOptionEquality(true, { capture: true }, true);
		testOptionEquality({ capture: null }, undefined, true);
		testOptionEquality({ capture: true }, { dummy: false, capture: 1 }, true);
		testOptionEquality({ dummy: true }, false, true);

		// Option values that should be treated as distinct
		testOptionEquality(true, false, false);
		testOptionEquality(true, { capture: false }, false);
		testOptionEquality({}, true, false);
	});
}
