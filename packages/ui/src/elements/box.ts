import { open, close, text, type OpenElement } from '@bomb.sh/tty';
import { lifecycle } from '../core.ts';
import { type Host } from '../host.ts';
import { LayoutApi } from '../layout.ts';
import { getElement } from '../elements.ts';

export type BoxProps = Omit<OpenElement, 'directive' | 'id'>;

declare module '@clack/ui/elements' {
	interface HostElements {
		box: BoxProps;
	}
}

export function useBoxElement(host: Host) {
	LayoutApi.decorate(host.root, () => ({
		*layout() {
			const element = getElement(this.node);
			if (element.name === 'box') {
				let content = '';
				yield open(lifecycle.id(this.node), element.properties);
				for (const child of element.children) {
					if (child.type === 'element') {
						if (content !== '') {
							yield text(content);
							content = '';
						}
						yield* LayoutApi.at(child.node!).layout();
					} else {
						content += child.content;
					}
				}
				if (content !== '') {
					yield text(content);
				}
				yield close();
			} else {
				return yield* super.layout();
			}
		},
	}));
}
