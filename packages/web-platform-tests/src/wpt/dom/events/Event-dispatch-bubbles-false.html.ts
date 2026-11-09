import type { CompatibilityContext } from '../../../shared/context.ts';

const markup = `<!doctype html><div id="log"></div><table id="table" border="1" style="display: none">
    <tbody id="table-body">
    <tr id="table-row">
        <td id="table-cell">Shady Grove</td>
        <td>Aeolian</td>
    </tr>
    <tr id="parent">
        <td id="target">Over the river, Charlie</td>
        <td>Dorian</td>
    </tr>
    </tbody>
</table>`;

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	{
		function targetsForDocumentChain(document: Document): EventTarget[] {
			return [
				document,
				document.documentElement,
				document.getElementsByTagName('body')[0]!,
				document.getElementById('table')!,
				document.getElementById('table-body')!,
				document.getElementById('parent')!,
			];
		}

		function testChain(
			document: Document,
			targetParents: EventTarget[],
			phases: number[],
			event_type: string,
		) {
			let target = document.getElementById('target')!;
			let targets = targetParents.concat(target);
			let expected_targets = targets.concat(target);

			let actual_targets: (EventTarget | null)[] = [],
				actual_phases: number[] = [];
			let test_event = function (evt: Event) {
				actual_targets.push(evt.currentTarget);
				actual_phases.push(evt.eventPhase);
			};

			for (let i = 0; i < targets.length; i++) {
				targets[i]!.addEventListener(event_type, test_event, true);
				targets[i]!.addEventListener(event_type, test_event, false);
			}

			let evt = document.createEvent('Event');
			evt.initEvent(event_type, false, true);

			target.dispatchEvent(evt);

			{
				const actual = actual_targets;
				const expected = expected_targets;
				expect(actual.length, 'targets').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'targets').toBe(expected[index]);
			}
			{
				const actual = actual_phases;
				const expected = phases;
				expect(actual.length, 'phases').toBe(expected.length);
				for (let index = 0; index < expected.length; index++)
					expect(actual[index], 'phases').toBe(expected[index]);
			}
		}

		context.test(
			'bubbles=false: ' + 'In window.document with click event',
			(fixture) => {
				const { document } = fixture;
				const window = document.defaultView!;
				const Event = fixture.Event;

				const phasesForDocumentChain = [
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.AT_TARGET,
					Event.AT_TARGET,
				];

				let chainWithWindow = ([window] as EventTarget[]).concat(targetsForDocumentChain(document));
				testChain(
					document,
					chainWithWindow,
					([Event.CAPTURING_PHASE] as number[]).concat(phasesForDocumentChain),
					'click',
				);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'bubbles=false: ' + 'In window.document with load event',
			(fixture) => {
				const { document } = fixture;
				const window = document.defaultView!;
				const Event = fixture.Event;

				const phasesForDocumentChain = [
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.AT_TARGET,
					Event.AT_TARGET,
				];

				testChain(document, targetsForDocumentChain(document), phasesForDocumentChain, 'load');
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'bubbles=false: ' + 'In window.document.cloneNode(true)',
			(fixture) => {
				const { document } = fixture;
				const window = document.defaultView!;
				const Event = fixture.Event;

				const phasesForDocumentChain = [
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.AT_TARGET,
					Event.AT_TARGET,
				];

				let documentClone = document.cloneNode(true) as Document;
				testChain(
					documentClone,
					targetsForDocumentChain(documentClone),
					phasesForDocumentChain,
					'click',
				);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'bubbles=false: ' + 'In new Document()',
			(fixture) => {
				const { document } = fixture;
				const window = document.defaultView!;
				const Event = fixture.Event;
				const Document = fixture.Document;
				const phasesForDocumentChain = [
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.AT_TARGET,
					Event.AT_TARGET,
				];

				let newDocument = new Document();
				newDocument.appendChild(document.documentElement.cloneNode(true));
				testChain(
					newDocument,
					targetsForDocumentChain(newDocument),
					phasesForDocumentChain,
					'click',
				);
			},
			{
				document: {
					contentType: 'text/html',
					content: markup,
				},
			},
		);
		context.test(
			'bubbles=false: ' + 'In DOMImplementation.createHTMLDocument()',
			(fixture) => {
				const { document } = fixture;
				const window = document.defaultView!;
				const Event = fixture.Event;

				const phasesForDocumentChain = [
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.CAPTURING_PHASE,
					Event.AT_TARGET,
					Event.AT_TARGET,
				];

				let HTMLDocument = document.implementation.createHTMLDocument();
				HTMLDocument.body.appendChild(document.getElementById('table')!.cloneNode(true));
				testChain(
					HTMLDocument,
					targetsForDocumentChain(HTMLDocument),
					phasesForDocumentChain,
					'click',
				);
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
