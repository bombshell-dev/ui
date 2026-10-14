import type { ComponentElement } from '../component.ts';
import type { Node } from '../core.ts';
import { getElementHost, type PropertyChange } from '../elements.ts';
import { FocusApi, getFocus, installFocus, setFocusable } from '../focus.ts';

/** Opt a component into host focus without storing a second focus state. */
export function Focusable<Base extends abstract new (...args: any[]) => ComponentElement<object>>(
	Base: Base,
): (abstract new (...args: any[]) => {
	get focusable(): boolean;
	get focused(): boolean;
	focusChangedCallback(focused: boolean): void;
	updateFocusability(): void;
}) &
	Base {
	abstract class FocusableElement extends Base {
		get focusable(): boolean {
			return true;
		}

		get focused(): boolean {
			if (!this.node) return false;
			installFocus(getElementHost(this.element));
			return getFocus(this.node) === this.node;
		}

		focusChangedCallback(_focused: boolean): void {}

		updateFocusability(): void {
			const { node } = this;
			if (!node || this.element.node !== node) return;
			installFocus(getElementHost(this.element));
			const enabled = this.focusable;
			// Updating unrelated properties must not refocus an already eligible, blurred control.
			if (!enabled || !FocusApi.at(node).canFocus(node)) setFocusable(node, enabled);
		}

		override connectedCallback(node: Node): void {
			super.connectedCallback(node);
			if (this.node === node && this.element.node === node) this.updateFocusability();
		}

		override disconnectedCallback(node: Node): void {
			setFocusable(node, false);
			super.disconnectedCallback(node);
		}

		override focusedCallback(node: Node): void {
			super.focusedCallback(node);
			if (this.node === node && this.element.node === node && this.focused) {
				this.focusChangedCallback(this.focused);
			}
		}

		override blurredCallback(node: Node): void {
			super.blurredCallback(node);
			if (this.node === node && this.element.node === node && !this.focused) {
				this.focusChangedCallback(this.focused);
			}
		}

		override propertyChanged(change: PropertyChange): void {
			super.propertyChanged(change);
			this.updateFocusability();
		}
	}
	return FocusableElement;
}
