import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!DOCTYPE HTML>
<meta charset="utf-8">
<html>
 <head>
  <title>HTMLInputElement valueAsDate</title>
\x20\x20
\x20\x20

\x20\x20
\x20\x20
 </head>
 <body>
  <h3>input_valueAsDate</h3>
  <hr>
  <div id="log"></div>

  <input id="input_date" type="date" />
  <input id="input_month" type="month" />
  <input id="input_week" type="week" />
  <input id="input_time" type="time" />

\x20\x20
 </body>
</html>
`;
	function testValueAsDateGetter(type: string, id: string, cases: [string, Date | null][]) {
		for (const [actualValue, expectedValueAsDate] of cases) {
			context.test(
				`valueAsDate getter on type ${type} (with value: ${JSON.stringify(actualValue)})`,
				(fixture) => {
					const { document } = fixture;
					const element = document.getElementById(id) as HTMLInputElement;
					const Date = fixture.Date;

					element.value = actualValue;

					const actualValueAsDate = element.valueAsDate;
					if (actualValueAsDate instanceof Date) {
						expect(
							actualValueAsDate.getTime(),
							`valueAsDate returns an invalid date (actual: ${actualValueAsDate.toISOString()}, ` +
								`expected: ${expectedValueAsDate!.toISOString()})`,
						).toBe(expectedValueAsDate!.getTime());
					} else {
						expect(actualValueAsDate).toBe(expectedValueAsDate);
					}
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
	function testValueAsDateSetter(type: string, id: string, cases: [string, string][]) {
		for (const [valueDateStr, expectedValue] of cases) {
			context.test(
				`valueAsDate setter on type ${type} (new Date(${JSON.stringify(valueDateStr)}))`,
				(fixture) => {
					const { document } = fixture;
					const element = document.getElementById(id) as HTMLInputElement;
					const Date = fixture.Date;

					element.valueAsDate = new Date(valueDateStr);
					expect(element.value).toBe(expectedValue);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
	const dateInput = 'input_date';
	testValueAsDateGetter('date', dateInput, [
		['', null],
		['0000-12-10', null],
		['2019-00-12', null],
		['2019-12-00', null],
		['2019-13-10', null],
		['2019-02-29', null],
		['2019-12-10', new Date('2019-12-10T00:00:00.000Z')],
		['2016-02-29', new Date('2016-02-29T00:00:00.000Z')], // Leap year
	]);
	testValueAsDateSetter('date', dateInput, [
		['2019-12-10T00:00:00.000Z', '2019-12-10'],
		['2016-02-29T00:00:00.000Z', '2016-02-29'], // Leap year
	]);

	const monthInput = 'input_month';
	testValueAsDateGetter('month', monthInput, [
		['', null],
		['0000-12', null],
		['2019-00', null],
		['2019-12', new Date('2019-12-01T00:00:00.000Z')],
	]);
	testValueAsDateSetter('month', monthInput, [['2019-12-01T00:00:00.000Z', '2019-12']]);

	const weekInput = 'input_week';
	testValueAsDateGetter('week', weekInput, [
		['', null],
		['0000-W50', null],
		['2019-W00', null],
		['2019-W60', null],
		['2019-W50', new Date('2019-12-09T00:00:00.000Z')],
	]);
	testValueAsDateSetter('week', weekInput, [['2019-12-09T00:00:00.000Z', '2019-W50']]);

	const timeInput = 'input_time';
	testValueAsDateGetter('time', timeInput, [
		['', null],
		['24:00', null],
		['00:60', null],
		['00:00', new Date('1970-01-01T00:00:00.000Z')],
		['12:00', new Date('1970-01-01T12:00:00.000Z')],
		['23:59', new Date('1970-01-01T23:59:00.000Z')],
	]);
	testValueAsDateSetter('time', timeInput, [
		['1970-01-01T00:00:00.000Z', '00:00'],
		['1970-01-01T12:00:00.000Z', '12:00'],
		['1970-01-01T23:59:00.000Z', '23:59'],
	]);
}
