import type { CompatibilityContext } from '../context.ts';
import { uniqueName } from '../unique-name.ts';
export const spec =
	'https://html.spec.whatwg.org/multipage/custom-elements.html#dom-customelementregistry-define';
const requiredGlobals = ['HTMLElement', 'customElements'] as const;
export { requiredGlobals as globals };
/** Registers behavioral cases with the consumer runner. */
export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('registers a constructor and resolves pending definitions', async ({ globals }) => {
		const HTMLElement = globals('HTMLElement');
		const registry = globals('customElements');
		const name = uniqueName();
		class Item extends HTMLElement {}
		const pending = registry.whenDefined(name);
		expect(registry.get(name)).toBeUndefined();
		registry.define(name, Item);
		expect(registry.get(name)).toBe(Item);
		expect(await pending).toBe(Item);
		expect(await registry.whenDefined(name)).toBe(Item);
		expect(() => registry.define(name, class extends HTMLElement {})).toThrow(
			expect.objectContaining({ name: 'NotSupportedError' }),
		);
	});
	context.test('rejects names without a hyphen', ({ globals }) => {
		const HTMLElement = globals('HTMLElement');
		const registry = globals('customElements');
		expect(() => registry.define('invalidname', class extends HTMLElement {})).toThrow(
			expect.objectContaining({ name: 'SyntaxError' }),
		);
	});

	context.test('rejects reserved names and reuse of a constructor', (fixture) => {
		const Base = fixture.globals('HTMLElement') as unknown as typeof HTMLElement;
		const registry = fixture.globals('customElements') as unknown as CustomElementRegistry;
		const name = uniqueName();
		class Item extends Base {}
		registry.define(name, Item);
		expect(() => registry.define(uniqueName(), Item)).toThrow(
			expect.objectContaining({ name: 'NotSupportedError' }),
		);
		for (const invalid of ['annotation-xml', 'font-face', 'Upper-case'])
			expect(() => registry.define(invalid, class extends Base {})).toThrow(
				expect.objectContaining({ name: 'SyntaxError' }),
			);
	});

	context.test(
		'rejects whenDefined for invalid names and reuses pending promises',
		async (fixture) => {
			const registry = fixture.globals('customElements') as unknown as CustomElementRegistry;
			const name = uniqueName();
			expect(registry.whenDefined(name)).toBe(registry.whenDefined(name));
			await expect(registry.whenDefined('invalid')).rejects.toMatchObject({ name: 'SyntaxError' });
		},
	);
}
