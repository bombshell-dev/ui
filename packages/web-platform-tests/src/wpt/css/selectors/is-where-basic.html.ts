import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function prepare({ document, connect }: DOMFixture, markup: string): Document {
		const root = document.createElement('div');
		root.innerHTML = markup;
		connect(root);
		return document;
	}

	const { expect } = context.runner;

	// 4.3.7 from https://drafts.csswg.org/css-syntax/#consume-escaped-code-point

	// - escape hex digit

	// - hex digit special replacement
	// 1. zero points

	// 2. surrogate points

	// 3. out of range points

	// - escape EOF

	// - escape anythong else

	// non edge cases

	// ident tests case from CSS tests of chromium source: https://goo.gl/3Cxdov

	context.test('WPT is-where-basic.html: :is() matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const actual = Array.from(main.querySelectorAll(':is()'));
		const expected: Element[] = [];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(#a) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const actual = Array.from(main.querySelectorAll(':is(#a)'));
		const expected: Element[] = [a];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(#a, #f) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(#a, #f)'));
		const expected: Element[] = [a, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT is-where-basic.html: :is(#a, #c) :where(#a #d, #c #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const d = document.getElementById('d')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll(':is(#a, #c) :where(#a #d, #c #f)'));
			const expected: Element[] = [d, f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: #c > :is(#c > #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll('#c > :is(#c > #f)'));
			const expected: Element[] = [f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: #c > :is(#b > #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const actual = Array.from(main.querySelectorAll('#c > :is(#b > #f)'));
			const expected: Element[] = [];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT is-where-basic.html: #a div:is(#d) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const d = document.getElementById('d')!;
		const actual = Array.from(main.querySelectorAll('#a div:is(#d)'));
		const expected: Element[] = [d];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(div) > div matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const d = document.getElementById('d')!;
		const e = document.getElementById('e')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(div) > div'));
		const expected: Element[] = [d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(*) > div matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const d = document.getElementById('d')!;
		const b = document.getElementById('b')!;
		const e = document.getElementById('e')!;
		const c = document.getElementById('c')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(*) > div'));
		const expected: Element[] = [a, b, c, d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test('WPT is-where-basic.html: :is(*) div matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const d = document.getElementById('d')!;
		const b = document.getElementById('b')!;
		const e = document.getElementById('e')!;
		const c = document.getElementById('c')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':is(*) div'));
		const expected: Element[] = [a, b, c, d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT is-where-basic.html: div > :where(#e, #f) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const e = document.getElementById('e')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll('div > :where(#e, #f)'));
			const expected: Element[] = [e, f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test('WPT is-where-basic.html: div > :where(*) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const d = document.getElementById('d')!;
		const e = document.getElementById('e')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll('div > :where(*)'));
		const expected: Element[] = [d, e, f];
		expect(
			actual
				.map((element) => element.id)
				.toSorted()
				.join(),
		).toBe(
			expected
				.map((element) => element.id)
				.toSorted()
				.join(),
		);
	});

	context.test(
		'WPT is-where-basic.html: :is(*) > :where(*) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const d = document.getElementById('d')!;
			const b = document.getElementById('b')!;
			const e = document.getElementById('e')!;
			const c = document.getElementById('c')!;
			const f = document.getElementById('f')!;
			const actual = Array.from(main.querySelectorAll(':is(*) > :where(*)'));
			const expected: Element[] = [a, b, c, d, e, f];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: :is(#a + #b) + :is(#c) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const c = document.getElementById('c')!;
			const actual = Array.from(main.querySelectorAll(':is(#a + #b) + :is(#c)'));
			const expected: Element[] = [c];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);

	context.test(
		'WPT is-where-basic.html: :is(#a, #b) + div matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a><div id=d></div></div>\n  <div id=b><div id=e></div></div>\n  <div id=c><div id=f></div></div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const b = document.getElementById('b')!;
			const c = document.getElementById('c')!;
			const actual = Array.from(main.querySelectorAll(':is(#a, #b) + div'));
			const expected: Element[] = [b, c];
			expect(
				actual
					.map((element) => element.id)
					.toSorted()
					.join(),
			).toBe(
				expected
					.map((element) => element.id)
					.toSorted()
					.join(),
			);
		},
	);
}
