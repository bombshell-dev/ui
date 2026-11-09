import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Dispatch additional events inside an event listener',
		({ document, step }) => {
			const window = document.defaultView!;

			let event_type = 'foo';
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
				target,
				parent,
				tbody,
				table,
				body,
				html,
				document,
				window,
				tbody,
				parent,
				target,
			];

			let expected_types = [
				'foo',
				'foo',
				'foo',
				'foo',
				'foo',
				'bar',
				'bar',
				'bar',
				'bar',
				'bar',
				'bar',
				'bar',
				'bar',
				'foo',
				'foo',
				'foo',
			];

			let actual_targets: (EventTarget | null)[] = [],
				actual_types: string[] = [];
			let test_event = step(function (evt: Event) {
				actual_targets.push(evt.currentTarget);
				actual_types.push(evt.type);

				if (table == evt.currentTarget && event_type == evt.type) {
					let e = document.createEvent('Event');
					e.initEvent('bar', true, true);
					target.dispatchEvent(e);
				}
			});

			for (let i = 0; i < targets.length; ++i) {
				targets[i]!.addEventListener(event_type, test_event, true);
				targets[i]!.addEventListener('bar', test_event, false);
			}

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, false, true);
			target.dispatchEvent(evt);

			{
				const actual = actual_targets;
				const expected = expected_targets;
				expect(actual.length, 'actual_targets').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'actual_targets').toBe(expected[index]);
			}
			{
				const actual = actual_types;
				const expected = expected_types;
				expect(actual.length, 'actual_types').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'actual_types').toBe(expected[index]);
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
