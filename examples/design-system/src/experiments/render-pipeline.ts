import { createTerm, fixed, pack, snapshot, type Op, type Term } from '@bomb.sh/tty';
import {
	createHost,
	Box,
	Text,
	registerComponents,
	layout,
	LayoutApi,
	profileLayout,
	rgba,
	withoutLayoutCache,
	type HostElement,
	type HostLiteral,
	type LayoutProfile,
	type Node,
} from '@clack/ui';

// Disposable experiment: compare rebuilding arrays with retained packed snapshots.
const width = 80;
const height = 24;
const rows = Number(process.env.RENDER_BENCH_ROWS ?? 1000);
const changedRows = Math.min(rows, Number(process.env.RENDER_BENCH_CHANGED_ROWS ?? 100));
const warmups = Number(process.env.RENDER_BENCH_WARMUPS ?? 20);
const frames = Number(process.env.RENDER_BENCH_FRAMES ?? 100);
const workloads: Workload[] = ['text', 'text-batch', 'property', 'children'];
const inputModes: InputMode[] = [
	'uncached-layout',
	'rebuilt-array',
	'materialized-array',
	'retained-snapshots',
];

process.stdout.write(
	`TTY op handoff benchmark (${rows} regions, ${rows * 2} base tty elements, ` +
		`${changedRows} batched text updates, ${frames} frames)\n`,
);
for (const workload of workloads) {
	for (const inputMode of inputModes) {
		const sample = await measure(workload, inputMode);
		process.stdout.write(
			`${sample.name}: mutation ${sample.mutationMedian.toFixed(3)} ms, ` +
				`assembly ${sample.assemblyMedian.toFixed(3)} ms, ` +
				`pack ${sample.packMedian.toFixed(3)} ms, ` +
				`tty.render ${sample.ttyMedian.toFixed(3)} ms, ` +
				`render minus pack ~${sample.renderRemainderMedian.toFixed(3)} ms, ` +
				`frame ${sample.frameMedian.toFixed(3)} ms, ` +
				`frame p95 ${sample.frameP95.toFixed(3)} ms, ` +
				`cache hits/misses/bypass ${sample.layoutProfile.cacheHits}/${sample.layoutProfile.cacheMisses}/${sample.layoutProfile.cacheBypasses}, ` +
				`raw ops ${sample.layoutProfile.rawOpsGenerated}, ` +
				`snapshots ${sample.layoutProfile.snapshotsCreated} (${sample.layoutProfile.snapshotBytesCreated} B), ` +
				`reused ${sample.layoutProfile.snapshotOpsReused} snapshots (${sample.layoutProfile.snapshotBytesReused} B), ` +
				`root array slots ${sample.rootArraySlots}, ` +
				`median output ${sample.outputBytes} bytes\n`,
		);
	}
}

async function measure(workload: Workload, inputMode: InputMode): Promise<Sample> {
	const state = await setup();
	const mutationTimes: number[] = [];
	const assemblyTimes: number[] = [];
	const packTimes: number[] = [];
	const ttyTimes: number[] = [];
	const frameTimes: number[] = [];
	const outputSizes: number[] = [];
	const packedOpsBuffer = new ArrayBuffer(8 * 1024 * 1024);
	let extraSubtree: HostElement | undefined;
	let rootArraySlots = 0;

	for (let frame = 0; frame < warmups + frames; frame++) {
		const frameStart = performance.now();
		const mutationStart = frameStart;
		extraSubtree = mutate(state, workload, frame, extraSubtree);
		const mutationTime = performance.now() - mutationStart;

		const assemblyStart = performance.now();
		const assembled = assembleOps(state, workload, inputMode);
		const { ops } = assembled;
		rootArraySlots = assembled.rootArraySlots;
		const assemblyTime = performance.now() - assemblyStart;

		const ttyStart = performance.now();
		const result = state.term.render(ops);
		const ttyTime = performance.now() - ttyStart;
		const frameTime = performance.now() - frameStart;
		const packStart = performance.now();
		pack(ops, packedOpsBuffer, 0);
		const packTime = performance.now() - packStart;
		if (result.errors.length > 0) {
			throw new RenderPipelineBenchmarkError(
				`TTY rejected ${workload} benchmark frame: ${JSON.stringify(result.errors)}`,
			);
		}
		if (frame >= warmups) {
			mutationTimes.push(mutationTime);
			assemblyTimes.push(assemblyTime);
			packTimes.push(packTime);
			ttyTimes.push(ttyTime);
			frameTimes.push(frameTime);
			outputSizes.push(result.output.length);
		}
	}
	const layoutProfile = await profileOneFrame(workload, inputMode);

	return {
		name: `${workload} / ${inputMode}`,
		mutationMedian: percentile(mutationTimes, 0.5),
		assemblyMedian: percentile(assemblyTimes, 0.5),
		packMedian: percentile(packTimes, 0.5),
		ttyMedian: percentile(ttyTimes, 0.5),
		renderRemainderMedian: percentile(ttyTimes, 0.5) - percentile(packTimes, 0.5),
		frameMedian: percentile(frameTimes, 0.5),
		frameP95: percentile(frameTimes, 0.95),
		layoutProfile,
		rootArraySlots,
		outputBytes: percentile(outputSizes, 0.5),
	};
}

function mutate(
	state: Awaited<ReturnType<typeof setup>>,
	workload: Workload,
	frame: number,
	extraSubtree: HostElement | undefined,
): HostElement | undefined {
	if (workload === 'text') {
		state.host.setText(state.literal, `target value ${frame % 10}`);
	} else if (workload === 'text-batch') {
		for (let index = 0; index < changedRows; index++) {
			state.host.setText(state.literals[index]!, `batch ${index} value ${frame % 100}`);
		}
	} else if (workload === 'property') {
		state.host.setProperty(
			state.targetText,
			'color',
			frame % 2 === 0 ? rgba(255, 255, 255) : rgba(180, 180, 180),
		);
	} else if (extraSubtree) {
		state.host.removeChild(state.targetRegion, extraSubtree);
		return undefined;
	} else {
		extraSubtree = createChildSubtree(state.host);
		state.host.insertBefore(state.targetRegion, extraSubtree);
	}
	return extraSubtree;
}

function assembleOps(
	state: Awaited<ReturnType<typeof setup>>,
	workload: Workload,
	inputMode: InputMode,
): { ops: Op[]; rootArraySlots: number } {
	let ops: Op[];
	if (inputMode === 'uncached-layout') {
		ops = withoutLayoutCache(() => [...layout(state.host.root)]);
	} else if (inputMode === 'materialized-array') {
		ops = materializeRegionOps(state.regions);
	} else if (inputMode === 'retained-snapshots') {
		const targetIndex = rows - 1;
		if (workload === 'text-batch') {
			for (let index = 0; index < changedRows; index++) {
				state.rootOps[index] = cachedRegionSnapshot(state.regions[index]!.node!);
			}
		} else {
			state.rootOps[targetIndex] = cachedRegionSnapshot(state.targetRegion.node!);
		}
		ops = state.rootOps;
	} else {
		ops = layout(state.host.root) as Op[];
	}
	return { ops, rootArraySlots: ops.length };
}

async function profileOneFrame(workload: Workload, inputMode: InputMode): Promise<LayoutProfile> {
	const state = await setup();
	mutate(state, workload, 0, undefined);
	return profileLayout(() => assembleOps(state, workload, inputMode)).profile;
}

function materializeRegionOps(regions: HostElement[]): Op[] {
	const ops: Op[] = [];
	for (const region of regions) {
		for (const op of layout(region.node!)) ops.push(op);
	}
	return ops;
}

async function setup(): Promise<{
	host: ReturnType<typeof createHost>;
	term: Term;
	regions: HostElement[];
	rootOps: Op[];
	literals: HostLiteral[];
	targetRegion: HostElement;
	targetText: HostElement;
	literal: HostLiteral;
}> {
	const term = await createTerm({ width, height });
	const host = createHost();
	LayoutApi.init(host.root);
	registerComponents(host, [Box, Text]);
	let targetRegion!: HostElement;
	let targetText!: HostElement;
	let literal!: HostLiteral;
	const regions: HostElement[] = [];
	const literals: HostLiteral[] = [];

	for (let index = 0; index < rows; index++) {
		const text = host.createElement('text', {}, `row ${index}`);
		const child = text.childNodes[0];
		if (child?.type === 'literal') literals.push(child);
		if (index === rows - 1) {
			targetRegion = host.createElement(
				'box',
				{
					layout: { width: fixed(width), height: fixed(1) },
					floating: { x: 0, y: index % height, attachTo: 'root' },
				},
				text,
			);
			targetText = text;
			if (child?.type === 'literal') literal = child;
		} else {
			regions.push(
				host.createElement(
					'box',
					{
						layout: { width: fixed(width), height: fixed(1) },
						floating: { x: 0, y: index % height, attachTo: 'root' },
					},
					text,
				),
			);
		}
	}
	regions.push(targetRegion);
	host.element.append(regions);
	const initialOps = layout(host.root) as Op[];
	const initial = term.render(initialOps);
	if (initial.errors.length > 0) {
		throw new RenderPipelineBenchmarkError(
			`TTY rejected benchmark tree: ${JSON.stringify(initial.errors)}`,
		);
	}
	const rootOps = regions.map((region) => cachedRegionSnapshot(region.node!));
	const cachedRootOps = layout(host.root) as Op[];
	const firstMismatch = rootOps.findIndex((operation, index) => operation !== cachedRootOps[index]);
	if (firstMismatch !== -1 || rootOps.length !== cachedRootOps.length) {
		throw new RenderPipelineBenchmarkError(
			`Root segments are not reusing layout snapshots (children ${host.element.children.length}, length ${rootOps.length}/${cachedRootOps.length}, first mismatch ${firstMismatch})`,
		);
	}
	term.render(rootOps);
	return { host, term, regions, rootOps, literals, targetRegion, targetText, literal };
}

function cachedRegionSnapshot(node: Node): Op {
	const operations = [...layout(node)];
	const operation = operations[0];
	if (operations.length === 1 && operation?.directive === 5) return operation;
	const cached = [...layout(node)];
	const snapshotOperation = cached[0];
	if (cached.length === 1 && snapshotOperation?.directive === 5) return snapshotOperation;
	return snapshot(operations);
}

function createChildSubtree(host: ReturnType<typeof createHost>): HostElement {
	return host.createElement(
		'box',
		{ layout: { direction: 'ltr' } },
		...Array.from({ length: 12 }, (_, index) => host.createElement('text', {}, `child ${index}`)),
	);
}

function percentile(values: number[], fraction: number): number {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0;
}

type Workload = 'text' | 'text-batch' | 'property' | 'children';
type InputMode = 'uncached-layout' | 'rebuilt-array' | 'materialized-array' | 'retained-snapshots';

interface Sample {
	name: string;
	mutationMedian: number;
	assemblyMedian: number;
	packMedian: number;
	ttyMedian: number;
	renderRemainderMedian: number;
	frameMedian: number;
	frameP95: number;
	layoutProfile: LayoutProfile;
	rootArraySlots: number;
	outputBytes: number;
}

class RenderPipelineBenchmarkError extends Error {
	readonly code = 'CLACK_RENDER_PIPELINE_BENCHMARK_FAILED';

	constructor(message: string) {
		super(message);
		this.name = 'RenderPipelineBenchmarkError';
	}
}
