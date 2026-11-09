import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!doctype html><div id="log"></div><table id="table" border="1" style="display: none">
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
</table>`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Return value of EventTarget.dispatchEvent() affected by preventDefault().',
		({ document }) => {
			const window = document.defaultView!;

			let event_type = 'foo';
			let target = document.getElementById('target')!;
			let parent = document.getElementById('parent')!;
			let default_prevented;
			let return_value;

			parent.addEventListener(event_type, function (e: Event) {}, true);
			target.addEventListener(
				event_type,
				function (e: Event) {
					evt.preventDefault();
					default_prevented = evt.defaultPrevented;
					return_value = evt.returnValue;
				},
				true,
			);
			target.addEventListener(event_type, function (e: Event) {}, true);

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, true, true);

			expect(parent.dispatchEvent(evt)).toBe(true);
			expect(target.dispatchEvent(evt)).toBe(false);
			expect(default_prevented).toBe(true);
			expect(return_value).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Return value of EventTarget.dispatchEvent() affected by returnValue.',
		({ document }) => {
			const window = document.defaultView!;

			let event_type = 'foo';
			let target = document.getElementById('target')!;
			let parent = document.getElementById('parent')!;
			let default_prevented;
			let return_value;

			parent.addEventListener(event_type, function (e: Event) {}, true);
			target.addEventListener(
				event_type,
				function (e: Event) {
					evt.returnValue = false;
					default_prevented = evt.defaultPrevented;
					return_value = evt.returnValue;
				},
				true,
			);
			target.addEventListener(event_type, function (e: Event) {}, true);

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, true, true);

			expect(parent.dispatchEvent(evt)).toBe(true);
			expect(target.dispatchEvent(evt)).toBe(false);
			expect(default_prevented).toBe(true);
			expect(return_value).toBe(false);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
