import { parentPort, workerData } from 'node:worker_threads';
import { loadConfigFromFile } from 'vite';
import type { WPTConfig } from '../config.ts';
import type { WPTWorkerData } from './isolated.ts';
import { runWPTFile } from './run.ts';

class WPTWorkerError extends Error {}

const { file, sourceRoot, configFile, deadline } = workerData as WPTWorkerData;
// Import the consumer here so its functions and native errors belong to this realm.
const loaded = await loadConfigFromFile({ command: 'serve', mode: 'test' }, configFile);
if (!loaded) {
	throw new WPTWorkerError(`Unable to load WPT configuration ${configFile}`);
}
const config = loaded.config as unknown as WPTConfig;
// oxlint-disable-next-line unicorn/require-post-message-target-origin -- Node worker ports have no origin.
parentPort!.postMessage(await runWPTFile({ file, sourceRoot, config, deadline }));
