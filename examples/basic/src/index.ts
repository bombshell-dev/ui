import { createUI } from '@clack/ui';
import { createApp } from './app.ts';

const ui = await createUI({
	height: 7,
	input: process.stdin,
	output: process.stdout,
});

const { promise: stopped, resolve: stop } = Promise.withResolvers<void>();

try {
	ui.document.documentElement.appendChild(createApp(ui.document));
	process.stdin.once('data', stop);
	process.stdin.once('end', stop);
	process.once('SIGINT', stop);
	process.stdin.resume();
	await Promise.race([ui.main(), stopped]);
} finally {
	process.stdin.off('data', stop);
	process.stdin.off('end', stop);
	process.off('SIGINT', stop);
	process.stdin.pause();
	await ui[Symbol.asyncDispose]();
}
