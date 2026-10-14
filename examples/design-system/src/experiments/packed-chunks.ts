import { createTerm, pack, snapshot, text, type Op } from '@bomb.sh/tty';

const itemCount = Number(process.env.PACKED_BENCH_ITEMS ?? 1000);
const chunkSize = Number(process.env.PACKED_BENCH_CHUNK_SIZE ?? 10);
const warmups = Number(process.env.PACKED_BENCH_WARMUPS ?? 20);
const frames = Number(process.env.PACKED_BENCH_FRAMES ?? 100);
const modes: Mode[] = ['raw-array', 'snapshot-array'];
const scenarios: Scenario[] = ['unchanged', 'one-chunk-changed', 'all-changed'];

class PackedChunkBenchmarkError extends Error {
	readonly code = 'CLACK_PACKED_CHUNK_BENCHMARK_FAILED';

	constructor(message: string) {
		super(message);
		this.name = 'PackedChunkBenchmarkError';
	}
}

process.stdout.write(
	`Packed chunk benchmark (${itemCount} text ops, ${chunkSize} ops/chunk, ${frames} frames)\n`,
);

for (const scenario of scenarios) {
	const results: Result[] = [];
	for (const mode of modes) results.push(await measure(mode, scenario));
	const reference = results[0]!;
	for (const result of results.slice(1)) {
		if (
			!equalBytes(reference.packed, result.packed) ||
			!equalBytes(reference.output, result.output)
		) {
			throw new PackedChunkBenchmarkError(
				`${scenario}: ${result.mode} did not produce the same packed input and output`,
			);
		}
	}
	for (const result of results) {
		process.stdout.write(
			`${scenario} / ${result.mode}: snapshot refresh ${result.snapshotMedian.toFixed(3)} ms, ` +
				`pack ${result.packMedian.toFixed(3)} ms, tty.render ${result.renderMedian.toFixed(3)} ms, ` +
				`${result.packed.length} packed bytes, ${result.output.length} output bytes\n`,
		);
	}
}

async function measure(mode: Mode, scenario: Scenario): Promise<Result> {
	const texts = Array.from({ length: itemCount }, (_, index) => text(itemContent(index, 0)));
	const groups = chunk(texts, chunkSize);
	const snapshots = groups.map((group) => snapshot(group));
	const term = await createTerm({ width: 80, height: 24 });
	const packedBuffer = new ArrayBuffer(8 * 1024 * 1024);
	const snapshotTimes: number[] = [];
	const packTimes: number[] = [];
	const renderTimes: number[] = [];
	let packedBytes = new Uint8Array();
	let output = new Uint8Array();

	for (let frame = 0; frame < warmups + frames; frame++) {
		const changedGroups = getChangedGroups({ scenario, frame, groupCount: groups.length });
		for (const groupIndex of changedGroups) {
			const start = groupIndex * chunkSize;
			const end = Math.min(start + chunkSize, texts.length);
			for (let index = start; index < end; index++) {
				texts[index]!.content = itemContent(index, frame + 1);
			}
		}

		const snapshotStart = performance.now();
		if (mode !== 'raw-array') {
			for (const groupIndex of changedGroups) {
				snapshots[groupIndex] = snapshot(groups[groupIndex]!);
			}
		}
		const snapshotTime = performance.now() - snapshotStart;

		const ops: Op[] = mode === 'raw-array' ? texts : snapshots;
		const packStart = performance.now();
		const packedWords = pack(ops, packedBuffer, 0);
		const packTime = performance.now() - packStart;
		const renderStart = performance.now();
		const result = term.render(ops);
		const renderTime = performance.now() - renderStart;
		if (result.errors.length > 0) {
			throw new PackedChunkBenchmarkError(`${scenario}/${mode}: ${JSON.stringify(result.errors)}`);
		}
		if (frame >= warmups) {
			snapshotTimes.push(snapshotTime);
			packTimes.push(packTime);
			renderTimes.push(renderTime);
		}
		packedBytes = new Uint8Array(packedBuffer, 0, packedWords * 4).slice();
		output = result.output.slice();
	}

	return {
		mode,
		snapshotMedian: percentile(snapshotTimes, 0.5),
		packMedian: percentile(packTimes, 0.5),
		renderMedian: percentile(renderTimes, 0.5),
		packed: packedBytes,
		output,
	};
}

function getChangedGroups({
	scenario,
	frame,
	groupCount,
}: {
	scenario: Scenario;
	frame: number;
	groupCount: number;
}): number[] {
	if (scenario === 'unchanged') return [];
	if (scenario === 'one-chunk-changed') return [frame % groupCount];
	return Array.from({ length: groupCount }, (_, index) => index);
}

function chunk<T>(items: T[], size: number): T[][] {
	const result: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		result.push(items.slice(index, index + size));
	}
	return result;
}

function itemContent(index: number, frame: number): string {
	return `item-${String(index).padStart(4, '0')}-frame-${String(frame % 1000).padStart(3, '0')}`;
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}

function percentile(values: number[], fraction: number): number {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))] ?? 0;
}

type Mode = 'raw-array' | 'snapshot-array';
type Scenario = 'unchanged' | 'one-chunk-changed' | 'all-changed';

interface Result {
	mode: Mode;
	snapshotMedian: number;
	packMedian: number;
	renderMedian: number;
	packed: Uint8Array;
	output: Uint8Array;
}
