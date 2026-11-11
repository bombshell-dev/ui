import type { CompatibilityContext } from '../../shared/context.ts';

export function register(context: CompatibilityContext): void {
	const markup = `<!DOCTYPE HTML>
<title>selectionchange event on document</title>
<link rel="author" title="Piotr Oleś" href="mailto:piotrek.oles@gmail.com">
<link rel="help" href="https://w3c.github.io/selection-api/#selectionchange-event">

<script></script>
<script></script>

<div id="example">test <span>nested</span></div>

<script></script>
`;

	const { expect } = context.runner;
	function tick() {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, 0);
		});
	}

	async function setupTest(document: Document) {
		const target = document.getElementById('example')!;
		const selection = document.getSelection()!;

		// Clean-up the state
		selection.removeAllRanges();
		await tick();

		// Add event listeners and increment count on each event
		let events = 0;
		document.addEventListener('selectionchange', () => {
			events++;
		});

		function getEventsCount() {
			return events;
		}

		return { target, selection, getEventsCount };
	}

	context.test(
		`triggers selectionchange event on setBaseAndExtent`,
		async ({ document }) => {
			const { target, selection, getEventsCount } = await setupTest(document);

			selection.setBaseAndExtent(target, 0, target, 1);
			expect(getEventsCount(), "Should be 0 events as they're scheduled").toBe(0);
			await tick();
			expect(getEventsCount(), 'Should be 1 event').toBe(1);

			selection.setBaseAndExtent(target, 0, target, 1);
			await tick();
			expect(
				getEventsCount(),
				'Should be 1 event because we called setBaseAndExtent with the same arguments',
			).toBe(1);

			selection.setBaseAndExtent(target, 0, target, 2);
			await tick();
			expect(getEventsCount(), 'Should be 2 events').toBe(2);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		`triggers selectionchange event on selectAllChildren`,
		async ({ document }) => {
			const { target, selection, getEventsCount } = await setupTest(document);

			selection.selectAllChildren(target);
			await tick();
			expect(getEventsCount(), 'Should be 1 event').toBe(1);

			selection.selectAllChildren(target);
			await tick();
			expect(
				getEventsCount(),
				'Should be 1 event because we called selectAllChildren with the same arguments',
			).toBe(1);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		`triggers selectionchange event on removeAllRanges`,
		async ({ document }) => {
			const { target, selection, getEventsCount } = await setupTest(document);

			selection.selectAllChildren(target);
			await tick();
			expect(getEventsCount(), 'Should be 1 event').toBe(1);

			selection.removeAllRanges();
			await tick();
			expect(getEventsCount(), 'Should be 2 events').toBe(2);

			selection.removeAllRanges();
			await tick();
			expect(
				getEventsCount(),
				'Should be 2 events because we called removeAllRanges with the same arguments',
			).toBe(2);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		`triggers selectionchange event on collapseToStart`,
		async ({ document }) => {
			const { target, selection, getEventsCount } = await setupTest(document);

			selection.setBaseAndExtent(target, 0, target, 1);
			await tick();
			expect(getEventsCount(), 'Should be 1 event').toBe(1);

			selection.collapseToStart();
			await tick();
			expect(getEventsCount(), 'Should be 2 events').toBe(2);

			selection.collapseToStart();
			await tick();
			expect(
				getEventsCount(),
				'Should be 2 events because we called collapseToStart with the same arguments',
			).toBe(2);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
	context.test(
		`triggers selectionchange event on collapseToEnd`,
		async ({ document }) => {
			const { target, selection, getEventsCount } = await setupTest(document);

			selection.setBaseAndExtent(target, 0, target, 1);
			await tick();
			expect(getEventsCount(), 'Should be 1 event').toBe(1);

			selection.collapseToEnd();
			await tick();
			expect(getEventsCount(), 'Should be 2 events').toBe(2);

			selection.collapseToEnd();
			await tick();
			expect(
				getEventsCount(),
				'Should be 2 events because we called collapseToEnd with the same arguments',
			).toBe(2);
		},
		{
			document: {
				contentType: 'text/html',
				content: markup,
			},
		},
	);
}
