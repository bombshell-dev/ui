import { createUI } from '@clack/ui';
import { createApp } from './app.ts';

const controller = new AbortController();
const ui = await createUI({
	height: 7,
	input: process.stdin,
	output: process.stdout,
	signal: controller.signal,
});

const stop = (): void => controller.abort();

try {
	ui.document.documentElement!.appendChild(createApp(ui.document));
	process.stdin.once('data', stop);
	process.stdin.once('end', stop);
	process.once('SIGINT', stop);
	process.stdin.resume();
	await ui.main();
} finally {
	controller.abort();
	process.stdin.off('data', stop);
	process.stdin.off('end', stop);
	process.off('SIGINT', stop);
	process.stdin.pause();
}
