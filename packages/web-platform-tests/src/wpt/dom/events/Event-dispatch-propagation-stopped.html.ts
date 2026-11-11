import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Calling stopPropagation() prior to dispatchEvent()',
		({ document }) => {
			const window = document.defaultView!;

			let event = 'foo';
			let target = document.getElementById('target')!;
			let parent = document.getElementById('parent')!;
			let tbody = document.getElementById('table-body')!;
			let table = document.getElementById('table')!;
			let body = document.body;
			let html = document.documentElement;
			let current_targets = [window, document, html, body, table, tbody, parent, target];
			let expected_targets: (EventTarget | null)[] = [];
			let actual_targets: (EventTarget | null)[] = [];
			let expected_phases: number[] = [];
			let actual_phases: number[] = [];

			let test_event = function (evt: Event) {
				actual_targets.push(evt.currentTarget);
				actual_phases.push(evt.eventPhase);
			};

			for (let i = 0; i < current_targets.length; ++i) {
				current_targets[i]!.addEventListener(event, test_event, true);
				current_targets[i]!.addEventListener(event, test_event, false);
			}

			let evt = document.createEvent('Event');
			evt.initEvent(event, true, true);
			evt.stopPropagation();
			target.dispatchEvent(evt);

			{
				const actual = actual_targets;
				const expected = expected_targets;
				expect(actual.length, 'actual_targets').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'actual_targets').toBe(expected[index]);
			}
			{
				const actual = actual_phases;
				const expected = expected_phases;
				expect(actual.length, 'actual_phases').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'actual_phases').toBe(expected[index]);
			}
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!doctype html><div id="log"></div><table id="table" border="1" style="display: none">
    <tbody id="table-body">
    <tr id="table-row">
        <td id="table-cell">Shady Grove</td>
        <td>Aeolian</td>
    </tr>
    <tr id="parent">
        <td id="target">Over the river, Charlie</td>
        <td>Dorian</td>
    </tr>
    </tbody>
</table>`,
			},
		},
	);
}
