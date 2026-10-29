import { test } from 'vitest';
import {
	applyWorkload,
	setupUI,
	shapes,
	waitFor,
	workloads,
	type UIWorkloadFixture,
} from './helpers.ts';

const nodeCounts = [100, 500, 1_000, 2_000] as const;
const benchmarkOptions = {
	time: 300,
	iterations: 10,
	warmupTime: 50,
	warmupIterations: 2,
};
const cases = nodeCounts.flatMap((nodeCount) =>
	shapes.map((shape) => ({ name: `${shape} (${nodeCount})`, nodeCount, shape })),
);

test('initial render', async ({ bench }) => {
	const entries = cases.map((benchmarkCase) => {
		let fixture: UIWorkloadFixture;
		return bench(
			benchmarkCase.name,
			{
				async beforeEach() {
					fixture = await setupUI(benchmarkCase.nodeCount, benchmarkCase.shape);
				},
				async afterEach() {
					await fixture.close();
				},
			},
			async () => fixture.start(),
		);
	});
	await bench.compare(...entries, benchmarkOptions);
});

// bump timeout for CI as it runs slower and hits Vitest's default timeout in the CodSpeed runner
test.for(workloads)('%s', { timeout: 180_000 }, async (workload, { bench }) => {
	const entries = cases.map((benchmarkCase) => {
		let fixture: UIWorkloadFixture;
		let iteration = 0;
		return bench(
			benchmarkCase.name,
			{
				async beforeEach() {
					fixture = await setupUI(benchmarkCase.nodeCount, benchmarkCase.shape);
					await fixture.start();
					iteration = 0;
				},
				async afterEach() {
					await fixture.close();
				},
			},
			async () => {
				const writeCount = fixture.completedWrites();
				applyWorkload({ fixture, workload, iteration: iteration++ });
				await waitFor(() => fixture.completedWrites() > writeCount);
			},
		);
	});
	await bench.compare(...entries, benchmarkOptions);
});
