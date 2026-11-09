import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	{
		const content = `<!DOCTYPE html>
<title>Input Email</title>





<input type="email" id="single_email" value="user@example.com"/>
<input type="email" id="multiple_email" value="user1@example.com, user2@test.com" multiple/>
<div id="log"></div>


`;

		context.test(
			'value should be sanitized: strip line breaks',
			({ document }) => {
				const single = document.getElementById('single_email') as HTMLInputElement;
				const mult = document.getElementById('multiple_email') as HTMLInputElement;

				single.value = 'user2@example.com\u000A';
				expect(single.value).toBe('user2@example.com');
				single.value = 'user3@example.com\u000D';
				expect(single.value).toBe('user3@example.com');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'When the multiple attribute is removed, the user agent must run the value sanitization algorithm',
			({ document }) => {
				const single = document.getElementById('single_email') as HTMLInputElement;
				const mult = document.getElementById('multiple_email') as HTMLInputElement;

				single.setAttribute('multiple', true as unknown as string);
				single.value = '  user@example.com  , user2@example.com  ';
				expect(single.value).toBe('user@example.com,user2@example.com');
				single.removeAttribute('multiple');
				expect(single.value).toBe('user@example.com,user2@example.com');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'run the value sanitization algorithm after setting a new value',
			({ document }) => {
				const single = document.getElementById('single_email') as HTMLInputElement;
				const mult = document.getElementById('multiple_email') as HTMLInputElement;

				mult.value = '  user1@example.com  , user2@test.com, user3@test.com  ';
				expect(mult.value).toBe('user1@example.com,user2@test.com,user3@test.com');
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'When the multiple attribute is set, the user agent must run the value sanitization algorithm',
			({ document }) => {
				const single = document.getElementById('single_email') as HTMLInputElement;
				const mult = document.getElementById('multiple_email') as HTMLInputElement;

				mult.removeAttribute('multiple');
				mult.value = 'user1@example.com , user2@example.com';
				expect(mult.value).toBe('user1@example.com , user2@example.com');
				mult.setAttribute('multiple', true as unknown as string);
				expect(mult.value).toBe('user1@example.com,user2@example.com');
			},
			{ document: { contentType: 'text/html', content } },
		);

		context.test(
			"single_email doesn't have the multiple attribute",
			({ document }) => {
				const single = document.getElementById('single_email') as HTMLInputElement;
				expect(single.multiple).toBe(false);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'Email address validity',
			({ document }) => {
				const single = document.getElementById('single_email') as HTMLInputElement;
				single.value = 'user4@example.com';
				expect(single.validity.valid).toBe(true);
				single.value = 'example.com';
				expect(single.validity.valid).toBe(false);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			'multiple_email has the multiple attribute',
			({ document }) => {
				const mult = document.getElementById('multiple_email') as HTMLInputElement;
				expect(mult.multiple).toBe(true);
			},
			{ document: { contentType: 'text/html', content } },
		);
		context.test(
			"valid value is a set of valid email addresses separated by a single ','",
			({ document }) => {
				const mult = document.getElementById('multiple_email') as HTMLInputElement;
				mult.value = 'user1@example.com,user2@test.com,user3@test.com';
				expect(mult.validity.valid).toBe(true);
				mult.value = 'u,ser1@example.com,user2@test.com,user3@test.com';
				expect(mult.validity.valid).toBe(false);
			},
			{ document: { contentType: 'text/html', content } },
		);
	}
}
