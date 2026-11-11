import type { CompatibilityContext } from '../../../shared/context.ts';
import { checkRecords } from './mutationobservers.js.ts';

const markup = `<!DOCTYPE HTML>
<meta charset=utf-8>
<title>MutationObservers: takeRecords</title>



<h1>MutationObservers: takeRecords</h1>
<div id="log"></div>

<section style="display: none">

<p id='n00'></p>

</section>



`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	context.test(
		'All records present',
		({ document, MutationObserver, step, cleanup }) => {
			const n00 = document.getElementById('n00')!;
			const observer = new MutationObserver(
				step(() => expect.unreachable('the observer callback should not fire')),
			);
			observer.observe(n00, {
				subtree: true,
				childList: true,
				attributes: true,
				characterData: true,
				attributeOldValue: true,
				characterDataOldValue: true,
			});
			n00.id = 'foo';
			n00.id = 'bar';
			n00.className = 'bar';
			n00.textContent = 'old data';
			(n00.firstChild as CharacterData).data = 'new data';
			cleanup(() => observer.disconnect());

			checkRecords(expect, n00, observer.takeRecords(), [
				{ type: 'attributes', attributeName: 'id', oldValue: 'n00' },
				{ type: 'attributes', attributeName: 'id', oldValue: 'foo' },
				{ type: 'attributes', attributeName: 'class' },
				{ type: 'childList', addedNodes: [n00.firstChild!] },
				{ type: 'characterData', oldValue: 'old data', target: n00.firstChild! },
			]);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		'No more records present',
		({ document, MutationObserver, step, cleanup }) => {
			const n00 = document.getElementById('n00')!;
			const observer = new MutationObserver(
				step(() => expect.unreachable('the observer callback should not fire')),
			);
			observer.observe(n00, {
				subtree: true,
				childList: true,
				attributes: true,
				characterData: true,
				attributeOldValue: true,
				characterDataOldValue: true,
			});
			n00.id = 'foo';
			n00.id = 'bar';
			n00.className = 'bar';
			n00.textContent = 'old data';
			(n00.firstChild as CharacterData).data = 'new data';
			cleanup(() => observer.disconnect());
			observer.takeRecords();

			checkRecords(expect, n00, observer.takeRecords(), []);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
