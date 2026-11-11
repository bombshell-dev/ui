import type { CompatibilityContext } from '../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'mouse events fired without button state',
		async ({ document, step, input }) => {
			let button = -1;
			let finish!: () => void;
			const finished = new Promise<void>((resolve) => {
				finish = resolve;
			});
			function on_event(target: EventTarget, type: string, callback: (event: MouseEvent) => void) {
				target.addEventListener(
					type,
					step((event) => callback(event as MouseEvent)),
				);
			}

			var lightgreen = document.getElementById('lightgreen')!;
			var lightyellow = document.getElementById('lightyellow')!;
			var lightblue = document.getElementById('lightblue')!;

			on_event(lightgreen, 'contextmenu', function (event) {
				event.preventDefault();
			});

			on_event(lightgreen, 'mousedown', function (event) {
				step(function () {
					expect(button, 'There must only be one mouse down event.').toBe(-1);
				})();
				step(function () {
					expect(event.button, 'Must not be primary button.').not.toBe(0);
				})();
				button = event.button;
			});
			on_event(lightyellow, 'click', function (event) {
				step(function () {
					expect(event.button, 'Button must be the same as mousedown.').toBe(button);
				})();
			});
			on_event(lightyellow, 'mousemove', function (event) {
				if (button != -1) {
					step(function () {
						expect(event.button, 'Button must be un-initialized for mousemove.').toBe(0);
					})();
				}
			});
			on_event(lightgreen, 'mouseleave', function (event) {
				if (button != -1) {
					step(function () {
						expect(event.button, 'Button must be un-initialized for mouseleave.').toBe(0);
					})();
				}
			});
			on_event(lightblue, 'mouseenter', function (event) {
				if (button != -1) {
					step(function () {
						expect(event.button, 'Button must be un-initialized for mouseenter.').toBe(0);
					})();
				}
			});
			on_event(lightblue, 'mouseup', function (event) {
				if (button != -1) {
					step(function () {
						expect(event.button, 'Button must be the same as mousedown.').toBe(button);
					})();
					// Make sure the test finishes after all the input actions are completed.
					finish();
				}
			});

			// Inject mouse inputs.
			await input.move(lightgreen);
			await input.down(1);
			await input.move(lightyellow);
			await input.move(lightblue);
			await input.up(1);
			await finished;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!doctype html>
<html>
    <head>
        <title>Mouse Events with button depressed</title>
        <meta name="timeout" content="long">
        <meta name="viewport" content="width=device-width">
\x20\x20\x20\x20\x20\x20\x20\x20
\x20\x20\x20\x20\x20\x20\x20\x20
\x20\x20\x20\x20\x20\x20\x20\x20
\x20\x20\x20\x20\x20\x20\x20\x20
\x20\x20\x20\x20\x20\x20\x20\x20
        <style>
            div.box {
                border: 2px solid lightgray;
                margin: 25px;
                padding: 25px;
                float: left;
            }
            #lightyellow {
                background-color: lightyellow;
            }
            #lightblue {
                background-color: lightblue;
            }
            #lightgreen {
                background-color: lightgreen;
            }
        </style>
    </head>
    <body>
        <h2>Mouse Events</h2>
        <h4>Test Description: This test checks if mouse events set button property correctly
            <ol>
                <li>Put your mouse over the green rectangle</li>
                <li>Press a non-primary button and hold it</li>
                <li>Drag mouse to blue rectangle</li>
                <li>Release mouse button</li>
            </ol>
        </h4>
        <div class="box" id="lightyellow">
            <div class="box" id="lightgreen"></div>
            <div class="box" id="lightblue"></div>
        </div>
\x20\x20\x20\x20\x20\x20\x20\x20
    </body>
</html>
`,
			},
		},
	);
}
