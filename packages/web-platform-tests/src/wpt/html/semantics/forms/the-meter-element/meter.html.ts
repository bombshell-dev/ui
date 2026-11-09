import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><body>
    <h1>Meter Element</h1>
    <div id="log"></div>
    <div style="display: none;">
      <meter id="meter_illegal_value" value="abc"></meter>
      <meter id="meter_without_min" value="-10"></meter>
      <meter id="meter_without_max" value="10"></meter>
      <meter id="meter_min_without_max_1" value="10" min="-3.1"></meter>
      <meter id="meter_min_without_max_2" value="210" min="12.1"></meter>
      <meter id="meter_max_without_min_1" value="-10" max="-5342.55"></meter>
      <meter id="meter_max_without_min_2" value="210" max="-9.9"></meter>
      <meter id="meter_illegal_min" value="-2" min="hugfe"></meter>
      <meter id="meter_illegal_max" value="2.4" max="min"></meter>
      <meter id="meter_illegal_low_with_min" value="-20"  min="-10.3" low="ahuge"></meter>
      <meter id="meter_illegal_high_with_max" value="2.4" high="old" max="1.5"></meter>
      <meter id="meter_smaller_than_min" value="-10" min="4.5"></meter>
      <meter id="meter_larger_than_max" value="2345.53" max="52.02"></meter>
      <meter id="meter_default_low_and_high_1" value="40" min="-12.3" max="3.4"></meter>
      <meter id="meter_default_low_and_high_2" value="23"></meter>
      <meter id="meter_low_smaller_than_min" value="-4" min="12.3" low="34"></meter>
      <meter id="meter_low_larger_than_max" value="-1" min="-50" low="-5" max="-34.5"></meter>
      <meter id="meter_high_smaller_than_min" value="-4" min="12.3" high="34"></meter>
      <meter id="meter_high_larger_than_max" value="-1" min="-50" high="-5" max="-34.5"></meter>
      <meter id="meter_high_smaller_than_low" value="-9" min="-20" low="-10.3" high="-15.2" max="-2"></meter>
      <meter id="meter_low_without_min" value="-1" low="-5"></meter>
      <meter id="meter_high_without_max" value="50000" high="4"></meter>
      <meter id="meter_optimum_smaller_than_min" value="-8" optimum="-4"></meter>
      <meter id="meter_optimum_larger_than_max" value="324" optimum="4.6"></meter>
      <meter id="meter_default_optimum" value="10" min="-132.35" max="33.423"></meter>
    </div>
    </body>`;
	const meters = [
		{
			value: 0,
			expectedValue: 0,
			expectedMin: 0,
			expectedMax: 1.0,
			expectedLow: 0,
			expectedHigh: 1.0,
			expectedOptimum: 0.5,
			testname: 'Default values',
		},
		{
			value: 3,
			expectedValue: 3,
			min: -10.1,
			expectedMin: -10.1,
			max: 10.1,
			expectedMax: 10.1,
			low: -9.1,
			expectedLow: -9.1,
			high: 9.1,
			expectedHigh: 9.1,
			optimum: 3,
			expectedOptimum: 3,
			testname: 'Setting values to min, max, low, high and optimum',
		},
		{
			value: 0,
			expectedValue: 0,
			min: 0,
			expectedMin: 0,
			max: -1.0,
			expectedMax: 0,
			expectedLow: 0,
			expectedHigh: 0,
			expectedOptimum: 0,
			testname: 'max < min',
		},
		{
			value: 0,
			expectedValue: 10,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			expectedLow: 10,
			expectedHigh: 20,
			expectedOptimum: 15,
			testname: 'value < min',
		},
		{
			value: 30,
			expectedValue: 20,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			expectedLow: 10,
			expectedHigh: 20,
			expectedOptimum: 15,
			testname: 'value > max',
		},
		{
			value: 15,
			expectedValue: 15,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			low: 5,
			expectedLow: 10,
			expectedHigh: 20,
			expectedOptimum: 15,
			testname: 'low < min',
		},
		{
			value: 15,
			expectedValue: 15,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			low: 25,
			expectedLow: 20,
			expectedHigh: 20,
			expectedOptimum: 15,
			testname: 'low > max',
		},
		{
			value: 15,
			expectedValue: 15,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			low: 12,
			expectedLow: 12,
			high: 10,
			expectedHigh: 12,
			expectedOptimum: 15,
			testname: 'high < low',
		},
		{
			value: 15,
			expectedValue: 15,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			low: 10,
			expectedLow: 10,
			high: 22,
			expectedHigh: 20,
			expectedOptimum: 15,
			testname: 'high > max',
		},
		{
			value: 15,
			expectedValue: 15,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			expectedLow: 10,
			expectedHigh: 20,
			optimum: 9,
			expectedOptimum: 10,
			testname: 'optimum < min',
		},
		{
			value: 15,
			expectedValue: 15,
			min: 10,
			expectedMin: 10,
			max: 20,
			expectedMax: 20,
			expectedLow: 10,
			expectedHigh: 20,
			optimum: 21,
			expectedOptimum: 20,
			testname: 'optimum > max',
		},
	];
	for (const m of meters) {
		context.test(m.testname, ({ document }) => {
			let meter = document.createElement('meter');
			meter.value = m.value;
			if (m.min) meter.min = m.min;
			if (m.max) meter.max = m.max;
			if (m.low) meter.low = m.low;
			if (m.high) meter.high = m.high;
			if (m.optimum) meter.optimum = m.optimum;
			expect(meter.value, 'meter value').toBe(m.expectedValue);
			expect(meter.min, 'min value').toBe(m.expectedMin);
			expect(meter.max, 'max value').toBe(m.expectedMax);
			expect(meter.low, 'low value').toBe(m.expectedLow);
			expect(meter.high, 'high value').toBe(m.expectedHigh);
			expect(meter.optimum, 'optimum value').toBe(m.expectedOptimum);
		});
	}
	context.test(
		'Invalid floating-point number values',
		({ document, TypeError }) => {
			let meter = document.createElement('meter');
			expect(function () {
				meter.value = 'foobar' as unknown as number;
			}, 'value attribute').toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				meter.min = 'foobar' as unknown as number;
			}, 'min attribute').toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				meter.max = 'foobar' as unknown as number;
			}, 'max attribute').toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				meter.low = 'foobar' as unknown as number;
			}, 'low attribute').toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				meter.high = 'foobar' as unknown as number;
			}, 'high attribute').toThrow(expect.objectContaining({ constructor: TypeError }));
			expect(function () {
				meter.optimum = 'foobar' as unknown as number;
			}, 'optimum attribute').toThrow(expect.objectContaining({ constructor: TypeError }));
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'value must be 0 when a string is given',
		({ document }) => {
			expect((document.getElementById('meter_illegal_value') as HTMLMeterElement).value).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'default value of min is 0',
		({ document }) => {
			expect((document.getElementById('meter_without_min') as HTMLMeterElement).min).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If min is not specified and value is smaller than the default value of min (i.e. 0), the actual value must be 0',
		({ document }) => {
			expect((document.getElementById('meter_without_min') as HTMLMeterElement).value).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'default value of max is 1.0',
		({ document }) => {
			expect((document.getElementById('meter_without_max') as HTMLMeterElement).max).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If max is not specified and value is larger than the default value of max (i.e. 1.0), the actual value must be 1.0',
		({ document }) => {
			expect((document.getElementById('meter_without_max') as HTMLMeterElement).value).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value smaller than 1.0 is given to min and max is not specified, max must be the same value as its default value (i.e. 1.0)',
		({ document }) => {
			expect((document.getElementById('meter_min_without_max_1') as HTMLMeterElement).max).toBe(
				1.0,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value smaller than 1.0 is given to min, max is not specified, and value is larger than the default value of max (i.e. 1.0), the actual value must be 1.0',
		({ document }) => {
			expect((document.getElementById('meter_min_without_max_1') as HTMLMeterElement).value).toBe(
				1.0,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value larger than or equal to 1.0 is given to min and max is not specified, max must be the same value as min',
		({ document }) => {
			expect((document.getElementById('meter_min_without_max_2') as HTMLMeterElement).max).toBe(
				12.1,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value larger than or equal to 1.0 is given to min and max is not specified, the actual value must be the same value as min',
		({ document }) => {
			expect((document.getElementById('meter_min_without_max_2') as HTMLMeterElement).value).toBe(
				12.1,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value smaller than 0 is given to max and min is not specified, min must be be the same value as its default value (i.e. 0)',
		({ document }) => {
			expect((document.getElementById('meter_max_without_min_1') as HTMLMeterElement).min).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value smaller than 0 is given to max and min is not specified, max must be be the same value as the default value of min (i.e. 0)',
		({ document }) => {
			expect((document.getElementById('meter_max_without_min_1') as HTMLMeterElement).max).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value smaller than 0 is given to max and min is not specified, the actual value must be be the same value as the default value of min (i.e. 0)',
		({ document }) => {
			expect((document.getElementById('meter_max_without_min_1') as HTMLMeterElement).value).toBe(
				0,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value larger than or equal to 0 is given to max and min is not specified, max must be the same value as the default value of min (i.e. 0)',
		({ document }) => {
			expect((document.getElementById('meter_max_without_min_2') as HTMLMeterElement).max).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value larger than or equal to 0 is given to max and min is not specified, min must be the same value as its default value (i.e. 0)',
		({ document }) => {
			expect((document.getElementById('meter_max_without_min_2') as HTMLMeterElement).min).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value larger than or equal to 0 is given to max and min is not specified, the actual value must be the same value as the default value of min (i.e. 0)',
		({ document }) => {
			expect((document.getElementById('meter_max_without_min_2') as HTMLMeterElement).value).toBe(
				0,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'min must be 0 when a string is given',
		({ document }) => {
			expect((document.getElementById('meter_illegal_min') as HTMLMeterElement).min).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a string is given to min and value is smaller than the default value of min (i.e. 0), the actual value must be 0',
		({ document }) => {
			expect((document.getElementById('meter_illegal_min') as HTMLMeterElement).value).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'max must be 1.0 when a string is given',
		({ document }) => {
			expect((document.getElementById('meter_illegal_max') as HTMLMeterElement).max).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a string is given to max and value is larger than the default value of min (i.e. 1.0), the actual value must be 1.0',
		({ document }) => {
			expect((document.getElementById('meter_illegal_max') as HTMLMeterElement).value).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'giving a string to low must not affect the actual value',
		({ document }) => {
			expect((document.getElementById('meter_illegal_low_with_min') as HTMLMeterElement).low).toBe(
				-10.3,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'high must equal max when a string is given to high',
		({ document }) => {
			expect(
				(document.getElementById('meter_illegal_high_with_max') as HTMLMeterElement).high,
			).toBe(1.5);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'giving a string to high must not affect the actual value',
		({ document }) => {
			expect(
				(document.getElementById('meter_illegal_high_with_max') as HTMLMeterElement).value,
			).toBe(1.5);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'value must not be smaller than min',
		({ document }) => {
			expect((document.getElementById('meter_smaller_than_min') as HTMLMeterElement).value).toBe(
				4.5,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'value must not be larger than max',
		({ document }) => {
			expect((document.getElementById('meter_larger_than_max') as HTMLMeterElement).value).toBe(
				52.02,
			);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'default low and high values equal min and max, respectively',
		({ document }) => {
			let e = document.getElementById('meter_default_low_and_high_1') as HTMLMeterElement;
			expect([e.low, e.high]).toHaveLength(2);
			expect([e.low, e.high][0]).toBe(-12.3);
			expect([e.low, e.high][1]).toBe(3.4);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'default low and high values equal 0 and 1.0 respectively, if both low and high are not specified',
		({ document }) => {
			let e = document.getElementById('meter_default_low_and_high_2') as HTMLMeterElement;
			expect([e.low, e.high]).toHaveLength(2);
			expect([e.low, e.high][0]).toBe(0);
			expect([e.low, e.high][1]).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'low must not be smaller than min',
		({ document }) => {
			let e = document.getElementById('meter_low_smaller_than_min') as HTMLMeterElement;
			expect([e.low, e.min, e.value]).toHaveLength(3);
			expect([e.low, e.min, e.value][0]).toBe(12.3);
			expect([e.low, e.min, e.value][1]).toBe(12.3);
			expect([e.low, e.min, e.value][2]).toBe(12.3);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'low must not be larger than max',
		({ document }) => {
			let e = document.getElementById('meter_low_larger_than_max') as HTMLMeterElement;
			expect([e.low, e.max, e.value]).toHaveLength(3);
			expect([e.low, e.max, e.value][0]).toBe(-34.5);
			expect([e.low, e.max, e.value][1]).toBe(-34.5);
			expect([e.low, e.max, e.value][2]).toBe(-34.5);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'high must not be smaller than min',
		({ document }) => {
			let e = document.getElementById('meter_high_smaller_than_min') as HTMLMeterElement;
			expect([e.high, e.min, e.value]).toHaveLength(3);
			expect([e.high, e.min, e.value][0]).toBe(12.3);
			expect([e.high, e.min, e.value][1]).toBe(12.3);
			expect([e.high, e.min, e.value][2]).toBe(12.3);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'high must not be larger than max',
		({ document }) => {
			let e = document.getElementById('meter_high_larger_than_max') as HTMLMeterElement;
			expect([e.high, e.max, e.value]).toHaveLength(3);
			expect([e.high, e.max, e.value][0]).toBe(-34.5);
			expect([e.high, e.max, e.value][1]).toBe(-34.5);
			expect([e.high, e.max, e.value][2]).toBe(-34.5);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If min is not specified, low must not be smaller than default value of min (i.e. 0)',
		({ document }) => {
			let e = document.getElementById('meter_low_without_min') as HTMLMeterElement;
			expect([e.low, e.min, e.value]).toHaveLength(3);
			expect([e.low, e.min, e.value][0]).toBe(0);
			expect([e.low, e.min, e.value][1]).toBe(0);
			expect([e.low, e.min, e.value][2]).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If a value smaller than low is given to high, it must be set to the same value as low',
		({ document }) => {
			let e = document.getElementById('meter_high_smaller_than_low') as HTMLMeterElement;
			expect([e.low, e.high, e.value]).toHaveLength(3);
			expect([e.low, e.high, e.value][0]).toBe(-10.3);
			expect([e.low, e.high, e.value][1]).toBe(-10.3);
			expect([e.low, e.high, e.value][2]).toBe(-9);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'If max is not specified, high must not be larger than default value of max (i.e. 1.0)',
		({ document }) => {
			let e = document.getElementById('meter_high_without_max') as HTMLMeterElement;
			expect([e.high, e.value]).toHaveLength(2);
			expect([e.high, e.value][0]).toBe(1.0);
			expect([e.high, e.value][1]).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'optimum smaller than min',
		({ document }) => {
			expect(
				(document.getElementById('meter_optimum_smaller_than_min') as HTMLMeterElement).optimum,
			).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'optimum (smaller than min) must not affect min and the actual value',
		({ document }) => {
			let e = document.getElementById('meter_optimum_smaller_than_min') as HTMLMeterElement;
			expect([e.min, e.value]).toHaveLength(2);
			expect([e.min, e.value][0]).toBe(0);
			expect([e.min, e.value][1]).toBe(0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'optimum smaller than max',
		({ document }) => {
			expect(
				(document.getElementById('meter_optimum_larger_than_max') as HTMLMeterElement).optimum,
			).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'optimum (larger than max) must not affect max and the actual value',
		({ document }) => {
			let e = document.getElementById('meter_optimum_larger_than_max') as HTMLMeterElement;
			expect([e.max, e.value]).toHaveLength(2);
			expect([e.max, e.value][0]).toBe(1.0);
			expect([e.max, e.value][1]).toBe(1.0);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'default optimum value is the midpoint between min and max',
		({ document }) => {
			let e = document.getElementById('meter_default_optimum') as HTMLMeterElement;
			expect(e.optimum).toBe((e.max + e.min) / 2);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
