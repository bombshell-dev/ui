// Adapted from WPT input-events-typing.html at b719612f963a05ece9c89a7dd7598c1c59618874.
// Copyright © web-platform-tests contributors. BSD-3-Clause; see ../../../../test/wpt/LICENSE.txt.
import type { CompatibilityContext } from '../../context.ts';
import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';

export const spec = 'https://www.w3.org/TR/input-events-2/#input-event-types';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/b719612f963a05ece9c89a7dd7598c1c59618874/input-events/input-events-typing.html';
export const input = ['keyboard', 'text'] as const;
export const requires = [
	'input.keyboard.delivery',
	'input.keyboard.modifiers',
	'events.data.input',
	'elements.textarea.value',
	'elements.textarea.selection',
	'selection.document.direction',
] as const;
// Selects the policy Enter = paragraph in contenteditable, Enter = line break in
// textarea, and Shift+Enter = line break in contenteditable. No platform detection.

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	for (const kind of ['textarea', 'contenteditable'] as const) {
		context.test(`orders typing events around the ${kind} edit`, async (fixture) => {
			const document = fixture.document as unknown as Document;
			const target = document.createElement(kind === 'textarea' ? 'textarea' : 'div');
			if (kind === 'contenteditable') target.contentEditable = 'true';
			fixture.connect(target as unknown as DOMElementContract);
			const value = (): string =>
				kind === 'textarea' ? (target as HTMLTextAreaElement).value : (target.textContent ?? '');
			const calls: unknown[] = [];
			for (const type of ['keydown', 'beforeinput', 'input', 'keyup'])
				target.addEventListener(type, (event) => {
					const edit = event as InputEvent;
					calls.push([
						type,
						event.target,
						value(),
						type === 'beforeinput' || type === 'input'
							? [edit.inputType, edit.data, edit.isComposing, event.cancelable]
							: (event as KeyboardEvent).key,
					]);
				});
			target.focus();
			await fixture.input.press('a');
			expect(value()).toBe('a');
			expect(calls).toEqual([
				['keydown', target, '', 'a'],
				['beforeinput', target, '', ['insertText', 'a', false, true]],
				['input', target, 'a', ['insertText', 'a', false, false]],
				['keyup', target, 'a', 'a'],
			]);
		});

		context.test(
			`canceling beforeinput preserves ${kind} text and selected range`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const target = document.createElement(kind === 'textarea' ? 'textarea' : 'div');
				const textarea = target as HTMLTextAreaElement;
				if (kind === 'textarea') textarea.value = 'abcd';
				else {
					target.contentEditable = 'true';
					target.textContent = 'abcd';
				}
				fixture.connect(target as unknown as DOMElementContract);
				target.focus();
				const text = target.firstChild;
				const selection = document.getSelection();
				if (kind === 'textarea') textarea.setSelectionRange(1, 3);
				else {
					if (!selection || !text)
						return expect.fail('Connected editable must have a selection and text node');
					fixture.cleanup(() => selection.removeAllRanges());
					selection.setBaseAndExtent(text, 1, text, 3);
				}
				const calls: string[] = [];
				target.addEventListener('beforeinput', (event) => {
					calls.push('beforeinput');
					event.preventDefault();
				});
				target.addEventListener('input', () => calls.push('input'));
				await fixture.input.insertText('X');
				expect(calls).toEqual(['beforeinput']);
				if (kind === 'textarea') {
					expect(textarea.value).toBe('abcd');
					expect([textarea.selectionStart, textarea.selectionEnd]).toEqual([1, 3]);
				} else {
					expect(target.textContent).toBe('abcd');
					expect(target.firstChild).toBe(text);
					expect(selection?.anchorNode).toBe(text);
					expect(selection?.focusNode).toBe(text);
					expect([selection?.anchorOffset, selection?.focusOffset]).toEqual([1, 3]);
				}
			},
		);
	}

	context.test('Enter replaces a textarea selection with a line break', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const target = document.createElement('textarea');
		fixture.connect(target as unknown as DOMElementContract);
		target.value = 'abcd';
		target.focus();
		target.setSelectionRange(1, 3);
		const calls: unknown[] = [];
		for (const type of ['beforeinput', 'input'])
			target.addEventListener(type, (event) => {
				const edit = event as InputEvent;
				calls.push([type, edit.inputType, target.value]);
			});
		await fixture.input.press('Enter');
		expect(calls).toEqual([
			['beforeinput', 'insertLineBreak', 'abcd'],
			['input', 'insertLineBreak', 'a\nd'],
		]);
		expect([target.selectionStart, target.selectionEnd]).toEqual([2, 2]);
	});

	for (const shift of [false, true]) {
		context.test(
			`${shift ? 'Shift+Enter' : 'Enter'} reports ${shift ? 'line-break' : 'paragraph'} insertion in contenteditable`,
			async (fixture) => {
				const document = fixture.document as unknown as Document;
				const target = document.createElement('div');
				target.contentEditable = 'true';
				target.textContent = 'abcd';
				fixture.connect(target as unknown as DOMElementContract);
				target.focus();
				const selection = document.getSelection();
				if (!selection || !target.firstChild)
					return expect.fail('Connected editable must have a selection and text node');
				fixture.cleanup(() => selection.removeAllRanges());
				selection.collapse(target.firstChild, 2);
				const originalMarkup = target.innerHTML;
				const calls: unknown[] = [];
				for (const type of ['beforeinput', 'input'])
					target.addEventListener(type, (event) => {
						const edit = event as InputEvent;
						calls.push([type, event.target, edit.inputType, edit.data, event.cancelable]);
					});
				if (shift) await fixture.input.keyDown('Shift');
				await fixture.input.press('Enter');
				if (shift) await fixture.input.keyUp('Shift');
				const inputType = shift ? 'insertLineBreak' : 'insertParagraph';
				expect(calls).toEqual([
					['beforeinput', target, inputType, null, true],
					['input', target, inputType, null, false],
				]);
				expect(target.innerHTML).not.toBe(originalMarkup);
				expect(target.textContent).toBe('abcd');
				expect(selection.isCollapsed).toBe(true);
				expect(target.contains(selection.anchorNode)).toBe(true);
			},
		);
	}

	context.test(
		'text insertion replaces a multiline textarea selection with Unicode text',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const target = document.createElement('textarea');
			fixture.connect(target as unknown as DOMElementContract);
			target.value = 'one\ntwo\nthree';
			target.focus();
			target.setSelectionRange(2, 9);
			await fixture.input.insertText('😀é');
			expect(target.value).toBe('on😀éhree');
			expect([target.selectionStart, target.selectionEnd]).toEqual([5, 5]);
		},
	);
}
