import type { CompatibilityContext } from '../../../../shared/context.ts';

const markup = `<!DOCTYPE html>
<!-- Modified from Chris Rebert's manual version -->
<!-- This documents the behavior according to blink's implementation -->
<html>
  <head>
    <meta charset="utf-8">
    <title>Focus-related events should fire in the correct order</title>
\x20\x20\x20\x20
\x20\x20\x20\x20
\x20\x20\x20\x20
  </head>
  <body id="body">
    <input type="text" id="a" value="First">
    <input type="text" id="b" value="Second">
    <br>
    <input type="text" id="c" value="Third">
    <iframe id="iframe">
    </iframe>
    <br>
\x20\x20\x20\x20
  </body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Focus-related events should fire in the correct order (same DocumentOwner)',
		async ({ document, step }) => {
			let test_id = 0;
			let tests = ['normal', 'iframe'];

			function record(evt: FocusEvent) {
				if (done && (evt.type == 'focusin' || evt.type == 'focus') && evt.target == c) {
					startNext();
				}
				if (!done) {
					let activeElement = document.activeElement
						? document.activeElement.tagName === 'IFRAME'
							? (document.activeElement as HTMLIFrameElement).contentDocument!.activeElement!.id
							: document.activeElement.id
						: null;
					events[tests[test_id]!]!.push(evt.type);
					targets[tests[test_id]!]!.push((evt.target as Element).id);
					focusedElements[tests[test_id]!]!.push(activeElement);
					relatedTargets[tests[test_id]!]!.push(
						evt.relatedTarget ? (evt.relatedTarget as Element).id : null,
					);
				}
			}
			function startNext() {
				done = false;
				test_id++;
			}
			function finish() {
				done = true;
			}
			let relevantEvents = ['focus', 'blur', 'focusin', 'focusout'];

			let iframe = document.getElementById('iframe') as HTMLIFrameElement;
			let a = document.getElementById('a')!;
			let b = document.getElementById('b')!;
			let c = document.getElementById('c')!;
			let d = document.createElement('input');

			d.setAttribute('id', 'd');
			d.setAttribute('type', 'text');
			d.setAttribute('value', 'Fourth');

			let events: Record<string, string[]> = { normal: [], iframe: [] };
			let targets: Record<string, string[]> = { normal: [], iframe: [] };
			let focusedElements: Record<string, (string | null)[]> = { normal: [], iframe: [] };
			let relatedTargets: Record<string, (string | null)[]> = { normal: [], iframe: [] };
			let done = false;

			await new Promise<void>((resolve) => {
				iframe.contentDocument!.body.appendChild(d);

				let inputs = [a, b, c, d];

				for (let i = 0; i < inputs.length; i++) {
					for (let k = 0; k < relevantEvents.length; k++) {
						inputs[i]!.addEventListener(relevantEvents[k]!, record as EventListener, false);
					}
				}

				a.addEventListener(
					'focusin',
					function () {
						b.focus();
					},
					false,
				);
				b.addEventListener(
					'focusin',
					function () {
						step(() => {
							expect(
								events['normal']!,
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toHaveLength(6);
							expect(
								events['normal']![0],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focus');
							expect(
								events['normal']![1],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focusin');
							expect(
								events['normal']![2],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('blur');
							expect(
								events['normal']![3],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focusout');
							expect(
								events['normal']![4],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focus');
							expect(
								events['normal']![5],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focusin');

							expect(
								targets['normal']!,
								'Focus-related events should fire at the correct targets',
							).toHaveLength(6);
							expect(
								targets['normal']![0],
								'Focus-related events should fire at the correct targets',
							).toBe('a');
							expect(
								targets['normal']![1],
								'Focus-related events should fire at the correct targets',
							).toBe('a');
							expect(
								targets['normal']![2],
								'Focus-related events should fire at the correct targets',
							).toBe('a');
							expect(
								targets['normal']![3],
								'Focus-related events should fire at the correct targets',
							).toBe('a');
							expect(
								targets['normal']![4],
								'Focus-related events should fire at the correct targets',
							).toBe('b');
							expect(
								targets['normal']![5],
								'Focus-related events should fire at the correct targets',
							).toBe('b');

							expect(
								relatedTargets['normal']!,
								'Focus-related events should reference correct relatedTargets',
							).toHaveLength(6);
							expect(
								relatedTargets['normal']![0],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['normal']![1],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['normal']![2],
								'Focus-related events should reference correct relatedTargets',
							).toBe('b');
							expect(
								relatedTargets['normal']![3],
								'Focus-related events should reference correct relatedTargets',
							).toBe('b');
							expect(
								relatedTargets['normal']![4],
								'Focus-related events should reference correct relatedTargets',
							).toBe('a');
							expect(
								relatedTargets['normal']![5],
								'Focus-related events should reference correct relatedTargets',
							).toBe('a');

							expect(
								focusedElements['normal']!,
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toHaveLength(6);
							expect(
								focusedElements['normal']![0],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('a');
							expect(
								focusedElements['normal']![1],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('a');
							expect(
								focusedElements['normal']![2],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('body');
							expect(
								focusedElements['normal']![3],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('body');
							expect(
								focusedElements['normal']![4],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('b');
							expect(
								focusedElements['normal']![5],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('b');
						})();
						resolve();

						b.addEventListener('focusout', function () {
							finish();
							c.focus();
						});
						b.blur();
					},
					false,
				);

				c.addEventListener('focusin', function () {
					d.focus();
				});
				d.addEventListener(
					'focusin',
					function () {
						d.addEventListener('focusout', function () {
							finish();
						});
					},
					false,
				);

				a.focus();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'Focus-related events should fire in the correct order (different DocumentOwner)',
		async ({ document, step }) => {
			let test_id = 0;
			let tests = ['normal', 'iframe'];

			function record(evt: FocusEvent) {
				if (done && (evt.type == 'focusin' || evt.type == 'focus') && evt.target == c) {
					startNext();
				}
				if (!done) {
					let activeElement = document.activeElement
						? document.activeElement.tagName === 'IFRAME'
							? (document.activeElement as HTMLIFrameElement).contentDocument!.activeElement!.id
							: document.activeElement.id
						: null;
					events[tests[test_id]!]!.push(evt.type);
					targets[tests[test_id]!]!.push((evt.target as Element).id);
					focusedElements[tests[test_id]!]!.push(activeElement);
					relatedTargets[tests[test_id]!]!.push(
						evt.relatedTarget ? (evt.relatedTarget as Element).id : null,
					);
				}
			}
			function startNext() {
				done = false;
				test_id++;
			}
			function finish() {
				done = true;
			}
			let relevantEvents = ['focus', 'blur', 'focusin', 'focusout'];

			let iframe = document.getElementById('iframe') as HTMLIFrameElement;
			let a = document.getElementById('a')!;
			let b = document.getElementById('b')!;
			let c = document.getElementById('c')!;
			let d = document.createElement('input');

			d.setAttribute('id', 'd');
			d.setAttribute('type', 'text');
			d.setAttribute('value', 'Fourth');

			let events: Record<string, string[]> = { normal: [], iframe: [] };
			let targets: Record<string, string[]> = { normal: [], iframe: [] };
			let focusedElements: Record<string, (string | null)[]> = { normal: [], iframe: [] };
			let relatedTargets: Record<string, (string | null)[]> = { normal: [], iframe: [] };
			let done = false;

			await new Promise<void>((resolve) => {
				iframe.contentDocument!.body.appendChild(d);

				let inputs = [a, b, c, d];

				for (let i = 0; i < inputs.length; i++) {
					for (let k = 0; k < relevantEvents.length; k++) {
						inputs[i]!.addEventListener(relevantEvents[k]!, record as EventListener, false);
					}
				}

				a.addEventListener(
					'focusin',
					function () {
						b.focus();
					},
					false,
				);
				b.addEventListener(
					'focusin',
					function () {
						b.addEventListener('focusout', function () {
							finish();
							c.focus();
						});
						b.blur();
					},
					false,
				);

				c.addEventListener('focusin', function () {
					d.focus();
				});
				d.addEventListener(
					'focusin',
					function () {
						step(() => {
							expect(
								events['iframe']!,
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toHaveLength(6);
							expect(
								events['iframe']![0],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focus');
							expect(
								events['iframe']![1],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focusin');
							expect(
								events['iframe']![2],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('blur');
							expect(
								events['iframe']![3],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focusout');
							expect(
								events['iframe']![4],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focus');
							expect(
								events['iframe']![5],
								'Focus-related events should fire in this order: focusin, focus, focusout, focusin, blur, focus',
							).toBe('focusin');

							expect(
								targets['iframe']!,
								'Focus-related events should fire at the correct targets',
							).toHaveLength(6);
							expect(
								targets['iframe']![0],
								'Focus-related events should fire at the correct targets',
							).toBe('c');
							expect(
								targets['iframe']![1],
								'Focus-related events should fire at the correct targets',
							).toBe('c');
							expect(
								targets['iframe']![2],
								'Focus-related events should fire at the correct targets',
							).toBe('c');
							expect(
								targets['iframe']![3],
								'Focus-related events should fire at the correct targets',
							).toBe('c');
							expect(
								targets['iframe']![4],
								'Focus-related events should fire at the correct targets',
							).toBe('d');
							expect(
								targets['iframe']![5],
								'Focus-related events should fire at the correct targets',
							).toBe('d');

							expect(
								relatedTargets['iframe']!,
								'Focus-related events should reference correct relatedTargets',
							).toHaveLength(6);
							expect(
								relatedTargets['iframe']![0],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['iframe']![1],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['iframe']![2],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['iframe']![3],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['iframe']![4],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);
							expect(
								relatedTargets['iframe']![5],
								'Focus-related events should reference correct relatedTargets',
							).toBe(null);

							expect(
								focusedElements['iframe']!,
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toHaveLength(6);
							expect(
								focusedElements['iframe']![0],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('c');
							expect(
								focusedElements['iframe']![1],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('c');
							expect(
								focusedElements['iframe']![2],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('body');
							expect(
								focusedElements['iframe']![3],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('body');
							expect(
								focusedElements['iframe']![4],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('d');
							expect(
								focusedElements['iframe']![5],
								'Focus-related events should fire at the correct time relative to actual focus changes',
							).toBe('d');
						})();
						resolve();

						d.addEventListener('focusout', function () {
							finish();
						});
					},
					false,
				);

				a.focus();
			});
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
