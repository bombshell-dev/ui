import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE HTML>
<html>
 <head>
  <title>valueAsDate stepping</title>
\x20\x20
\x20\x20
 </head>
 <body>
  <p>
    <h3>input_valueAsDate_stepping</h3>
    <!-- This test verifies that valueAsDate reads and writes Date values,
         that those values step by the correct default step, and that the values
         represent the correct times.
    -->
  </p>

  <hr>

  <div id="log"></div>

  <form method="post"
      enctype="application/x-www-form-urlencoded"
      action=""
      name="input_form">
    <p><input type='date' id='input_date'></p>
    <p><input type='time' id='input_time'></p>
    <p><input type='week' id='input_week'></p>
    <p><input type='month' id='input_month'></p>
  </form>

\x20\x20
 </body>
</html>
`;
		function test_stepping(
			inputType: string,
			stringValue: string,
			steppedString: string,
			baseMillis: number,
			stepAmount: number,
		) {
			context.test(
				inputType + ' should step correctly' + ' (valueAsDate)',
				({ document, Date }) => {
					// put date in, constructed from a UTC timestamp so the test doesn't
					// vary by local timezone
					const input = document.getElementById('input_' + inputType) as HTMLInputElement;
					input.valueAsDate = new Date(baseMillis);

					// get string out (using startsWith here to allow for optional
					// seconds and milliseconds)
					let sanitizedStr = input.value;
					expect(
						sanitizedStr.startsWith(stringValue),
						'The input value [' + sanitizedStr + '] must resemble [' + stringValue + ']',
					).toBe(true);

					// get date out
					let sanitized = input.valueAsDate;
					expect(
						sanitized!.getTime(),
						'The input valueAsDate must represent the same time as the original Date.',
					).toBe(baseMillis);

					// step up, get new date out
					input.stepUp();
					let steppedDate = input.valueAsDate;
					expect(steppedDate!.getTime(), 'Stepping must be by the correct amount').toBe(
						baseMillis + stepAmount,
					);

					// get new string out
					let steppedStrOut = input.value;
					expect(
						steppedStrOut.startsWith(steppedString),
						'The changed input value [' + steppedStrOut + '] must resemble [' + steppedString + ']',
					).toBe(true);

					// step back down, get first date out again
					input.stepDown();
					let backDown = input.valueAsDate;
					expect(
						backDown!.getTime(),
						'Stepping back down must return the date to its original value',
					).toBe(baseMillis);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
		const millis_per_day = 24 * 60 * 60 * 1000;

		// jan 1 midnight, step 1 day to jan 2
		test_stepping('date', '1970-01-01', '1970-01-02', 0, millis_per_day);

		// jan 1 midnight, step 1 minute to 00:01:00
		test_stepping('time', '00:00', '00:01', 0, 60 * 1000);

		// jan 1 midnight, step 31 days to feb 1
		test_stepping('month', '1970-01', '1970-02', 0, 31 * millis_per_day);

		// monday jan 5 1970 midnight, step 7 days to jan 12
		// (this has to start on a monday for stepping up and down to return)
		test_stepping('week', '1970-W02', '1970-W03', 4 * millis_per_day, 7 * millis_per_day);
	}
}
