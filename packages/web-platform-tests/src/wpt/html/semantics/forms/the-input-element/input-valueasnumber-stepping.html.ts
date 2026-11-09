import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		const content = `<!DOCTYPE HTML>
<html>
 <head>
  <title>valueAsNumber stepping</title>
\x20\x20
\x20\x20
 </head>
 <body>
  <p>
    <h3>input_valueAsNumber_stepping</h3>
    <!-- This test verifies that valueAsNumber reads and writes number values,
         that those values step by the correct default step, and that the values
         represent the correct milliseconds/months.
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
    <p><input type='datetime-local' id='input_datetime-local'></p>
    <p><input type='range' id='input_range'></p>
    <p><input type='number' id='input_number'></p>
  </form>

\x20\x20

 </body>
</html>
`;
		function test_stepping(
			inputType: string,
			stringValue: string,
			steppedString: string,
			baseNumber: number,
			stepAmount: number,
		) {
			context.test(
				inputType + ' should step correctly' + ' (valueAsNumber)',
				({ document }) => {
					// put number in
					const input = document.getElementById('input_' + inputType) as HTMLInputElement;
					input.valueAsNumber = baseNumber;

					// get string out
					// startsWith is here to allow for optional seconds and milliseconds.
					// the replace("T", " ") fallback is for https://github.com/web-platform-tests/wpt/issues/20994
					let sanitizedStr = input.value;
					expect(
						sanitizedStr.startsWith(stringValue) ||
							sanitizedStr.startsWith(stringValue.replace('T', ' ')),
						'The input value [' + sanitizedStr + '] must resemble [' + stringValue + ']',
					).toBe(true);

					// get number out
					let sanitized = input.valueAsNumber;
					expect(sanitized, 'The input valueAsNumber must equal the original number.').toBe(
						baseNumber,
					);

					// step up, get new date out
					input.stepUp();
					let steppedNumber = input.valueAsNumber;
					expect(steppedNumber, 'Stepping must be by the correct amount').toBe(
						baseNumber + stepAmount,
					);

					// get new string out
					let steppedStrOut = input.value;
					expect(
						steppedStrOut.startsWith(steppedString) ||
							steppedStrOut.startsWith(steppedString.replace('T', ' ')),
						'The changed input value [' + steppedStrOut + '] must resemble [' + steppedString + ']',
					).toBe(true);

					// step back down, get first date out again
					input.stepDown();
					let backDown = input.valueAsNumber;
					expect(backDown, 'Stepping back down must return the number to its original value').toBe(
						baseNumber,
					);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
		const millis_per_day = 24 * 60 * 60 * 1000;

		// jan 1 midnight, step 1 day to jan 2
		test_stepping('date', '1970-01-01', '1970-01-02', 0, millis_per_day);

		// jan 1 midnight, step 1 minute to 00:01:00
		test_stepping('time', '00:00', '00:01', 0, 60 * 1000);

		// jan 1 midnight, step 1 month (not counting by milliseconds) to feb 1
		test_stepping('month', '1970-01', '1970-02', 0, 1);

		// monday jan 5 1970 midnight, step 7 days to jan 12
		// (this has to start on a monday for stepping up and down to return)
		test_stepping('week', '1970-W02', '1970-W03', 4 * millis_per_day, 7 * millis_per_day);

		// jan 1 midnight, step 1 minute to 00:01:00
		test_stepping('datetime-local', '1970-01-01T00:00', '1970-01-01T00:01', 0, 60 * 1000);

		// numbers, for which the default step is 1
		test_stepping('range', '22', '23', 22, 1);
		test_stepping('number', '24', '25', 24, 1);
	}
}
