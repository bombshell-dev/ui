import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Dispatch additional events inside an event listener',
		({ document, step }) => {
			const window = document.defaultView!;

			let event_type = 'bar';
			let target = document.getElementById('target')!;
			let parent = document.getElementById('parent')!;
			let tbody = document.getElementById('table-body')!;
			let table = document.getElementById('table')!;
			let body = document.body;
			let html = document.documentElement;
			let targets = [window, document, html, body, table, tbody, parent, target];
			let expected_targets = [
				window,
				document,
				html,
				body,
				table,
				tbody,
				parent,
				target,
				target,
				target, // The additional listener for target runs as we copy its listeners twice
				parent,
				tbody,
				table,
				body,
				html,
				document,
				window,
			];
			let expected_listeners = [0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 1, 1, 1, 1, 1];

			let actual_targets: (EventTarget | null)[] = [],
				actual_listeners: number[] = [];
			let test_event_function = function (i: number) {
				return step(function (evt: Event) {
					actual_targets.push(evt.currentTarget);
					actual_listeners.push(i);

					if (
						evt.eventPhase != evt.BUBBLING_PHASE &&
						(evt.currentTarget as EventTarget & { foo?: number }).foo != 1
					) {
						evt.currentTarget!.removeEventListener(event_type, event_handlers[0]!, true);
						evt.currentTarget!.addEventListener(event_type, event_handlers[2]!, true);
						(evt.currentTarget as EventTarget & { foo?: number }).foo = 1;
					}

					if (
						evt.eventPhase != evt.CAPTURING_PHASE &&
						(evt.currentTarget as EventTarget & { foo?: number }).foo != 3
					) {
						evt.currentTarget!.removeEventListener(event_type, event_handlers[0]!, false);
						evt.currentTarget!.addEventListener(event_type, event_handlers[3]!, false);
						(evt.currentTarget as EventTarget & { foo?: number }).foo = 3;
					}
				});
			};
			let event_handlers = [
				test_event_function(0),
				test_event_function(1),
				test_event_function(2),
				test_event_function(3),
			];

			for (let i = 0; i < targets.length; ++i) {
				targets[i]!.addEventListener(event_type, event_handlers[0]!, true);
				targets[i]!.addEventListener(event_type, event_handlers[1]!, false);
			}

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, true, true);
			target.dispatchEvent(evt);

			{
				const actual = actual_targets;
				const expected = expected_targets;
				expect(actual.length, 'actual_targets').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'actual_targets').toBe(expected[index]);
			}
			{
				const actual = actual_listeners;
				const expected = expected_listeners;
				expect(actual.length, 'actual_listeners').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'actual_listeners').toBe(expected[index]);
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
