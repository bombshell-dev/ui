import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<meta charset=utf-8>
<title>text field selection: setRangeText</title>




<style>
  #display_none {display:none;}
</style>
<div id="log"></div>
<input type=text id=text value="foobar">
<input type=search id=search value="foobar">
<input type=tel id=tel value="foobar">
<input type=url id=url value="foobar">
<input type=password id=password value="foobar">
<input id=display_none value="foobar">
<textarea id=textarea>foobar</textarea>

`;
		for (const id of [
			'text',
			'search',
			'tel',
			'url',
			'password',
			'display_none',
			'input_not_in_doc',
		]) {
			const element = { id };
			context.test(
				element.id +
					' setRangeText with only one argument replaces the value between selectionStart and selectionEnd, otherwise replaces the value between 2nd and 3rd arguments',
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 3;
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(3);
					element.setRangeText('foobar2');
					expect(element.value).toBe('foobar2bar');
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(7);
					element.setRangeText('foobar3', 7, 10);
					expect(element.value).toBe('foobar2foobar3');
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + ' selectionMode missing',
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 0;

					element.setRangeText('foobar2', 0, 3); // no 4th arg, default "preserve"
					expect(element.value).toBe('foobar2bar');
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(0);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'select'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.setRangeText('foo', 3, 6, 'select');
					expect(element.value).toBe('foofoo');
					expect(element.selectionStart).toBe(3);
					expect(element.selectionEnd).toBe(6);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'start'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.setRangeText('foo', 3, 6, 'start');
					expect(element.value).toBe('foofoo');
					expect(element.selectionStart).toBe(3);
					expect(element.selectionEnd).toBe(3);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'end'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.setRangeText('foobar', 3, 6, 'end');
					expect(element.value).toBe('foofoobar');
					expect(element.selectionStart).toBe(9);
					expect(element.selectionEnd).toBe(9);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'preserve'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 5;
					expect(element.selectionStart).toBe(0);
					element.setRangeText('', 3, 6, 'preserve');
					expect(element.value).toBe('foo');
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(3);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id +
					' setRangeText with 3rd argument greater than 2nd argument throws an IndexSizeError exception',
				({ document, DOMException }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);
					// The preceding upstream case leaves this value and selection.
					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 5;
					element.setRangeText('', 3, 6, 'preserve');

					expect(function () {
						element.setRangeText('barfoo', 2, 1);
					}).toThrow(
						expect.objectContaining({
							name: 'IndexSizeError',
							code: 1,
							constructor: DOMException,
						}),
					);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + ' setRangeText without argument throws a type error',
				(fixture) => {
					const { document } = fixture;
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);
					const TypeError = fixture.TypeError;
					// The preceding upstream case leaves this value and selection.
					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 5;
					element.setRangeText('', 3, 6, 'preserve');

					expect(function () {
						(element.setRangeText as unknown as () => void)();
					}).toThrow(expect.objectContaining({ constructor: TypeError }));
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<meta charset=utf-8>
<title>text field selection: setRangeText</title>




<style>
  #display_none {display:none;}
</style>
<div id="log"></div>
<input type=text id=text value="foobar">
<input type=search id=search value="foobar">
<input type=tel id=tel value="foobar">
<input type=url id=url value="foobar">
<input type=password id=password value="foobar">
<input id=display_none value="foobar">
<textarea id=textarea>foobar</textarea>

`;
		for (const id of ['textarea']) {
			const element = { id };
			context.test(
				element.id +
					' setRangeText with only one argument replaces the value between selectionStart and selectionEnd, otherwise replaces the value between 2nd and 3rd arguments',
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 3;
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(3);
					element.setRangeText('foobar2');
					expect(element.value).toBe('foobar2bar');
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(7);
					element.setRangeText('foobar3', 7, 10);
					expect(element.value).toBe('foobar2foobar3');
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + ' selectionMode missing',
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 0;

					element.setRangeText('foobar2', 0, 3); // no 4th arg, default "preserve"
					expect(element.value).toBe('foobar2bar');
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(0);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'select'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.setRangeText('foo', 3, 6, 'select');
					expect(element.value).toBe('foofoo');
					expect(element.selectionStart).toBe(3);
					expect(element.selectionEnd).toBe(6);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'start'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.setRangeText('foo', 3, 6, 'start');
					expect(element.value).toBe('foofoo');
					expect(element.selectionStart).toBe(3);
					expect(element.selectionEnd).toBe(3);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'end'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.setRangeText('foobar', 3, 6, 'end');
					expect(element.value).toBe('foofoobar');
					expect(element.selectionStart).toBe(9);
					expect(element.selectionEnd).toBe(9);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + " selectionMode 'preserve'",
				({ document }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);

					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 5;
					expect(element.selectionStart).toBe(0);
					element.setRangeText('', 3, 6, 'preserve');
					expect(element.value).toBe('foo');
					expect(element.selectionStart).toBe(0);
					expect(element.selectionEnd).toBe(3);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id +
					' setRangeText with 3rd argument greater than 2nd argument throws an IndexSizeError exception',
				({ document, DOMException }) => {
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);
					// The preceding upstream case leaves this value and selection.
					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 5;
					element.setRangeText('', 3, 6, 'preserve');

					expect(function () {
						element.setRangeText('barfoo', 2, 1);
					}).toThrow(
						expect.objectContaining({
							name: 'IndexSizeError',
							code: 1,
							constructor: DOMException,
						}),
					);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				element.id + ' setRangeText without argument throws a type error',
				(fixture) => {
					const { document } = fixture;
					const input = document.createElement('input');
					input.id = 'input_not_in_doc';
					input.value = 'foobar';
					const element =
						id === 'input_not_in_doc'
							? input
							: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);
					const TypeError = fixture.TypeError;
					// The preceding upstream case leaves this value and selection.
					element.value = 'foobar';
					element.selectionStart = 0;
					element.selectionEnd = 5;
					element.setRangeText('', 3, 6, 'preserve');

					expect(function () {
						(element.setRangeText as unknown as () => void)();
					}).toThrow(expect.objectContaining({ constructor: TypeError }));
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
	{
		const { expect } = context.runner;
		const content = `<!DOCTYPE html>
<meta charset=utf-8>
<title>text field selection: setRangeText</title>




<style>
  #display_none {display:none;}
</style>
<div id="log"></div>
<input type=text id=text value="foobar">
<input type=search id=search value="foobar">
<input type=tel id=tel value="foobar">
<input type=url id=url value="foobar">
<input type=password id=password value="foobar">
<input id=display_none value="foobar">
<textarea id=textarea>foobar</textarea>

`;
		function elementFor(document: Document, id: string) {
			const input = document.createElement('input');
			input.id = 'input_not_in_doc';
			input.value = 'foobar';
			return id === 'input_not_in_doc'
				? input
				: (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement);
		}
		function untilEvent(element: EventTarget, eventName: string) {
			return new Promise<Event>((resolve) => {
				element.addEventListener(eventName, resolve, { once: true });
			});
		}
		for (const id of [
			'text',
			'search',
			'tel',
			'url',
			'password',
			'display_none',
			'textarea',
			'input_not_in_doc',
		]) {
			context.test(
				id + ' setRangeText fires a select event',
				async ({ document, step, cleanup }) => {
					const element = elementFor(document, id);
					// Replay the selection left by upstream's preceding synchronous cases.
					element.value = 'foo';
					element.selectionStart = 0;
					element.selectionEnd = 3;
					await new Promise<void>((resolve) => {
						const timer = setTimeout(
							step(() => {
								let q = false;
								element.onselect = (event) => {
									step(() => {
										expect(q, 'event should be queued').toBe(true);
										expect(event.isTrusted, 'event is trusted').toBe(true);
										expect(event.bubbles, 'event bubbles').toBe(true);
										expect(event.cancelable, 'event is not cancelable').toBe(false);
									})();
									resolve();
								};
								element.setRangeText('foobar2', 0, 6);
								q = true;
							}),
							10,
						);
						cleanup(() => {
							clearTimeout(timer);
							element.onselect = null;
						});
					});
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				id + ' setRangeText fires a select event when fully selected',
				async ({ document }) => {
					const element = elementFor(document, id);
					element.value = 'XXXXXXXXXXXXXXXXXXX';
					const { length } = element.value;
					element.setSelectionRange(0, length);
					await untilEvent(element, 'select');
					element.setRangeText('foo', 2, 2);
					await untilEvent(element, 'select');
					expect(element.selectionStart, '.selectionStart').toBe(0);
					expect(element.selectionEnd, '.selectionEnd').toBe(length + 3);
				},
				{ document: { contentType: 'text/html', content } },
			);
			context.test(
				id + ' setRangeText fires a select event after select()',
				async ({ document }) => {
					const element = elementFor(document, id);
					element.value = 'XXXXXXXXXXXXXXXXXXX';
					element.select();
					await untilEvent(element, 'select');
					element.setRangeText('foo', 2, 2);
					await untilEvent(element, 'select');
					expect(element.selectionStart, '.selectionStart').toBe(0);
					expect(element.selectionEnd, '.selectionEnd').toBe(element.value.length);
				},
				{ document: { contentType: 'text/html', content } },
			);
		}
	}
}
