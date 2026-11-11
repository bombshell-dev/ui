import type { CompatibilityContext } from '../../../../shared/context.ts';

export const input = ['mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Focus-related events should fire in the correct order',
		async ({ document, step, input }) => {
			const a = document.getElementById('a')!;
			const b = document.getElementById('b')!;
			const button = document.getElementById('done')!;
			const records: { type: string; currentTarget: string }[] = [];
			for (const target of [a, b])
				for (const type of ['focus', 'blur', 'focusin', 'focusout'])
					target.addEventListener(type, (event) => {
						records.push({ type: event.type, currentTarget: target.id });
						event.stopPropagation();
					});
			const expected = [
				{ type: 'focus', target: 'b' },
				{ type: 'focusin', target: 'b' },
				{ type: 'blur', target: 'b' },
				{ type: 'focusout', target: 'b' },
				{ type: 'focus', target: 'a' },
				{ type: 'focusin', target: 'a' },
				{ type: 'blur', target: 'a' },
				{ type: 'focusout', target: 'a' },
				{ type: 'focus', target: 'b' },
				{ type: 'focusin', target: 'b' },
				{ type: 'blur', target: 'b' },
				{ type: 'focusout', target: 'b' },
			];
			// EventRecorder.checkRecords compares these fields; this case has no optional records.
			const clicked = new Promise<void>((resolve) =>
				button.addEventListener(
					'click',
					step(() => {
						expect(
							records.length === expected.length &&
								expected.every(
									(record, index) =>
										record.type === records[index]!.type &&
										record.target === records[index]!.currentTarget,
								),
						).toBe(true);
						resolve();
					}),
				),
			);
			for (const target of [b, a, b, button]) await input.click(target);
			await clicked;
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Focus-related events should fire in the correct order</title>
  <link rel="help" href="https://w3c.github.io/uievents/#events-focusevent-event-order">
\x20\x20
\x20\x20
\x20\x20
\x20\x20
\x20\x20
\x20\x20
</head>

<body>
  <ol>
    <li>Click into the text input.</li>
    <li>Click just below the text input.</li>
    <li>Click into the text input again.</li>
    <li>Click the "Done" button.</li>
  </ol>
  <div id="a" tabindex="1" style="width:400px; height:300px">
    <br /><br /><br />
    <input type="text" id="b">
  </div>
  <button type="button" id="done">Done</button>
</body>


</html>`,
			},
		},
	);
}
