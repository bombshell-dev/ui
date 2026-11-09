import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = '<!doctype html><input id="input1"><input id="input2">';
	context.test(
		'relatedTarget on self blur',
		async ({ document, step, cleanup }) => {
			const input1 = document.getElementById('input1') as HTMLInputElement;
			const input2 = document.getElementById('input2') as HTMLInputElement;

			// Wait for the test window to gain focus before observing blur events.
			await new Promise<Event>((resolve) => {
				input1.addEventListener('focus', resolve, { once: true });
				input1.focus();
			});

			let blurCount = 0;
			let focusoutCount = 0;
			let focusCount = 0;
			let focusinCount = 0;
			const watchEvent = step((evt: Event) => {
				const { relatedTarget, target, type } = evt as FocusEvent;
				if (type === 'blur') {
					expect(target, 'blur target is input1').toBe(input1);
					expect(relatedTarget, 'blur relatedTarget is null').toBe(null);
					blurCount++;
				} else if (type === 'focusout') {
					expect(target, 'focusout target is input1').toBe(input1);
					expect(relatedTarget, 'focusout relatedTarget is null').toBe(null);
					focusoutCount++;
				} else if (type === 'focus') {
					focusCount++;
				} else if (type === 'focusin') {
					focusinCount++;
				}
			});
			document.addEventListener('blur', watchEvent, true);
			document.addEventListener('focusout', watchEvent, true);
			document.addEventListener('focus', watchEvent, true);
			document.addEventListener('focusin', watchEvent, true);
			cleanup(() => {
				document.removeEventListener('blur', watchEvent, true);
				document.removeEventListener('focusout', watchEvent, true);
				document.removeEventListener('focus', watchEvent, true);
				document.removeEventListener('focusin', watchEvent, true);
				input1.blur();
				input2.blur();
			});

			input1.blur();
			expect(blurCount, 'blur fired once').toBe(1);
			expect(focusoutCount, 'focusout fired once').toBe(1);
			expect(focusCount, 'focus not fired').toBe(0);
			expect(focusinCount, 'focusin not fired').toBe(0);
			expect(document.activeElement, 'activeElement is body').toBe(document.body);
		},
		{ document: { contentType: 'text/html', content } },
	);
	context.test(
		'relatedTarget for blur when focusing on another element',
		async ({ document, step, cleanup }) => {
			const input1 = document.getElementById('input1') as HTMLInputElement;
			const input2 = document.getElementById('input2') as HTMLInputElement;

			// Wait for the test window to gain focus before observing blur events.
			await new Promise<Event>((resolve) => {
				input1.addEventListener('focus', resolve, { once: true });
				input1.focus();
			});

			let blurCount = 0;
			let focusoutCount = 0;
			let focusCount = 0;
			let focusinCount = 0;
			const watchEvent = step((evt: Event) => {
				const { relatedTarget, target, type } = evt as FocusEvent;
				if (type === 'blur') {
					expect(target, 'blur target is input1').toBe(input1);
					expect(relatedTarget, 'blur relatedTarget is input2').toBe(input2);
					blurCount++;
				} else if (type === 'focusout') {
					expect(target, 'focusout target is input1').toBe(input1);
					expect(relatedTarget, 'focusout relatedTarget is input2').toBe(input2);
					focusoutCount++;
				} else if (type === 'focus') {
					expect(target, 'focus target is input2').toBe(input2);
					expect(relatedTarget, 'focus relatedTarget is input1').toBe(input1);
					focusCount++;
				} else if (type === 'focusin') {
					expect(target, 'focusin target is input2').toBe(input2);
					expect(relatedTarget, 'focusin relatedTarget is input1').toBe(input1);
					focusinCount++;
				}
			});
			document.addEventListener('blur', watchEvent, true);
			document.addEventListener('focusout', watchEvent, true);
			document.addEventListener('focus', watchEvent, true);
			document.addEventListener('focusin', watchEvent, true);
			cleanup(() => {
				document.removeEventListener('blur', watchEvent, true);
				document.removeEventListener('focusout', watchEvent, true);
				document.removeEventListener('focus', watchEvent, true);
				document.removeEventListener('focusin', watchEvent, true);
				input1.blur();
				input2.blur();
			});

			input2.focus();
			expect(blurCount, 'blur fired once').toBe(1);
			expect(focusoutCount, 'focusout fired once').toBe(1);
			expect(focusCount, 'focus fired once').toBe(1);
			expect(focusinCount, 'focusin fired once').toBe(1);
			expect(document.activeElement, 'activeElement is input2').toBe(input2);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
