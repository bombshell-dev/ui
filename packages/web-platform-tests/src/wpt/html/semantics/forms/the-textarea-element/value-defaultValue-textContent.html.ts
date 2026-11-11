import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('defaultValue and value are the empty string by default', ({ document }) => {
		const textarea = document.createElement('textarea');

		expect(textarea.defaultValue, 'defaultValue is empty string when it has no content').toBe('');
		expect(textarea.value, 'value is empty string when it has no content').toBe('');
	});
	context.test('defaultValue and value are affected by setting textContent', ({ document }) => {
		const textarea = document.createElement('textarea');

		textarea.textContent = 'foo bar';
		expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
			'foo bar',
		);
		expect(
			textarea.value,
			'changing the textContent should change the raw value, and subsequently the api value',
		).toBe('foo bar');
	});
	context.test(
		'defaultValue and value are affected by setting nodeValue on a child text node',
		({ document }) => {
			const textarea = document.createElement('textarea');

			textarea.textContent = 'some text';
			textarea.firstChild!.nodeValue = 'foo bar';
			expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
				'foo bar',
			);
			expect(
				textarea.value,
				'changing the textContent should change the raw value, and subsequently the api value',
			).toBe('foo bar');
		},
	);
	context.test(
		'defaultValue and value are affected by setting data on a child text node',
		({ document }) => {
			const textarea = document.createElement('textarea');

			textarea.textContent = 'some text';
			(textarea.firstChild as Text).data = 'foo bar';
			expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
				'foo bar',
			);
			expect(
				textarea.value,
				'changing the textContent should change the raw value, and subsequently the api value',
			).toBe('foo bar');
		},
	);
	context.test(
		'defaultValue and value are affected by textContent in combination with appending a text node',
		({ document }) => {
			const textarea = document.createElement('textarea');

			textarea.textContent = 'foo bar';
			textarea.appendChild(document.createTextNode(' baz'));
			expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
				'foo bar baz',
			);
			expect(
				textarea.value,
				'changing the textContent should change the raw value, and subsequently the api value',
			).toBe('foo bar baz');
		},
	);
	context.test(
		'defaultValue and value are affected by textContent in combination with appending a DocumentFragment',
		({ document }) => {
			const textarea = document.createElement('textarea');
			textarea.textContent = 'foo bar';

			const frag = document.createDocumentFragment();
			frag.appendChild(document.createTextNode(' baz'));
			const el = document.createElement('span');
			el.appendChild(document.createTextNode('qux?'));
			frag.appendChild(el);
			frag.appendChild(document.createTextNode(' fizz'));
			textarea.appendChild(frag);

			textarea.appendChild(document.createTextNode(' whee'));
			expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
				'foo bar baz fizz whee',
			);
			expect(
				textarea.value,
				'changing the textContent should change the raw value, and subsequently the api value',
			).toBe('foo bar baz fizz whee');
		},
	);
	context.test(
		'defaultValue and value reflect child text content, not textContent',
		({ document }) => {
			const textarea = document.createElement('textarea');
			textarea.appendChild(document.createTextNode('foo bar'));

			const child = document.createElement('span');
			child.textContent = 'baz';
			textarea.appendChild(child);

			expect(textarea.textContent, 'the textContent should have *all* the text content').toBe(
				'foo barbaz',
			);
			expect(textarea.defaultValue, 'the defaultValue should reflect the child text content').toBe(
				'foo bar',
			);
			expect(
				textarea.value,
				'changing the child text content should change the raw value, and subsequently the api value',
			).toBe('foo bar');
		},
	);
	context.test(
		'Setting defaultValue wipes out any children, including elements (just like setting textContent)',
		({ document }) => {
			const textarea = document.createElement('textarea');
			textarea.appendChild(document.createTextNode('foo bar'));

			const child = document.createElement('span');
			child.textContent = 'baz';
			textarea.appendChild(child);

			textarea.defaultValue = 'foo';

			expect(textarea.childNodes.length, 'Only one child node should exist').toBe(1);
			expect(textarea.defaultValue, 'the defaultValue should be the new text').toBe('foo');
			expect(textarea.value, 'the api value should be the new text').toBe('foo');
			expect(textarea.textContent, 'the textContent should be the new text').toBe('foo');
		},
	);
	context.test('defaultValue and value treat CRLF differently', ({ document }) => {
		const textarea = document.createElement('textarea');

		textarea.textContent = 'foo\r\nbar\rbaz\nqux';
		expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
			'foo\r\nbar\rbaz\nqux',
		);
		expect(textarea.value, 'The value property should normalize CRLF and CR to LF').toBe(
			'foo\nbar\nbaz\nqux',
		);
	});
	context.test('value normalizes CRLF even spread over multiple text nodes', ({ document }) => {
		const textarea = document.createElement('textarea');

		textarea.appendChild(document.createTextNode('foo\r'));
		textarea.appendChild(document.createTextNode('\nbar\rbaz\nqux'));
		expect(textarea.defaultValue, 'the defaultValue should reflect the textContent').toBe(
			'foo\r\nbar\rbaz\nqux',
		);
		expect(textarea.value, 'The value property should normalize CRLF and CR to LF').toBe(
			'foo\nbar\nbaz\nqux',
		);
	});
	context.test('tests for the value setter', ({ document }) => {
		const textarea = document.createElement('textarea');

		textarea.textContent = 'foo';
		textarea.value = 'baz';
		expect(
			textarea.defaultValue,
			'setting the value property should not affect the defaultValue',
		).toBe('foo');
		expect(
			textarea.textContent,
			'setting the value property should not affect the textContent',
		).toBe('foo');
		expect(
			textarea.value,
			"on setting, the value property must set the element's raw & api value to the new value",
		).toBe('baz');

		textarea.value = 'foo\r\nbar\rbaz\nqux';
		expect(textarea.value, 'The API value should normalize CRLF and CR to LF').toBe(
			'foo\nbar\nbaz\nqux',
		);

		(textarea as unknown as { value: string | null }).value = null;
		expect(
			textarea.value,
			'setting the value property to null should result in an empty string',
		).toBe('');
	});
	context.test('tests for U+0000 NULL', ({ document }) => {
		const textarea = document.createElement('textarea');

		textarea.defaultValue = 'foo\0';
		expect(textarea.defaultValue, 'defaultValue after setting defaultValue').toBe('foo\0');
		expect(textarea.textContent, 'textContent after setting defaultValue').toBe('foo\0');
		expect(textarea.value, 'value after setting defaultValue').toBe('foo\0');

		textarea.textContent = 'bar\0';
		expect(textarea.defaultValue, 'defaultValue after setting textContent').toBe('bar\0');
		expect(textarea.textContent, 'textContent after setting textContent').toBe('bar\0');
		expect(textarea.value, 'value after setting textContent').toBe('bar\0');

		textarea.value = 'baz\0';
		expect(textarea.defaultValue, 'defaultValue after setting value').toBe('bar\0');
		expect(textarea.textContent, 'textContent after setting value').toBe('bar\0');
		expect(textarea.value, 'value after setting value').toBe('baz\0');
	});
}
