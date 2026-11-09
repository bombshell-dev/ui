import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Event propagation path when an element in it is moved within the DOM',
		(fixture) => {
			const { document } = fixture;
			const window = document.defaultView!;
			const Event = fixture.Event;

			let event_type = 'foo';
			let target = document.getElementById('target')!;
			let parent = document.getElementById('parent')!;
			let tbody = document.getElementById('table-body')!;
			let table = document.getElementById('table')!;
			let body = document.body;
			let html = document.documentElement;
			let targets = [window, document, html, body, table, tbody, parent, target];
			let expected_targets = targets.concat([
				target,
				parent,
				tbody,
				table,
				body,
				html,
				document,
				window,
			]);
			let phases = [
				Event.CAPTURING_PHASE,
				Event.CAPTURING_PHASE,
				Event.CAPTURING_PHASE,
				Event.CAPTURING_PHASE,
				Event.CAPTURING_PHASE,
				Event.CAPTURING_PHASE,
				Event.CAPTURING_PHASE,
				Event.AT_TARGET,
				Event.AT_TARGET,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
				Event.BUBBLING_PHASE,
			];

			let actual_targets: (EventTarget | null)[] = [],
				actual_phases: number[] = [];
			let test_event = fixture.step(function (evt: Event) {
				if (parent === target.parentNode) {
					let table_row = document.getElementById('table-row')!;
					table_row.appendChild(parent.removeChild(target));
				}

				actual_targets.push(evt.currentTarget);
				actual_phases.push(evt.eventPhase);
			});

			for (let i = 0; i < targets.length; i++) {
				targets[i]!.addEventListener(event_type, test_event, true);
				targets[i]!.addEventListener(event_type, test_event, false);
			}

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, true, true);
			target.dispatchEvent(evt);

			{
				const actual = actual_targets;
				const expected = expected_targets;
				expect(actual.length, 'targets').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'targets').toBe(expected[index]);
			}
			{
				const actual = actual_phases;
				const expected = phases;
				expect(actual.length, 'phases').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'phases').toBe(expected[index]);
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
