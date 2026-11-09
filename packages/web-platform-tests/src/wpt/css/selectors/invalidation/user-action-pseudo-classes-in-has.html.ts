import type { CompatibilityContext } from '../../../../shared/context.ts';

export const input = ['keyboard', 'mouse'] as const;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'user-action pseudo classes in :has() argument',
		async ({ document, getComputedStyle, input }) => {
			const subject1 = document.getElementById('subject1')!;
			const subject2 = document.getElementById('subject2')!;
			const subject3 = document.getElementById('subject3')!;
			const subject4 = document.getElementById('subject4')!;
			const hoverme = document.getElementById('hoverme')!;
			const unhoverme = document.getElementById('unhoverme')!;
			const focusme1 = document.getElementById('focusme1')!;
			const focusme2 = document.getElementById('focusme2')!;
			const focusme3 = document.getElementById('focusme3')!;
			const focusme4 = document.getElementById('focusme4')!;

			expect(getComputedStyle(subject1).color, 'subject1 initially black').toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(subject2).color, 'subject3 initially black').toBe('rgb(0, 0, 0)');

			await input.move(hoverme);
			expect(getComputedStyle(subject1).color, 'subject1 should be blue').toBe('rgb(0, 0, 255)');
			expect(getComputedStyle(subject3).color, 'subject3 should be navy').toBe('rgb(0, 0, 128)');

			await input.move(unhoverme);
			expect(getComputedStyle(subject1).color, 'subject1 should be back to black').toBe(
				'rgb(0, 0, 0)',
			);
			expect(getComputedStyle(subject3).color, 'subject3 should be back to black').toBe(
				'rgb(0, 0, 0)',
			);

			await input.move(hoverme);
			await input.down();
			expect(getComputedStyle(subject1).color, 'subject1 should be skyblue').toBe(
				'rgb(135, 206, 235)',
			);
			expect(getComputedStyle(subject3).color, 'subject3 should be lightblue').toBe(
				'rgb(173, 216, 230)',
			);

			// Clean up `pointerDown` from above. We want to test invalidation from
			// `:hover:active` to `:hover`, but there's no guarantee that pointer
			// state will stay the same between actions.
			await input.up();
			await input.move(unhoverme);

			// Perform the entire activation chain again, then perform `pointerUp`.
			await input.move(hoverme);
			await input.down();
			await input.up();
			expect(getComputedStyle(subject1).color, 'subject1 should be blue').toBe('rgb(0, 0, 255)');
			expect(getComputedStyle(subject3).color, 'subject3 should be navy').toBe('rgb(0, 0, 128)');

			await input.move(focusme1);
			await input.down();
			await input.up();
			expect(getComputedStyle(subject1).color, 'subject1 should be green').toBe('rgb(0, 128, 0)');
			expect(getComputedStyle(subject3).color, 'subject3 should be darkgreen').toBe(
				'rgb(0, 100, 0)',
			);

			document.body.focus();
			await input.press('Tab');
			expect(getComputedStyle(subject1).color, 'subject1 should be yellowgreen').toBe(
				'rgb(154, 205, 50)',
			);
			expect(getComputedStyle(subject3).color, 'subject3 should be greenyellow').toBe(
				'rgb(173, 255, 47)',
			);

			document.body.focus();
			await input.press('Tab');
			expect(getComputedStyle(subject1).color, 'subject1 should be lightgreen').toBe(
				'rgb(144, 238, 144)',
			);
			expect(getComputedStyle(subject3).color, 'subject3 should be violet').toBe(
				'rgb(238, 130, 238)',
			);

			focusme3.remove();
			expect(getComputedStyle(subject1).color, 'subject1 should be black').toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(subject3).color, 'subject3 should be black').toBe('rgb(0, 0, 0)');

			document.body.focus();
			await input.press('Tab');
			expect(getComputedStyle(subject2).color, 'subject2 should be green').toBe('rgb(0, 128, 0)');
			expect(getComputedStyle(subject4).color, 'subject4 should be darkgreen').toBe(
				'rgb(0, 100, 0)',
			);

			focusme4.remove();
			expect(getComputedStyle(subject2).color, 'subject2 should be black').toBe('rgb(0, 0, 0)');
			expect(getComputedStyle(subject4).color, 'subject4 should be black').toBe('rgb(0, 0, 0)');
		},
		{
			document: {
				contentType: 'text/html',
				content: `<!DOCTYPE html>
<meta charset="utf-8" />
<title>CSS Selectors Invalidation: user-action pseudo classes in :has() argument</title>
<link rel="author" title="Byungwoo Lee" href="blee@igalia.com">
<link rel="help" href="https://drafts.csswg.org/selectors/#relational">





<style>
  .ancestor:has(.descendant1:hover) { color: blue }
  .ancestor:has(.descendant1:hover) .other-descendant { color: navy }
  .ancestor:has(.descendant1:hover:active) { color: skyblue }
  .ancestor:has(.descendant1:hover:active) .other-descendant { color: lightblue }
  .ancestor:has(:focus) { color: green }
  .ancestor:has(:focus) .other-descendant { color: darkgreen }
  .ancestor:has(.descendant2:focus-visible) { color: yellowgreen }
  .ancestor:has(.descendant2:focus-visible) .other-descendant { color: greenyellow }
  .ancestor:has(.descendant3:focus-within) { color: lightgreen }
  .ancestor:has(.descendant3:focus-within) .other-descendant { color: violet }
</style>
<div id=subject1 class=ancestor>
  <div>
    <div id=unhoverme>No :hover</div>
    <div id=hoverme class=descendant1>Hover and click me</div>
    <div id=focusme1 tabindex=1>Focus me</div>
    <div id=focusme2 class=descendant2 tabindex=2>Focus me</div>
    <div class=descendant3>
      <div><div id=focusme3 tabindex=3>Focus me</div></div>
    </div>
  </div>
  <div><div id=subject3 class=other-descendant>subject</div></div>
</div>
<div id=subject2 class=ancestor>
  <div id=focusme4 tabindex=4>Focus me</div>
  <div><div id=subject4 class=other-descendant>subject</div></div>
</div>

`,
			},
		},
	);
}
