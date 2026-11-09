import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'Re-entrant createElement() of the same element before super()',
		({ document, HTMLElement, customElements }) => {
			let nested: HTMLElement | undefined;
			let needsReentry = true;
			class Reentrant extends HTMLElement {
				constructor() {
					if (needsReentry) {
						needsReentry = false;
						nested = document.createElement('reentrant-before-super');
					}
					super();
				}
			}
			customElements.define('reentrant-before-super', Reentrant);

			const outer = document.createElement('reentrant-before-super');

			expect(
				nested instanceof Reentrant,
				'the re-entrant createElement() constructs an element',
			).toBe(true);
			expect(nested!.localName).toBe('reentrant-before-super');
			expect(outer instanceof Reentrant, 'the outer createElement() constructs an element').toBe(
				true,
			);
			expect(outer.localName).toBe('reentrant-before-super');
			expect(outer, 'the two createElement() calls construct distinct elements').not.toBe(nested);
		},
	);
	context.test(
		'Re-entrant createElement() of the same element after super()',
		({ document, HTMLElement, customElements }) => {
			let nested: HTMLElement | undefined;
			let needsReentry = true;
			class Reentrant extends HTMLElement {
				constructor() {
					super();
					if (needsReentry) {
						needsReentry = false;
						nested = document.createElement('reentrant-after-super');
					}
				}
			}
			customElements.define('reentrant-after-super', Reentrant);

			const outer = document.createElement('reentrant-after-super');

			expect(
				nested instanceof Reentrant,
				'the re-entrant createElement() constructs an element',
			).toBe(true);
			expect(nested!.localName).toBe('reentrant-after-super');
			expect(outer instanceof Reentrant, 'the outer createElement() constructs an element').toBe(
				true,
			);
			expect(outer.localName).toBe('reentrant-after-super');
			expect(outer, 'the two createElement() calls construct distinct elements').not.toBe(nested);
		},
	);
}
