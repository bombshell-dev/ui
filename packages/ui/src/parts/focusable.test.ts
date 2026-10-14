import { describe, expect, expectTypeOf, test } from 'vitest';
import { ComponentElement, PrimitiveElement, defineComponent } from '../component.ts';
import type { Node } from '../core.ts';
import type { HostElement, PropertyChange } from '../elements.ts';
import { createHost, type Host } from '../host.ts';
import { FocusApi, installFocus } from '../focus.ts';
import { Focusable } from './focusable.ts';

interface Props {
	readonly disabled?: boolean;
	readonly label?: string;
}

class Control extends Focusable(ComponentElement<Props>) {
	static instances: Control[] = [];
	readonly changes: boolean[] = [];
	readonly createFocus: boolean[] = [];

	constructor(element: HostElement) {
		super(element);
		Control.instances.push(this);
	}

	override get focusable(): boolean {
		return !this.props.disabled;
	}

	override create(): void {
		this.createFocus.push(this.focused);
	}

	override focusChangedCallback(focused: boolean): void {
		expect(this.focused).toBe(focused);
		expect(FocusApi.at(this.host.root).getFocus() === this.node).toBe(focused);
		this.changes.push(focused);
	}
}

function setup(host = createHost()): { host: Host; element: HostElement; control: Control } {
	defineComponent('focusable-test', Control).register(host);
	const element = host.createElement('focusable-test');
	const control = Control.instances.at(-1)!;
	return { host, element, control };
}

describe('Focusable', () => {
	test('plain components do not install focus on a bare Host', () => {
		const host = createHost();
		class Plain extends ComponentElement {}
		defineComponent('plain', Plain).register(host);
		host.element.append(host.createElement('plain'));
		expect(() => FocusApi.at(host.root)).toThrow();
	});

	test('reads false before connection and during create, then takes first focus without stealing', () => {
		const { host, element, control } = setup();
		expect(control.focused).toBe(false);
		expect(() => FocusApi.at(host.root)).toThrow();
		host.element.append(element);
		expect(control.createFocus).toEqual([false]);
		expect(control.focused).toBe(true);
		expect(control.changes).toEqual([true]);
		const second = host.createElement('focusable-test');
		const other = Control.instances.at(-1)!;
		host.element.append(second);
		expect(other.focused).toBe(false);
		expect(FocusApi.at(host.root).canFocus(second.node!)).toBe(true);
		expect(FocusApi.at(host.root).getFocus()).toBe(element.node);
	});

	test('uses the policy getter on property changes without redundant view updates', () => {
		const { host, element, control } = setup();
		element.setProperty('disabled', true);
		host.element.append(element);
		expect(control.focusable).toBe(false);
		expect(control.focused).toBe(false);
		expect(FocusApi.at(host.root).canFocus(element.node!)).toBe(false);
		element.setProperty('disabled', false);
		expect(control.focused).toBe(true);
		element.setProperty('label', 'updated');
		control.updateFocusability();
		expect(control.changes).toEqual([true]);
		element.setProperty('disabled', true);
		expect(control.focused).toBe(false);
		expect(control.changes).toEqual([true, false]);
	});

	test('focus and blur views read actual root state', () => {
		const { host, element, control } = setup(createHost());
		const second = host.createElement('focusable-test');
		const other = Control.instances.at(-1)!;
		host.element.append(element, second);
		second.focus();
		expect(control.changes).toEqual([true, false]);
		expect(other.changes).toEqual([true]);
		element.focus();
		expect(control.changes).toEqual([true, false, true]);
		expect(other.changes).toEqual([true, false]);
	});

	test('does not refocus a blurred control when unrelated properties change', () => {
		const { host, element, control } = setup();
		host.element.append(element);
		const focus = FocusApi.at(host.root);
		focus.setFocus(host.root);
		element.setProperty('label', 'updated');
		control.updateFocusability();
		expect(focus.canFocus(element.node!)).toBe(true);
		expect(focus.getFocus()).toBe(host.root);
		expect(control.focused).toBe(false);
		expect(control.changes).toEqual([true, false]);
		element.setProperty('disabled', true);
		element.setProperty('disabled', false);
		expect(focus.getFocus()).toBe(element.node);
		expect(control.changes).toEqual([true, false, true]);
	});

	test('clears the old node flag and reconnects the retained instance to a new node', () => {
		const { host, element, control } = setup();
		host.element.append(element);
		const previous = element.node!;
		element.remove();
		expect(control.node).toBeNull();
		expect(control.focused).toBe(false);
		expect(FocusApi.at(host.root).canFocus(previous)).toBe(false);
		control.updateFocusability();
		host.element.append(element);
		expect(element.node).not.toBe(previous);
		expect(control.node).toBe(element.node);
		expect(control.createFocus).toEqual([false]);
		expect(control.changes).toEqual([true, false, true]);
	});

	test('retains element and instance state across subtree moves', () => {
		const { host, element, control } = setup();
		const left = host.createElement('custom', element);
		const right = host.createElement('custom');
		host.element.append(left, right);
		const oldNode = element.node;
		right.append(left);
		expect(left.firstChild).toBe(element);
		expect(control.element).toBe(element);
		expect(control.node).toBe(element.node);
		expect(control.createFocus).toEqual([false]);
		expect(control.focused).toBe(true);
		if (oldNode !== element.node) expect(FocusApi.at(host.root).canFocus(oldNode!)).toBe(false);
	});

	test('chains lifecycle hooks in order and ignores a connection invalidated by super', () => {
		const host = createHost();
		const calls: string[] = [];
		class Base extends ComponentElement<Props> {
			override connectedCallback(): void {
				calls.push('base connect');
			}
			override disconnectedCallback(node: Node): void {
				expect(FocusApi.at(host.root).canFocus(node)).toBe(false);
				calls.push('base disconnect');
			}
			override focusedCallback(): void {
				calls.push('base focus');
			}
			override blurredCallback(): void {
				calls.push('base blur');
			}
			override propertyChanged(_change: PropertyChange): void {
				calls.push('base property');
			}
		}
		class Chained extends Focusable(Base) {
			override focusChangedCallback(focused: boolean): void {
				calls.push(`view ${focused}`);
			}
			override updateFocusability(): void {
				calls.push('update');
				super.updateFocusability();
			}
		}
		defineComponent('chained', Chained).register(host);
		const element = host.createElement('chained');
		host.element.append(element);
		element.setProperty('label', 'next');
		element.remove();
		expect(calls).toEqual([
			'base connect',
			'update',
			'base focus',
			'view true',
			'base property',
			'update',
			'base blur',
			'view false',
			'base disconnect',
		]);
		class Removing extends ComponentElement {
			override connectedCallback(): void {
				this.element.remove();
			}
		}
		defineComponent('removing', Focusable(Removing)).register(host);
		const removed = host.createElement('removing');
		host.element.append(removed);
		expect(removed.node).toBeNull();
	});

	test('skips stale view notifications when superclass callbacks redirect focus', () => {
		const host = createHost();
		const changes: boolean[] = [];
		class Redirecting extends ComponentElement {
			override focusedCallback(): void {
				FocusApi.at(host.root).setFocus(host.root);
			}
		}
		class RedirectControl extends Focusable(Redirecting) {
			override focusChangedCallback(focused: boolean): void {
				changes.push(focused);
			}
		}
		defineComponent('redirect', RedirectControl).register(host);
		host.element.append(host.createElement('redirect'));
		expect(changes).toEqual([false]);
	});

	test('keeps FocusApi middleware in the eligibility and getter paths', () => {
		const { host, element, control } = setup();
		installFocus(host);
		const calls: string[] = [];
		FocusApi.decorate(host.root, () => ({
			setFocusable(value) {
				calls.push(`eligible ${value}`);
				super.setFocusable(value);
			},
			getFocus() {
				calls.push('read');
				return super.getFocus();
			},
		}));
		host.element.append(element);
		expect(control.focused).toBe(true);
		expect(calls).toContain('eligible true');
		expect(calls).toContain('read');
		const error = new Error('focus middleware failed');
		FocusApi.decorate(host.root, () => ({
			getFocus(): Node {
				throw error;
			},
		}));
		expect(() => control.focused).toThrow(error);
	});

	test('preserves readonly generic props, primitive methods, constructor arguments and statics', () => {
		class Base extends PrimitiveElement<Props> {
			static readonly marker = 'base' as const;
			private readonly secret = 1;
			readonly count: number;
			constructor(element: HostElement, count: number) {
				super(element);
				this.count = count;
			}
			layout(): [] {
				void this.secret;
				return [];
			}
		}
		const Mixed = Focusable(Base);
		class Concrete extends Mixed {}
		expectTypeOf<ConstructorParameters<typeof Concrete>>().toEqualTypeOf<[HostElement, number]>();
		expectTypeOf<Concrete['props']>().toEqualTypeOf<Props>();
		expectTypeOf<Concrete['layout']>().toEqualTypeOf<Base['layout']>();
		expectTypeOf(Mixed.marker).toEqualTypeOf<'base'>();
		const instance = new Concrete(createHost().createElement('custom'), 3);
		expect(instance.count).toBe(3);
		expect(instance.focusable).toBe(true);
		expect(instance.focused).toBe(false);
	});
});
