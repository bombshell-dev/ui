import type { CompatibilityContext } from '../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;

	context.test('PI with empty data', ({ document }) => {
		const pi = document.createProcessingInstruction('target', '');
		const div = document.createElement('div');
		div.appendChild(pi!);
		// There's a space because the spec does not special-case empty data.
		expect(div.innerHTML).toBe('<?target ?>');
	});
	context.test('PI with non-empty data', ({ document }) => {
		const pi = document.createProcessingInstruction('target', 'data');
		const div = document.createElement('div');
		div.appendChild(pi!);
		expect(div.innerHTML).toBe('<?target data?>');
	});
	context.test('PI adopted from XML document', ({ document, DOMParser }) => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString('<root><?target data?></root>', 'text/xml');
		const pi = xmlDoc.documentElement.firstChild;
		const div = document.createElement('div');
		div.appendChild(pi!);
		expect(div.innerHTML).toBe('<?target data?>');
	});
}
