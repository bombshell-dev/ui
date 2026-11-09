import type { CompatibilityContext } from '../../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Mouseover/out events',
		async ({ document, step, input }) => {
			var outer = document.getElementById('outer')!;
			var inner = document.getElementById('inner')!;
			let finish!: () => void;
			const finished = new Promise<void>((resolve) => {
				finish = resolve;
			});

			var inner_over = 0;
			var inner_out = 0;

			var outer_own_over = 0;
			var outer_own_out = 0;
			var outer_over = 0;
			var outer_out = 0;

			inner.addEventListener(
				'mouseover',
				step(function (e) {
					expect(inner_over, 'mouseover is received before mouseout').toBe(inner_out);

					switch (inner_over) {
						case 0:
							expect(outer_own_over, 'should have triggered a mouseover in the outer before').toBe(
								1,
							);
							break;
						case 1:
							expect(
								outer_own_over,
								'should have not triggered a mouseover in the outer before',
							).toBe(1);
							break;
						default:
							expect(false, 'should not get more than two mouseovers').toBe(true);
					}

					inner_over++;
				}),
				false,
			);

			inner.addEventListener(
				'mouseout',
				step(function (e) {
					expect(inner_over, 'mouseout is received after mouseover').toBe(inner_out + 1);

					switch (inner_out) {
						case 0:
							expect(
								outer_own_out,
								'mouseout should have been received in the parent when hovering over this element',
							).toBe(1);
							break;
						case 1:
							break;
						default:
							expect(false, 'should not get more than two mouseouts').toBe(true);
					}

					inner_out++;
				}),
				false,
			);

			outer.addEventListener(
				'mouseover',
				step(function (e) {
					if (e.target == outer) {
						expect(outer_own_over, 'outer: mouseover is received before mouseout').toBe(
							outer_own_out,
						);
						outer_own_over++;
					} else {
						expect(
							outer_over - outer_own_over,
							'mouseover: should only receive this via bubbling',
						).toBe(inner_over - 1);
					}

					outer_over++;
				}),
				false,
			);

			outer.addEventListener(
				'mouseout',
				step(function (e) {
					if (e.target == outer) {
						expect(outer_own_over, 'outer: mouseout is received after mouseover').toBe(
							outer_own_out + 1,
						);
						if (outer_own_out == 1) {
							expect(inner_out, 'inner should be done now').toBe(2);
							// Make sure the test finishes after all the input actions are completed.
							finish();
						}

						outer_own_out++;
					} else {
						expect(
							outer_out - outer_own_out,
							'mouseout: should only receive this via bubbling',
						).toBe(inner_out - 1);
					}

					outer_out++;
				}),
				false,
			);

			// Inject mouse inputs.
			for (const target of [outer, inner, document.getElementById('released')!, inner, outer])
				await input.move(target);
			await input.moveViewport(0, 0);
			await finished;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!doctype html>
<meta charset="utf-8">
<title>Mouseover/mouseout handling</title>





<style>
#outer,
#inner,
#released {
  padding: 10px;
  margin: 10px;
  height: 15px;
}

#outer:hover,
#inner:hover,
#released:hover {
  background: red;
}

#outer {
  background: blue;
}

#inner {
  background: green;
}

#released {
  background: yellow;
}
</style>
<p>
  Steps:

  <ol>
    <li>Move your mouse over the blue <code>&lt;div&gt;</code> element, later
      over the green one, later over the yellow one.
    <li>Move the mouse from the yellow element to the green one, later to the
      blue one, and later over this paragraph.
  </ol>
</p>


<div id="outer">
  <div id="inner"></div>
</div>
<div id="released"></div>

<div id="log"></div>


`,
			},
		},
	);
}
