import type { CompatibilityContext, DOMFixture } from '../../../shared/context.ts';
import { prepare, permitted, roots, type Root, type Kind } from '../../../shared/selectors.ts';
import { invalidSelectors, validSelectors, scopedSelectors, TEST_MATCH } from './selectors.js.ts';
import { html } from './ParentNode-querySelector-All-content.html.ts';

export function registerMatches(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function test(
		options: { kind: Kind; name: string },
		run: (fixture: DOMFixture, root: Root) => void,
	): void {
		context.test(
			`WPT Element-matches.html: ${options.name}`,
			(fixture) => run(fixture, prepare(fixture, options.kind)),
			{
				document: { contentType: 'text/html', content: html, fragment: 'target' },
			},
		);
	}
	for (const [kind, label] of Object.entries(roots) as [Exclude<Kind, 'empty'>, string][]) {
		const isElement = kind === 'element' || kind === 'detached';
		test(
			{ kind, name: `${label} ${isElement ? 'supports' : 'should not support'} matches` },
			(_fixture, root) => {
				expect('matches' in root).toBe(isElement);
				if (isElement) expect(Object.hasOwn(root, 'matches')).toBe(false);
			},
		);
		if (isElement)
			for (const row of invalidSelectors) {
				test(
					{ kind, name: `${label}.matches: ${row.name}: ${row.selector}` },
					({ DOMException }, root) => {
						try {
							(root as Element).matches(row.selector);
							expect.fail('Expected SyntaxError');
						} catch (error) {
							expect(error).toBeInstanceOf(DOMException);
							expect(error).toMatchObject({ name: 'SyntaxError', code: 12 });
						}
					},
				);
			}
	}
	for (const tag of ['div', 'null', 'undefined']) {
		for (const value of [null, undefined, 'missing'] as const) {
			const suffix = value === 'missing' ? ' no parameter' : `(${String(value)})`;
			test(
				{ kind: 'document', name: `${tag.toUpperCase()} Element.matches${suffix}` },
				({ TypeError }, root) => {
					const element =
						tag === 'div'
							? (root as Document).getElementById('root')!
							: (root as Document).createElement(tag);
					if (value === 'missing')
						expect(() => Reflect.apply(element.matches, element, [])).toThrow(TypeError);
					else expect(Reflect.apply(element.matches, element, [value])).toBe(tag === String(value));
				},
			);
		}
	}
	for (const [kind, label] of [
		['document', 'In-document'],
		['detached', 'Detached'],
		['fragment', 'Fragment'],
	] as const) {
		const rows = kind === 'document' ? [...validSelectors, ...scopedSelectors] : validSelectors;
		for (const row of rows) {
			if (!permitted(row, { kind, xml: false, mask: TEST_MATCH })) continue;
			const reference = row.ctx ? 'refNode Element' : 'no refNodes';
			test(
				{
					kind,
					name: `${label} Element.matches: ${row.name} (with ${reference}): ${row.selector}`,
				},
				(_fixture, root) => {
					for (const [ids, expected] of [
						[row.expect, true],
						[row.unexpected ?? [], false],
					] as const) {
						for (const id of ids) {
							const element = root.querySelector(`#${id}`)!;
							const args = row.ctx ? [row.selector, root.querySelector(row.ctx)] : [row.selector];
							expect(Reflect.apply(element.matches, element, args), `#${id}: ${row.selector}`).toBe(
								expected,
							);
						}
					}
				},
			);
		}
	}
}
