import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test(
		'Range.deleteContents() when "<div><shadow-root>{}</shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName = 'Range.deleteContents() when "<div><shadow-root>{}</shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			const range = document.createRange();
			range.setStart(shadowRoot, 0);
			try {
				range.deleteContents();
			} catch (e) {
				expect(false, `${caseName}: range.deleteContents() shouldn't throw exception`).toBe(true);
			}
			expect(
				!!host.shadowRoot,
				`${caseName}: range.deleteContents() shouldn't delete the ShadowRoot`,
			).toBe(true);
			expect(
				host.shadowRoot!.innerHTML,
				`${caseName}: range.deleteContents() shouldn't modify the ShadowRoot`,
			).toBe('');
		},
	);
	context.test(
		'Range.deleteContents() when "<div><shadow-root>{<span>ABC</span>}</shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName =
				'Range.deleteContents() when "<div><shadow-root>{<span>ABC</span>}</shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = '<span>ABC</span>';
			const range = document.createRange();
			range.setStart(shadowRoot, 0);
			range.setEnd(shadowRoot, 1);
			try {
				range.deleteContents();
			} catch (e) {
				expect(false, `${caseName}: range.deleteContents() shouldn't throw exception`).toBe(true);
			}
			expect(
				!!host.shadowRoot,
				`${caseName}: range.deleteContents() shouldn't delete the ShadowRoot`,
			).toBe(true);
			expect(
				host.shadowRoot!.innerHTML,
				`${caseName}: range.deleteContents() should delete all children of ShadowRoot`,
			).toBe('');
		},
	);
	context.test(
		'Range.deleteContents() when "<div><shadow-root>{<span>ABC</span>}<span>DEF</span></shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName =
				'Range.deleteContents() when "<div><shadow-root>{<span>ABC</span>}<span>DEF</span></shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = '<span>ABC</span><span>DEF</span>';
			const range = document.createRange();
			range.setStart(shadowRoot, 0);
			range.setEnd(shadowRoot, 1);
			try {
				range.deleteContents();
			} catch (e) {
				expect(false, `${caseName}: range.deleteContents() shouldn't throw exception`).toBe(true);
			}
			expect(
				!!host.shadowRoot,
				`${caseName}: range.deleteContents() shouldn't delete the ShadowRoot`,
			).toBe(true);
			expect(
				host.shadowRoot!.innerHTML,
				`${caseName}: range.deleteContents() should delete only the first child of ShadowRoot`,
			).toBe('<span>DEF</span>');
		},
	);
	context.test(
		'Range.deleteContents() when "<div><shadow-root><span>ABC</span>{<span>DEF</span>}</shadow-root></div>"',
		({ document, cleanup }) => {
			const caseName =
				'Range.deleteContents() when "<div><shadow-root><span>ABC</span>{<span>DEF</span>}</shadow-root></div>"';

			const host = document.createElement('div');
			cleanup(() => host.remove());
			const shadowRoot = host.attachShadow({ mode: 'open' });
			shadowRoot.innerHTML = '<span>ABC</span><span>DEF</span>';
			const range = document.createRange();
			range.setStart(shadowRoot, 1);
			range.setEnd(shadowRoot, 2);
			try {
				range.deleteContents();
			} catch (e) {
				expect(false, `${caseName}: range.deleteContents() shouldn't throw exception`).toBe(true);
			}
			expect(
				!!host.shadowRoot,
				`${caseName}: range.deleteContents() shouldn't delete the ShadowRoot`,
			).toBe(true);
			expect(
				host.shadowRoot!.innerHTML,
				`${caseName}: range.deleteContents() should delete only the last child of ShadowRoot`,
			).toBe('<span>ABC</span>');
		},
	);
}
