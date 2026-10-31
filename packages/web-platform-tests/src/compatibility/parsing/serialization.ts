import type { CompatibilityContext } from '../context.ts';

export const spec =
	'https://html.spec.whatwg.org/multipage/parsing.html#serialising-html-fragments';
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('escapes markup characters and serializes void elements', ({ document }) => {
		const container = document.createElement('div');
		const span = document.createElement('span');
		span.setAttribute('title', 'a"&b');
		span.textContent = '<&>';
		container.append(span, document.createElement('br'));
		expect(container.innerHTML).toBe('<span title="a&quot;&amp;b">&lt;&amp;&gt;</span><br>');
	});

	context.test(
		'escapes text and quoted attribute values without serializing comments as text',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div');
			e.setAttribute('title', 'a"&');
			e.append(document.createTextNode('<>&'), document.createComment('note'));
			expect(e.innerHTML).toBe('&lt;&gt;&amp;<!--note-->');
			expect(e.outerHTML).toContain('title="a&quot;&amp;"');
		},
	);

	context.test(
		'serializes void elements without end tags and preserves raw script text',
		(fixture) => {
			const document = fixture.document as unknown as Document;
			const e = document.createElement('div');
			e.innerHTML = '<br><input disabled><script>a < b && c</script>';
			expect(e.innerHTML).toBe('<br><input disabled=""><script>a < b && c</script>');
		},
	);
}
