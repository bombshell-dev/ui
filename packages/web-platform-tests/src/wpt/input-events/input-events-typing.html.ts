import type { CompatibilityContext } from '../../shared/context.ts';

export const input = ['keyboard', 'mouse'] as const;

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		context.test(
			'It triggers beforeinput and input events on text typing',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.focus();
				const message = 'Hello';
				rich.focus();
				for (const character of message) await input.press(character);
				// 10 events (5 beforeinput + 5 input events)
				expect(inputEventsLog.length).toBe(10);
				for (let i = 0; i < inputEventsLog.length; i += 2) {
					const beforeInputEvent = inputEventsLog[i]!;
					const inputEvent = inputEventsLog[i + 1]!;
					expect(beforeInputEvent.type).toBe('beforeinput');
					expect(inputEvent.type).toBe('input');
					expect(beforeInputEvent.inputType).toBe('insertText');
					expect(inputEvent.inputType).toBe('insertText');
					expect(beforeInputEvent.data).toBe(inputEvent.data);
					expect(inputEvent.data).toBe(message[i / 2]);
					expect(beforeInputEvent.state + message[i / 2]).toBe(inputEvent.state);
				}
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'It triggers beforeinput and input events on typing DELETE with pre-existing content',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.innerHTML = '<p>Preexisting <i id="caret">c</i>ontent</p>';
				const caret = document.querySelector<HTMLElement>('#caret')!;
				await input.click(caret);
				(caret as HTMLElement).focus();
				await input.press('Delete'); // Delete

				expect(inputEventsLog.length).toBe(2);
				const beforeInputEvent = inputEventsLog[0]!;
				const inputEvent = inputEventsLog[1]!;
				expect(beforeInputEvent.type).toBe('beforeinput');
				expect(inputEvent.type).toBe('input');
				expect(beforeInputEvent.inputType).toBe('deleteContentForward');
				expect(inputEvent.inputType).toBe('deleteContentForward');
				expect(beforeInputEvent.data).toBe(inputEvent.data);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'It triggers beforeinput and input events on typing DELETE with no pre-existing content',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.focus();
				(rich as HTMLElement).focus();
				await input.press('Delete'); // Delete
				expect(inputEventsLog.length).toBe(2);
				const beforeInputEvent = inputEventsLog[0]!;
				const inputEvent = inputEventsLog[1]!;
				expect(beforeInputEvent.type).toBe('beforeinput');
				expect(inputEvent.type).toBe('input');
				expect(beforeInputEvent.inputType).toBe('deleteContentForward');
				expect(inputEvent.inputType).toBe('deleteContentForward');
				expect(beforeInputEvent.data).toBe(inputEvent.data);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'It triggers beforeinput and input events on typing BACK_SPACE with pre-existing content',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.innerHTML = '<p>Preexisting <i id="caret">c</i>ontent</p>';

				await input.click(document.querySelector<HTMLElement>('#caret')!);
				(rich as HTMLElement).focus();
				await input.press('Backspace'); // Back Space

				expect(inputEventsLog.length).toBe(2);
				const beforeInputEvent = inputEventsLog[0]!;
				const inputEvent = inputEventsLog[1]!;
				expect(beforeInputEvent.type).toBe('beforeinput');
				expect(inputEvent.type).toBe('input');
				expect(beforeInputEvent.inputType).toBe('deleteContentBackward');
				expect(inputEvent.inputType).toBe('deleteContentBackward');
				expect(beforeInputEvent.data).toBe(inputEvent.data);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'Input events have correct inputType updated when different inputs are typed',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.innerHTML = '<p>Preexisting <i id="caret">C</i>ontent</p>';

				const expectedResult = [
					// Pressing 'a', 'b'
					'insertText',
					'insertText',
					// Delete twice
					'deleteContentForward',
					'deleteContentForward',
					// Pressing 'c', 'd'
					'insertText',
					'insertText',
					// Backspace
					'deleteContentBackward',
				];
				const result: string[] = [];

				rich.addEventListener('input', (inputEvent) => {
					result.push((inputEvent as InputEvent).inputType);
				});

				await input.click(document.querySelector<HTMLElement>('#caret')!); // Preexisting |Content
				(rich as HTMLElement).focus();
				await input.press('a'); // Preexisting a|Content
				(rich as HTMLElement).focus();
				await input.press('b'); // Preexisting ab|Content
				// Delete
				(rich as HTMLElement).focus();
				await input.press('Delete'); // Preexisting ab|ontent
				// Delete
				(rich as HTMLElement).focus();
				await input.press('Delete'); // Preexisting ab|ntent
				(rich as HTMLElement).focus();
				await input.press('c'); // Preexisting abc|ntent
				(rich as HTMLElement).focus();
				await input.press('d'); // Preexisting abcd|ntent
				// Backspace
				(rich as HTMLElement).focus();
				await input.press('Backspace'); // Preexisting abc|ntent

				expect(result.length).toBe(expectedResult.length);
				expectedResult.forEach((er, index) => expect(result[index]).toBe(er));
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'It triggers beforeinput and input events on typing BACK_SPACE with no pre-existing content',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.focus();
				(rich as HTMLElement).focus();
				await input.press('Backspace'); // Back Space

				expect(inputEventsLog.length).toBe(2);
				const beforeInputEvent = inputEventsLog[0]!;
				const inputEvent = inputEventsLog[1]!;
				expect(beforeInputEvent.type).toBe('beforeinput');
				expect(inputEvent.type).toBe('input');
				expect(beforeInputEvent.inputType).toBe('deleteContentBackward');
				expect(inputEvent.inputType).toBe('deleteContentBackward');
				expect(beforeInputEvent.data).toBe(inputEvent.data);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test(
			'InputEvents have correct data/order when typing on textarea and contenteditable',
			async (fixture) => {
				const { document } = fixture;
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);
				const InputEvent = fixture.InputEvent;

				fixture.cleanup(resetRich);
				const expectedResult = [
					// Pressing 'a'.
					'plain-keydown-a',
					'plain-keypress-a',
					'plain-beforeinput-a-null',
					'plain-input-a-null',
					'plain-keyup-a',
					// Pressing Shift-'b'.
					'plain-keydown-B',
					'plain-keypress-B',
					'plain-beforeinput-B-null',
					'plain-input-B-null',
					'plain-keyup-B',
					// Pressing 'c'.
					'rich-keydown-c',
					'rich-keypress-c',
					'rich-beforeinput-c-null',
					'rich-input-c-null',
					'rich-keyup-c',
					// Pressing Shift-'d'.
					'rich-keydown-D',
					'rich-keypress-D',
					'rich-beforeinput-D-null',
					'rich-input-D-null',
					'rich-keyup-D',
				];
				const result: string[] = [];

				for (const eventType of ['beforeinput', 'input', 'keydown', 'keypress', 'keyup']) {
					const listener = (event: Event) => {
						if ((event as KeyboardEvent).key === 'Shift') return;
						const eventInfo = [
							(event.target as Element).id,
							event.type,
							(event as InputEvent).data || (event as KeyboardEvent).key,
						];
						if (event instanceof InputEvent) eventInfo.push(String(event.dataTransfer));
						result.push(eventInfo.join('-'));
					};
					rich.addEventListener(eventType, listener);
					plain.addEventListener(eventType, listener);
				}

				plain.focus();
				await fixture.input.keyDown('a');
				await fixture.input.keyUp('a');
				await fixture.input.keyDown('Shift');
				await fixture.input.keyDown('b');
				await fixture.input.keyUp('b');
				await fixture.input.keyUp('Shift');

				rich.focus();
				await fixture.input.keyDown('c');
				await fixture.input.keyUp('c');
				await fixture.input.keyDown('Shift');
				await fixture.input.keyDown('d');
				await fixture.input.keyUp('d');
				await fixture.input.keyUp('Shift');

				expect(result.length).toBe(expectedResult.length);
				expectedResult.forEach((er, index) => expect(result[index]).toBe(er));
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
	}
	{
		const { expect } = context.runner;
		context.test(
			'It triggers beforeinput and input events on typing RETURN',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.focus();
				(rich as HTMLElement).focus();
				await input.press('Enter'); // Return

				expect(inputEventsLog.length).toBe(2);
				const beforeInputEvent = inputEventsLog[0]!;
				const inputEvent = inputEventsLog[1]!;
				expect(beforeInputEvent.type).toBe('beforeinput');
				expect(inputEvent.type).toBe('input');
				expect(beforeInputEvent.inputType).toBe('insertParagraph');
				expect(inputEvent.inputType).toBe('insertParagraph');
				expect(beforeInputEvent.data).toBe(inputEvent.data);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'Newline character in plain text editing should get insertLinebreak input event',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetPlain);
				const expectedResult = [
					// Pressing 'a'
					'insertText',
					// Return
					'insertLineBreak',
				];
				const result: string[] = [];

				plain.addEventListener('input', (inputEvent) => {
					result.push((inputEvent as InputEvent).inputType);
				});
				await input.click(plain);
				(plain as HTMLElement).focus();
				await input.press('a');
				(plain as HTMLElement).focus();
				await input.press('Enter'); // Return
				expect(result.length).toBe(expectedResult.length);
				expectedResult.forEach((er, index) => expect(result[index]).toBe(er));
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
		context.test(
			'It triggers beforeinput and input events on typing Shift+RETURN',
			async ({ document, cleanup, input }) => {
				const rich = document.getElementById('rich')! as HTMLElement;
				const plain = document.getElementById('plain')! as HTMLTextAreaElement;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				function resetRich() {
					inputEventsLog = [];
					rich.innerHTML = '';
				}
				function resetPlain() {
					inputEventsLog = [];
					plain.innerHTML = '';
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);

				cleanup(resetRich);
				rich.focus();
				await input.keyDown('Shift');
				await input.keyDown('Enter');
				await input.keyUp('Enter');
				await input.keyUp('Shift');

				expect(inputEventsLog.length).toBe(2);
				const beforeInputEvent = inputEventsLog[0]!;
				const inputEvent = inputEventsLog[1]!;
				expect(beforeInputEvent.type).toBe('beforeinput');
				expect(inputEvent.type).toBe('input');
				expect(beforeInputEvent.inputType).toBe('insertLineBreak');
				expect(inputEvent.inputType).toBe('insertLineBreak');
				expect(beforeInputEvent.data).toBe(inputEvent.data);
			},
			{
				document: {
					contentType: 'text/html',
					content:
						'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
				},
			},
		);
	}
	{
		const { expect } = context.runner;
		const options = {
			document: {
				contentType: 'text/html' as const,
				content:
					'<!DOCTYPE html>\n<meta charset="utf-8">\n<title>Input Event typing tests</title>\n\n\n\n\n\n<div id="rich" contenteditable></div>\n<textarea id="plain"></textarea>\n\n',
			},
		};
		context.test(
			'Input events have correct inputType when selected text is removed with Backspace or Delete',
			async ({ document, input, cleanup, window }) => {
				const rich = document.getElementById('rich')!;
				cleanup(() => {
					rich.innerHTML = '';
				});
				rich.innerHTML = '<p>Preexisting <i id="caret">c</i>ontent</p>';
				const expectedResult = ['deleteContentBackward', 'deleteContentForward'];
				const result: string[] = [];
				rich.addEventListener('input', (event) => {
					result.push((event as InputEvent).inputType);
				});
				const modifierKey = window.navigator.platform === 'MacIntel' ? 'Meta' : 'Control';
				await input.click(document.querySelector('#caret')!);
				await input.keyDown(modifierKey);
				await input.keyDown('Shift');
				await input.keyDown('ArrowLeft');
				await input.keyUp('ArrowLeft');
				await input.keyUp('Shift');
				await input.keyUp(modifierKey);
				rich.focus();
				await input.press('Backspace');
				await input.keyDown(modifierKey);
				await input.keyDown('Shift');
				await input.keyDown('ArrowRight');
				// Upstream releases ArrowLeft here.
				await input.keyUp('ArrowLeft');
				await input.keyUp('Shift');
				await input.keyUp(modifierKey);
				rich.focus();
				await input.press('Delete');
				expect(result.length).toBe(expectedResult.length);
				expectedResult.forEach((er, index) => expect(result[index]).toBe(er));
			},
			options,
		);

		context.test(
			'It triggers beforeinput and input events on typing Undo and Redo key combinations with an existing history',
			async ({ document, input, cleanup, window }) => {
				const rich = document.getElementById('rich')!;
				let inputEventsLog: (InputEvent & { state: string })[] = [];
				function log(event: Event) {
					const Constructor = event.constructor as new (
						type: string,
						init: Event,
					) => InputEvent & { state: string };
					const clone = new Constructor(event.type, event);
					clone.state = rich.innerHTML;
					inputEventsLog.push(clone);
				}
				rich.addEventListener('beforeinput', log);
				rich.addEventListener('input', log);
				cleanup(() => {
					inputEventsLog = [];
					rich.innerHTML = '';
				});
				rich.focus();
				for (const character of 'hello') await input.press(character);
				const modifierKey = window.navigator.platform === 'MacIntel' ? 'Meta' : 'Control';
				await input.keyDown(modifierKey);
				await input.keyDown('z');
				await input.keyUp('z');
				await input.keyUp(modifierKey);
				await input.keyDown(modifierKey);
				await input.keyDown('Shift');
				await input.keyDown('z');
				await input.keyUp('z');
				await input.keyUp('Shift');
				await input.keyUp(modifierKey);
				const historyInputEventsLog = inputEventsLog.slice(10);
				expect(historyInputEventsLog.length).toBe(4);
				const inputTypes = ['historyUndo', 'historyRedo'];
				for (let i = 0; i < historyInputEventsLog.length; i += 2) {
					const beforeInputEvent = historyInputEventsLog[i]!;
					const inputEvent = historyInputEventsLog[i + 1]!;
					expect(beforeInputEvent.type).toBe('beforeinput');
					expect(inputEvent.type).toBe('input');
					expect(beforeInputEvent.inputType).toBe(inputTypes[i / 2]);
					expect(inputEvent.inputType).toBe(inputTypes[i / 2]);
					expect(beforeInputEvent.data).toBe(inputEvent.data);
				}
			},
			options,
		);
	}
}
