export function setTabIndex(elements: HTMLElement[], value: number) {
	for (const el of elements) {
		el.tabIndex = value;
	}
}

export function removeTabIndex(elements: HTMLElement[]) {
	for (const el of elements) {
		el.removeAttribute('tabindex');
	}
}

export function resetFocus(root: Document | ShadowRoot) {
	if (root.activeElement) (root.activeElement as HTMLElement).blur();
}
