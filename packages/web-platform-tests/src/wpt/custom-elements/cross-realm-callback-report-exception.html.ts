import type { CompatibilityContext } from '../../shared/context.ts';
import { create_window_in_test } from './resources/custom-elements-helpers.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test('constructor', async (fixture) => {
		const { document } = fixture;
		const window = document.defaultView as Window & typeof globalThis & { onerrorCalls: string[] };
		const frames = [
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
		] as const;
		let onerrorCalls: string[] = [];
		window.onerror = () => {
			onerrorCalls.push('top');
		};
		frames[0].onerror = () => {
			onerrorCalls.push('frame0');
		};
		frames[1].onerror = () => {
			onerrorCalls.push('frame1');
		};
		frames[2].onerror = () => {
			onerrorCalls.push('frame2');
		};
		const sourceThrowError = 'throw new parent.frames[2].Error("PASS")';

		window.onerrorCalls = onerrorCalls = [];

		const XFoo = new frames[1].Function(sourceThrowError);
		frames[0].customElements.define('x-foo-constructor', XFoo as CustomElementConstructor);

		frames[0].document.createElement('x-foo-constructor');
		{
			const actualArray = onerrorCalls;
			const expectedArray = ['frame1'];
			expect(actualArray.length).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index]).toBe(expectedArray[index]);
		}
	});
	context.test('connectedCallback', async (fixture) => {
		const { document } = fixture;
		const window = document.defaultView as Window & typeof globalThis & { onerrorCalls: string[] };
		const frames = [
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
		] as const;
		let onerrorCalls: string[] = [];
		window.onerror = () => {
			onerrorCalls.push('top');
		};
		frames[0].onerror = () => {
			onerrorCalls.push('frame0');
		};
		frames[1].onerror = () => {
			onerrorCalls.push('frame1');
		};
		frames[2].onerror = () => {
			onerrorCalls.push('frame2');
		};
		const sourceThrowError = 'throw new parent.frames[2].Error("PASS")';

		window.onerrorCalls = onerrorCalls = [];

		const XFooConnected = class extends frames[0].HTMLElement {
			declare static observedAttributes: string[];
			declare connectedCallback: Function;
			declare disconnectedCallback: Function;
			declare attributeChangedCallback: Function;
			declare adoptedCallback: Function;
		};
		XFooConnected.prototype.connectedCallback = new frames[1].Function(sourceThrowError);
		frames[0].customElements.define('x-foo-connected', XFooConnected);

		const el = frames[0].document.createElement('x-foo-connected');
		frames[0].document.body.append(el);

		{
			const actualArray = onerrorCalls;
			const expectedArray = ['frame1'];
			expect(actualArray.length).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index]).toBe(expectedArray[index]);
		}
	});
	context.test('disconnectedCallback', async (fixture) => {
		const { document } = fixture;
		const window = document.defaultView as Window & typeof globalThis & { onerrorCalls: string[] };
		const frames = [
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
		] as const;
		let onerrorCalls: string[] = [];
		window.onerror = () => {
			onerrorCalls.push('top');
		};
		frames[0].onerror = () => {
			onerrorCalls.push('frame0');
		};
		frames[1].onerror = () => {
			onerrorCalls.push('frame1');
		};
		frames[2].onerror = () => {
			onerrorCalls.push('frame2');
		};
		const sourceThrowError = 'throw new parent.frames[2].Error("PASS")';

		window.onerrorCalls = onerrorCalls = [];

		const XFooDisconnected = class extends frames[0].HTMLElement {
			declare static observedAttributes: string[];
			declare connectedCallback: Function;
			declare disconnectedCallback: Function;
			declare attributeChangedCallback: Function;
			declare adoptedCallback: Function;
		};
		XFooDisconnected.prototype.disconnectedCallback = new frames[1].Function(sourceThrowError);
		frames[0].customElements.define('x-foo-disconnected', XFooDisconnected);

		const el = frames[0].document.createElement('x-foo-disconnected');
		frames[0].document.body.append(el);
		el.remove();

		{
			const actualArray = onerrorCalls;
			const expectedArray = ['frame1'];
			expect(actualArray.length).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index]).toBe(expectedArray[index]);
		}
	});
	context.test('attributeChangedCallback', async (fixture) => {
		const { document } = fixture;
		const window = document.defaultView as Window & typeof globalThis & { onerrorCalls: string[] };
		const frames = [
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
		] as const;
		let onerrorCalls: string[] = [];
		window.onerror = () => {
			onerrorCalls.push('top');
		};
		frames[0].onerror = () => {
			onerrorCalls.push('frame0');
		};
		frames[1].onerror = () => {
			onerrorCalls.push('frame1');
		};
		frames[2].onerror = () => {
			onerrorCalls.push('frame2');
		};
		const sourceThrowError = 'throw new parent.frames[2].Error("PASS")';

		window.onerrorCalls = onerrorCalls = [];

		const XFooAttributeChanged = class extends frames[0].HTMLElement {
			declare static observedAttributes: string[];
			declare connectedCallback: Function;
			declare disconnectedCallback: Function;
			declare attributeChangedCallback: Function;
			declare adoptedCallback: Function;
		};
		XFooAttributeChanged.observedAttributes = ['foo'];
		XFooAttributeChanged.prototype.attributeChangedCallback = new frames[1].Function(
			sourceThrowError,
		);
		frames[0].customElements.define('x-foo-attribute-changed', XFooAttributeChanged);

		const el = frames[0].document.createElement('x-foo-attribute-changed');
		frames[0].document.body.append(el);
		el.setAttribute('foo', 'bar');

		{
			const actualArray = onerrorCalls;
			const expectedArray = ['frame1'];
			expect(actualArray.length).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index]).toBe(expectedArray[index]);
		}
	});
	context.test('adoptedCallback', async (fixture) => {
		const { document } = fixture;
		const window = document.defaultView as Window & typeof globalThis & { onerrorCalls: string[] };
		const frames = [
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
			await create_window_in_test(document, fixture),
		] as const;
		let onerrorCalls: string[] = [];
		window.onerror = () => {
			onerrorCalls.push('top');
		};
		frames[0].onerror = () => {
			onerrorCalls.push('frame0');
		};
		frames[1].onerror = () => {
			onerrorCalls.push('frame1');
		};
		frames[2].onerror = () => {
			onerrorCalls.push('frame2');
		};
		const sourceThrowError = 'throw new parent.frames[2].Error("PASS")';

		window.onerrorCalls = onerrorCalls = [];

		const XFooAdopted = class extends frames[0].HTMLElement {
			declare static observedAttributes: string[];
			declare connectedCallback: Function;
			declare disconnectedCallback: Function;
			declare attributeChangedCallback: Function;
			declare adoptedCallback: Function;
		};
		XFooAdopted.prototype.adoptedCallback = new frames[1].Function(sourceThrowError);
		frames[0].customElements.define('x-foo-adopted', XFooAdopted);

		const el = frames[0].document.createElement('x-foo-adopted');
		document.body.append(el);

		{
			const actualArray = onerrorCalls;
			const expectedArray = ['frame1'];
			expect(actualArray.length).toBe(expectedArray.length);
			for (let index = 0; index < expectedArray.length; index++)
				expect(actualArray[index]).toBe(expectedArray[index]);
		}
	});
}
