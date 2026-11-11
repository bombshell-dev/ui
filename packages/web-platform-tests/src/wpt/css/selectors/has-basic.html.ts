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

	context.test('WPT has-basic.html: :has(#a) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const actual = Array.from(main.querySelectorAll(':has(#a)'));
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

	context.test('WPT has-basic.html: :has(.ancestor) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const actual = Array.from(main.querySelectorAll(':has(.ancestor)'));
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

	context.test('WPT has-basic.html: :has(.target) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const actual = Array.from(main.querySelectorAll(':has(.target)'));
		const expected: Element[] = [a, b, f, h];
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

	context.test('WPT has-basic.html: :has(.descendant) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const b = document.getElementById('b')!;
		const c = document.getElementById('c')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const j = document.getElementById('j')!;
		const actual = Array.from(main.querySelectorAll(':has(.descendant)'));
		const expected: Element[] = [a, b, c, f, h, j];
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

	context.test('WPT has-basic.html: .parent:has(.target) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const actual = Array.from(main.querySelectorAll('.parent:has(.target)'));
		const expected: Element[] = [b, f, h];
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
		'WPT has-basic.html: :has(.sibling ~ .target) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const b = document.getElementById('b')!;
			const actual = Array.from(main.querySelectorAll(':has(.sibling ~ .target)'));
			const expected: Element[] = [a, b];
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
		'WPT has-basic.html: .parent:has(.sibling ~ .target) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const b = document.getElementById('b')!;
			const actual = Array.from(main.querySelectorAll('.parent:has(.sibling ~ .target)'));
			const expected: Element[] = [b];
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
		'WPT has-basic.html: :has(:is(.target ~ .sibling .descendant)) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const h = document.getElementById('h')!;
			const j = document.getElementById('j')!;
			const actual = Array.from(main.querySelectorAll(':has(:is(.target ~ .sibling .descendant))'));
			const expected: Element[] = [a, h, j];
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
		'WPT has-basic.html: .parent:has(:is(.target ~ .sibling .descendant)) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const h = document.getElementById('h')!;
			const actual = Array.from(
				main.querySelectorAll('.parent:has(:is(.target ~ .sibling .descendant))'),
			);
			const expected: Element[] = [h];
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
		'WPT has-basic.html: .sibling:has(.descendant) ~ .target matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const e = document.getElementById('e')!;
			const actual = Array.from(main.querySelectorAll('.sibling:has(.descendant) ~ .target'));
			const expected: Element[] = [e];
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

	context.test('WPT has-basic.html: :has(> .parent) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const a = document.getElementById('a')!;
		const actual = Array.from(main.querySelectorAll(':has(> .parent)'));
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

	context.test('WPT has-basic.html: :has(> .target) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const h = document.getElementById('h')!;
		const actual = Array.from(main.querySelectorAll(':has(> .target)'));
		const expected: Element[] = [b, f, h];
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
		'WPT has-basic.html: :has(> .parent, > .target) matches expected elements',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const a = document.getElementById('a')!;
			const b = document.getElementById('b')!;
			const f = document.getElementById('f')!;
			const h = document.getElementById('h')!;
			const actual = Array.from(main.querySelectorAll(':has(> .parent, > .target)'));
			const expected: Element[] = [a, b, f, h];
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

	context.test('WPT has-basic.html: :has(+ #h) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll(':has(+ #h)'));
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
	});

	context.test('WPT has-basic.html: .parent:has(~ #h) matches expected elements', (fixture) => {
		const document = prepare(
			fixture,
			'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
		);
		const main = document.getElementById('main')!;
		const b = document.getElementById('b')!;
		const f = document.getElementById('f')!;
		const actual = Array.from(main.querySelectorAll('.parent:has(~ #h)'));
		const expected: Element[] = [b, f];
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
		'WPT has-basic.html: .sibling:has(.descendant) matches expected element',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const main = document.getElementById('main')!;
			const c = document.getElementById('c')!;
			expect(main.querySelector('.sibling:has(.descendant)')).toBe(c);
		},
	);

	context.test(
		'WPT has-basic.html: closest(.ancestor:has(.descendant)) returns expected element',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const h = document.getElementById('h')!;
			const k = document.getElementById('k')!;
			expect(k.closest('.ancestor:has(.descendant)')).toBe(h);
		},
	);

	context.test(
		'WPT has-basic.html: :has(.target ~ .sibling .descendant) matches expectedly',
		(fixture) => {
			const document = prepare(
				fixture,
				'<main id=main>\n  <div id=a class="ancestor">\n    <div id=b class="parent ancestor">\n      <div id=c class="sibling descendant">\n        <div id=d class="descendant"></div>\n      </div>\n      <div id=e class="target descendant"></div>\n    </div>\n    <div id=f class="parent ancestor">\n      <div id=g class="target descendant"></div>\n    </div>\n    <div id=h class="parent ancestor">\n      <div id=i class="target descendant"></div>\n      <div id=j class="sibling descendant">\n        <div id=k class="descendant"></div>\n      </div>\n    </div>\n  </div>\n</main>',
			);
			const h = document.getElementById('h')!;
			expect(h.matches(':has(.target ~ .sibling .descendant)')).toBe(true);
		},
	);
}
