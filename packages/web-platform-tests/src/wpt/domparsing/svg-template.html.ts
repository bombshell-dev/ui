import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('document', ({ DOMParser }) => {
		const p = new DOMParser();
		const doc = p.parseFromString(
			'<!DOCTYPE html><svg><template>text</template></svg>',
			'text/html',
		);

		const template = doc.querySelector('template')!;
		expect(template.textContent).toBe('text');
		expect(template.namespaceURI).toBe('http://www.w3.org/2000/svg');
		expect('content' in template).toBe(false);
	});
	context.test('fragment', ({ document }) => {
		const doc = document.implementation.createHTMLDocument();
		doc.body.innerHTML = '<svg><template></template></svg>';
		doc.querySelector('template')!.innerHTML = 'text';

		const template = doc.querySelector('template')!;
		expect(template.textContent).toBe('text');
		expect(template.namespaceURI).toBe('http://www.w3.org/2000/svg');
		expect('content' in template).toBe(false);
	});
}
