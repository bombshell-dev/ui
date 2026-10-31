import type { DOMElement as DOMElementContract } from '../../contracts/nodes.ts';
import type { CompatibilityContext } from '../../context.ts';
import type { DOMInputEvent } from '../../contracts/events.ts';

export const spec = 'https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes';
export const wpt =
	'https://github.com/web-platform-tests/wpt/blob/master/input-events/input-events-typing.html';
export const input = ['keyboard', 'text'] as const;
export const requires = [
	'input.keyboard.delivery',
	'events.data.input',
	'elements.input.value',
	'elements.input.selection',
] as const;

/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'text input replaces the selection between beforeinput and input',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('input'));
			target.value = 'abcd';
			target.focus();
			target.setSelectionRange(1, 3);
			const received: unknown[][] = [];
			for (const type of ['beforeinput', 'input']) {
				target.addEventListener(type, (event) => {
					const edit = event as DOMInputEvent;
					received.push([
						edit.type,
						edit.inputType,
						edit.data,
						edit.cancelable,
						edit.bubbles,
						target.value,
						target.selectionStart,
						target.selectionEnd,
					]);
				});
			}
			await fixture.input.insertText('X');
			expect(received).toEqual([
				['beforeinput', 'insertText', 'X', true, true, 'abcd', 1, 3],
				['input', 'insertText', 'X', false, true, 'aXd', 2, 2],
			]);
			expect(target.value).toBe('aXd');
		},
	);

	context.test(
		'canceling beforeinput preserves the value and selection and suppresses input',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('input'));
			target.value = 'abcd';
			target.focus();
			target.setSelectionRange(1, 3);
			const received: string[] = [];
			target.addEventListener('beforeinput', (event) => {
				received.push(event.type);
				event.preventDefault();
			});
			target.addEventListener('input', (event) => received.push(event.type));
			await fixture.input.insertText('X');
			expect(received).toEqual(['beforeinput']);
			expect([target.value, target.selectionStart, target.selectionEnd]).toEqual(['abcd', 1, 3]);
		},
	);

	for (const [key, inputType, value, caret] of [
		['Backspace', 'deleteContentBackward', 'acd', 1],
		['Delete', 'deleteContentForward', 'abd', 2],
	] as const) {
		context.test(
			`${key} deletes beside the caret with the appropriate input type`,
			async (fixture) => {
				const target = fixture.connect(fixture.document.createElement('input'));
				target.value = 'abcd';
				target.focus();
				target.setSelectionRange(2, 2);
				const received: unknown[][] = [];
				for (const type of ['beforeinput', 'input']) {
					target.addEventListener(type, (event) => {
						const edit = event as DOMInputEvent;
						received.push([edit.type, edit.inputType, edit.data]);
					});
				}
				await fixture.input.press(key);
				expect(received).toEqual([
					['beforeinput', inputType, null],
					['input', inputType, null],
				]);
				expect([target.value, target.selectionStart, target.selectionEnd]).toEqual([
					value,
					caret,
					caret,
				]);
			},
		);
	}

	context.test(
		'Backspace deletes a selected range instead of the preceding character',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('input'));
			target.value = 'abcd';
			target.focus();
			target.setSelectionRange(1, 3);
			await fixture.input.press('Backspace');
			expect([target.value, target.selectionStart, target.selectionEnd]).toEqual(['ad', 1, 1]);
		},
	);

	context.test(
		'canceling a deletion keydown prevents editing events and mutation',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('input'));
			target.value = 'abcd';
			target.focus();
			target.setSelectionRange(2, 2);
			const received: string[] = [];
			target.addEventListener('keydown', (event) => event.preventDefault());
			for (const type of ['beforeinput', 'input']) {
				target.addEventListener(type, () => received.push(type));
			}
			await fixture.input.press('Backspace');
			expect(received).toEqual([]);
			expect([target.value, target.selectionStart, target.selectionEnd]).toEqual(['abcd', 2, 2]);
		},
	);

	context.test(
		'read-only controls accept focus without allowing text insertion or deletion',
		async (fixture) => {
			const target = fixture.connect(fixture.document.createElement('input'));
			target.value = 'abcd';
			target.readOnly = true;
			target.focus();
			target.setSelectionRange(1, 3);
			let changes = 0;
			target.addEventListener('input', () => changes++);
			await fixture.input.insertText('X');
			await fixture.input.press('Backspace');
			expect(fixture.document.activeElement).toBe(target);
			expect(target.value).toBe('abcd');
			expect(changes).toBe(0);
		},
	);

	context.test(
		'Delete removes a noncollapsed selection and leaves a collapsed caret',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('input');
			fixture.connect(e as unknown as DOMElementContract);
			e.value = 'abcdef';
			e.focus();
			e.setSelectionRange(2, 4, 'backward');
			await fixture.input.press('Delete');
			expect(e.value).toBe('abef');
			expect(e.selectionStart).toBe(2);
			expect(e.selectionEnd).toBe(2);
		},
	);

	context.test(
		'Backspace at the start and Delete at the end leave text unchanged',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('input');
			fixture.connect(e as unknown as DOMElementContract);
			e.value = 'abc';
			e.focus();
			e.setSelectionRange(0, 0);
			await fixture.input.press('Backspace');
			expect(e.value).toBe('abc');
			expect(e.selectionStart).toBe(0);
			e.setSelectionRange(3, 3);
			await fixture.input.press('Delete');
			expect(e.value).toBe('abc');
			expect(e.selectionStart).toBe(3);
		},
	);

	context.test('keydown cancellation blocks printable key default editing', async (fixture) => {
		const document = fixture.document as unknown as Document;
		const e = document.createElement('input');
		fixture.connect(e as unknown as DOMElementContract);
		e.value = 'abc';
		e.focus();
		e.setSelectionRange(1, 1);
		let edits = 0;
		e.addEventListener('keydown', (event) => event.preventDefault());
		e.addEventListener('input', () => edits++);
		await fixture.input.press('x');
		expect(e.value).toBe('abc');
		expect(e.selectionStart).toBe(1);
		expect(edits).toBe(0);
	});

	context.test(
		'successive host text insertions preserve Unicode and replace selection',
		async (fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('input');
			fixture.connect(e as unknown as DOMElementContract);
			e.focus();
			await fixture.input.insertText('A😀B');
			expect(e.value).toBe('A😀B');
			expect(e.selectionStart).toBe(4);
			e.setSelectionRange(1, 3);
			await fixture.input.insertText('é');
			expect(e.value).toBe('AéB');
			expect(e.selectionStart).toBe(2);
		},
	);
}
