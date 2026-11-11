import type { CompatibilityContext } from '../../../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	const content = `<!doctype html><form>
    <select>
        <option value='foo'>bar</option>
    </select>
</form>`;

	context.test(
		'Verify that using HTMLOptionElement.text setter does not update the existing text child node.',
		({ document }) => {
			let option = document.querySelector('option')!;
			let textChild = option.firstChild!;
			expect(
				textChild.nodeValue,
				"Verify that text child node's value equals the option value.",
			).toBe('bar');
			expect(textChild.isConnected, 'Verify that text child node is in the document.').toBe(true);
			option.text = 'baz';
			expect(
				textChild.nodeValue,
				'Verify that the text child node does not have an updated value.',
			).toBe('bar');
			expect(textChild.isConnected, 'Verify that the text child node is not in the document.').toBe(
				false,
			);
			expect(
				textChild,
				'Verify that text child node was replaced by a different text child node.',
			).not.toBe(option.firstChild!);
			expect(
				option.firstChild!.nodeValue,
				'Verify that the new text child node does equal the updated value.',
			).toBe('baz');
			expect(option.text, 'Verify that option text getter returns the updated value.').toBe('baz');
			option.text = '';
			expect(
				option.firstChild!,
				'Verify that after setting to empty string there are no child text nodes.',
			).toBe(null);
		},
		{ document: { contentType: 'text/html', content } },
	);
}
