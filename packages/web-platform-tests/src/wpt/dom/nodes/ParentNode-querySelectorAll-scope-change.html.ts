import type { CompatibilityContext } from '../../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	function title(source: string, name: string): string {
		return `WPT ${source}: ${name}`;
	}

	const { expect } = context.runner;

	context.test(
		title('ParentNode-querySelectorAll-scope-change.html', 'Change the scope of querySelectorAll'),
		({ DOMParser }) => {
			const data =
				'<plist><dict><key id="target1">PayloadType</key><string>Configuration</string><key>PayloadContent</key><array><dict><key id="target2">FullScreen</key><true/></dict></array></dict></plist>';
			const xmlDocument = new DOMParser().parseFromString(data, 'application/xml');
			const expectedRoot = xmlDocument.documentElement.firstElementChild!;
			const expectedTarget1 = expectedRoot.children[0]!;
			const expectedTarget2 = expectedRoot.children[3]!.children[0]!.children[0]!;
			const rootCollection = xmlDocument.querySelector(':root > dict')!;
			const keysInRootCollection = rootCollection.querySelectorAll(':scope > key');
			expect(keysInRootCollection.item(0), 'first item').toBe(expectedTarget1);
			const subCollection = rootCollection.children[3]!.children[0]!;
			const keysInSubCollection = subCollection.querySelectorAll(':scope > key');
			const clonedSubCollection = subCollection.cloneNode(true) as Element;
			const keysInClonedSubCollection = clonedSubCollection.querySelectorAll(':scope > key');
			expect(subCollection.outerHTML, 'outerHTML').toBe(clonedSubCollection.outerHTML);
			expect(keysInSubCollection.length, 'length').toBe(keysInClonedSubCollection.length);
			expect(keysInSubCollection.item(0), 'second item').toBe(expectedTarget2);
		},
	);
}
