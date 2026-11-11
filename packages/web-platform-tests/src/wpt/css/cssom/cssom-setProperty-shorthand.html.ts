import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!DOCTYPE html>
<html>
    <head>
        <title>CSSOM: CSSStyleDeclaration (set|remove)PropertyValue sets/removes shorthand properties</title>
\x20\x20\x20\x20\x20\x20\x20\x20
\x20\x20\x20\x20\x20\x20\x20\x20

\x20\x20\x20\x20\x20\x20\x20\x20
        <meta name="flags" content="dom">

\x20\x20\x20\x20\x20\x20\x20\x20
\x20\x20\x20\x20\x20\x20\x20\x20
    </head>

    <body>
        <div id="log"></div>

        <div id="box"></div>

\x20\x20\x20\x20\x20\x20\x20\x20
    </body>
</html>
`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	function canSetProperty(element: HTMLElement, propertyName: string, priority: string) {
		element.style.setProperty(propertyName, 'initial', priority);
		return element.style.getPropertyValue(propertyName) == 'initial';
	}
	function canRemoveProperty(element: HTMLElement, propertyName: string) {
		element.style.removeProperty(propertyName);
		return element.style.getPropertyValue(propertyName) != 'initial';
	}
	for (const propertyName of [
		'font',
		'border-top',
		'border-right',
		'border-bottom',
		'border-left',
		'border',
		'border-color',
		'border-style',
		'border-width',
		'background-position',
		'background-repeat',
		'border-spacing',
		'list-style',
		'margin',
		'outline',
		'padding',
		'background',
		'overflow',
		'border-radius',
	]) {
		context.test(
			'shorthand ' + propertyName + ' can be set with setProperty',
			({ document }) => {
				const element = document.createElement('span');

				expect(
					canSetProperty(element, propertyName, ''),
					'can setPropertyValue with shorthand',
				).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'shorthand ' + propertyName + ' can be removed with removeProperty',
			({ document }) => {
				const element = document.createElement('span');

				canSetProperty(element, propertyName, '');

				expect(
					canRemoveProperty(element, propertyName),
					'can setPropertyValue with shorthand',
				).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'shorthand ' + propertyName + ' can be set with setProperty and priority !important',
			({ document }) => {
				const element = document.createElement('span');

				expect(
					canSetProperty(element, propertyName, 'important'),
					'can setPropertyValue with shorthand',
				).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'shorthand ' +
				propertyName +
				' can be removed with removeProperty even when set with !important',
			({ document }) => {
				const element = document.createElement('span');

				canSetProperty(element, propertyName, 'important');

				expect(
					canRemoveProperty(element, propertyName),
					'can setPropertyValue with shorthand',
				).toBe(true);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
	}
}
