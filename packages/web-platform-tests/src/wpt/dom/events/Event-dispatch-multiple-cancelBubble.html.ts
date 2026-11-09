import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Multiple dispatchEvent() and cancelBubble',
		({ document }) => {
			const window = document.defaultView!;

			let event_type = 'foo';
			let target = document.getElementById('target')!;
			let parent = document.getElementById('parent')!;
			let actual_result: (EventTarget | null)[];
			let test_event = function (evt: Event) {
				actual_result.push(evt.currentTarget);

				if (parent == evt.currentTarget) {
					evt.cancelBubble = true;
				}
			};

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, true, true);

			target.addEventListener(event_type, test_event, false);
			parent.addEventListener(event_type, test_event, false);
			document.addEventListener(event_type, test_event, false);
			window.addEventListener(event_type, test_event, false);

			actual_result = [];
			target.dispatchEvent(evt);
			expect(actual_result).toHaveLength(2);
			expect(actual_result[0]).toBe(target);
			expect(actual_result[1]).toBe(parent);

			actual_result = [];
			parent.dispatchEvent(evt);
			expect(actual_result).toHaveLength(1);
			expect(actual_result[0]).toBe(parent);

			actual_result = [];
			document.dispatchEvent(evt);
			expect(actual_result).toHaveLength(2);
			expect(actual_result[0]).toBe(document);
			expect(actual_result[1]).toBe(window);
		},
		{
			document: {
				contentType: 'text/html',
				content:
					'<!doctype html><div id="log"></div><div id="parent" style="display: none">\n    <input id="target" type="hidden" value=""/>\n</div>',
			},
		},
	);
}
