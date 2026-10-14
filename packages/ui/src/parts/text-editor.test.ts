import type { KeyDown, KeyRepeat } from '@bomb.sh/tty';
import { describe, expect, test, vi } from 'vitest';
import { TextEditor } from './text-editor.ts';

describe('TextEditor', () => {
	test.each([
		{ command: 'insert', value: 'a😀xbc', caret: 3 },
		{ command: 'deleteBackward', value: 'bc', caret: 0 },
		{ command: 'deleteForward', value: 'ac', caret: 1 },
		{ command: 'moveBack', value: 'abc', caret: 0 },
		{ command: 'moveForward', value: 'abc', caret: 2 },
		{ command: 'moveMin', value: 'abc', caret: 0 },
		{ command: 'moveMax', value: 'abc', caret: 3 },
	] as const)('$command directly updates pure editor state', ({ command, value, caret }) => {
		const editor = new TextEditor({ content: 'abc' });
		editor.caret = 1;
		if (command === 'insert') editor.insert('😀x\r\n');
		else editor[command]();
		expect(editor.content).toBe(value);
		expect(editor.caret).toBe(caret);
	});

	test('direct navigation and deletion clamp at both boundaries', () => {
		const onChange = vi.fn();
		const editor = new TextEditor({ content: 'a😀b', onChange });
		editor.moveForward();
		editor.deleteForward();
		expect(editor.caret).toBe(3);
		editor.moveMin();
		editor.moveBack();
		editor.deleteBackward();
		expect(editor.content).toBe('a😀b');
		expect(editor.caret).toBe(0);
		expect(onChange).not.toHaveBeenCalled();
	});

	test('normalizes initial and replaced single-line content and clamps the caret', () => {
		const onChange = vi.fn();
		const editor = new TextEditor({ content: 'a\r\n😀b', onChange });
		expect(editor.content).toBe('a😀b');
		expect(editor.caret).toBe(3);
		expect(onChange).not.toHaveBeenCalled();
		editor.caret = 1;
		editor.content = 'longer';
		expect(editor.caret).toBe(1);
		editor.caret = Infinity;
		expect(editor.caret).toBe(6);
		editor.content = '😀\n';
		expect(editor.caret).toBe(1);
		editor.caret = -3;
		expect(editor.caret).toBe(0);
		editor.caret = NaN;
		expect(editor.caret).toBe(0);
		editor.caret = 0.8;
		expect(editor.caret).toBe(0);
		expect(onChange).toHaveBeenCalledTimes(2);
		expect(onChange).toHaveBeenLastCalledWith(editor);
	});

	test('edits complete code points and notifies with the final caret', () => {
		const changes: Array<[string, number]> = [];
		const editor = new TextEditor({
			content: 'ab',
			onChange: (value) => changes.push([value.content, value.caret]),
		});
		editor.moveBack();
		editor.insert('😀x\r\n');
		editor.deleteBackward();
		editor.moveBack();
		editor.deleteForward();
		expect(changes).toEqual([
			['a😀xb', 3],
			['a😀b', 2],
			['ab', 1],
		]);
	});

	test('notifies only for content changes, including direct replacement', () => {
		const onChange = vi.fn();
		const editor = new TextEditor({ onChange });
		editor.insert('');
		editor.insert('\r\n');
		editor.deleteBackward();
		editor.deleteForward();
		editor.moveBack();
		editor.moveForward();
		editor.moveMin();
		editor.moveMax();
		editor.content = '';
		expect(onChange).not.toHaveBeenCalled();
		editor.content = 'abc';
		editor.caret = 2;
		editor.content = 'abc\r\n';
		expect(onChange).toHaveBeenCalledTimes(1);
	});

	test('normalizes multiline line endings and uses line-relative Home and End', () => {
		const editor = new TextEditor({ multiline: true, content: '😀a\r\nbc\rd\n' });
		expect(editor.content).toBe('😀a\nbc\nd\n');
		editor.caret = 4;
		editor.moveMin();
		expect(editor.caret).toBe(3);
		editor.moveMax();
		expect(editor.caret).toBe(5);
		editor.moveMin();
		expect(editor.caret).toBe(3);
		editor.caret = 1;
		editor.moveMin();
		expect(editor.caret).toBe(0);
		editor.moveMax();
		expect(editor.caret).toBe(2);
		editor.caret = 8;
		editor.moveMin();
		expect(editor.caret).toBe(8);
		editor.moveMax();
		expect(editor.caret).toBe(8);
	});

	test('Enter inserts one newline in multiline mode, but delegates in single-line mode', () => {
		const editor = new TextEditor({ multiline: true, content: 'ab' });
		editor.caret = 1;
		expect(editor.handleKey(key('Enter', '\r\n'))).toBe(true);
		expect(editor.content).toBe('a\nb');
		expect(editor.caret).toBe(2);
		expect(new TextEditor().handleKey(key('Enter', '\n'))).toBe(false);
	});

	test.each(['keydown', 'keyrepeat'] as const)('handles %s editing and navigation', (type) => {
		const editor = new TextEditor();
		const event = (code: KeyDown['code'], text?: string): KeyDown | KeyRepeat => ({
			...key(code, text),
			type,
		});
		expect(editor.handleKey(event('x', 'a😀b'))).toBe(true);
		expect(editor.handleKey(event('ArrowLeft'))).toBe(true);
		expect(editor.handleKey(event('Backspace'))).toBe(true);
		expect(editor.content).toBe('ab');
		expect(editor.caret).toBe(1);
		expect(editor.handleKey(event('Delete'))).toBe(true);
		expect(editor.content).toBe('a');
		expect(editor.handleKey(event('Home'))).toBe(true);
		expect(editor.caret).toBe(0);
		expect(editor.handleKey(event('ArrowRight'))).toBe(true);
		expect(editor.caret).toBe(1);
		expect(editor.handleKey(event('End'))).toBe(true);
		expect(editor.handleKey(event('Escape'))).toBe(false);
	});
});

function key(code: KeyDown['code'], text?: string): KeyDown {
	return { type: 'keydown', key: text ?? code, code, ...(text === undefined ? {} : { text }) };
}
