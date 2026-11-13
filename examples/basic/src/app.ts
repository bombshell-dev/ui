import type { Document, Element, ColorValue } from '@clack/ui';

/* oxlint-disable bombshell-dev/exported-function-async -- Builds a detached DOM tree synchronously. */
/** Build the basic panel using elements, text nodes, and inline declarations. */
export function createApp(document: Document): Element {
	const panel = document.createElement('div');
	panel.style.flexDirection = 'column';
	panel.style.gap = '1px';
	panel.style.paddingLeft = '1px';
	panel.style.paddingRight = '1px';
	panel.style.color = 'white';
	panel.style.borderStyle = 'solid';
	panel.style.borderColor = 'blue';
	panel.style.borderTopWidth = '1px';
	panel.style.borderRightWidth = '1px';
	panel.style.borderBottomWidth = '1px';
	panel.style.borderLeftWidth = '1px';
	panel.appendChild(span('@clack/ui', 'cyan'));

	const details = document.createElement('div');
	details.style.flexDirection = 'column';
	details.appendChild(row('status ', span('● ready', 'green')));
	details.appendChild(row('version', span('0.0.0')));
	details.appendChild(row('render ', span('@bomb.sh/tty')));
	panel.appendChild(details);

	return panel;

	function span(content: string, color?: ColorValue): Element {
		const element = document.createElement('span');
		if (color !== undefined) {
			element.style.color = color;
		}
		element.appendChild(document.createTextNode(content));
		return element;
	}

	function row(label: string, value: Element): Element {
		const element = document.createElement('div');
		element.style.gap = '1px';
		element.appendChild(span(label, 'gray'));
		element.appendChild(value);
		return element;
	}
}
