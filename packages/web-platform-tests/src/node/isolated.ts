import { clearTimeout, setTimeout } from 'node:timers';
import { Worker } from 'node:worker_threads';
import type { WPTFileResult } from './run.ts';

interface WPTFileRequest {
	file: string;
	sourceRoot: string;
	configFile: string;
}

export interface WPTWorkerData extends WPTFileRequest {
	deadline: number;
}

/** Give each source file a fresh realm for both its implementation and scripts. */
export async function runWPTFile({
	file,
	sourceRoot,
	configFile,
	timeout = 15_000,
}: WPTFileRequest & { timeout?: number }): Promise<WPTFileResult> {
	const deadline = Date.now() + timeout;
	const worker = new Worker(new URL('./worker.mjs', import.meta.url), {
		workerData: { file, sourceRoot, configFile, deadline } satisfies WPTWorkerData,
	});
	const completion = Promise.withResolvers<WPTFileResult>();
	// Let an ordinary upstream timeout report its subtests before terminating a blocked worker.
	const watchdog = setTimeout(
		() => {
			completion.resolve({
				tests: [],
				status: {
					status: 2,
					message: `WPT worker did not complete within ${timeout}ms: ${file}`,
				},
			});
		},
		Math.max(1, deadline - Date.now()) + 250,
	);
	worker.once('message', (result: WPTFileResult) => completion.resolve(result));
	worker.once('error', (error) => {
		completion.resolve({
			tests: [],
			status: { status: 1, message: error.message, stack: error.stack },
		});
	});
	worker.once('exit', (code) => {
		completion.resolve({
			tests: [],
			status: { status: 1, message: `WPT worker exited without results (code ${code})` },
		});
	});
	try {
		return await completion.promise;
	} finally {
		clearTimeout(watchdog);
		await worker.terminate();
	}
}
