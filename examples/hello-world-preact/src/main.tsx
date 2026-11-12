import { createUI } from '@clack/ui';
import { render } from 'preact';
import { Greeting } from './greeting.tsx';

const controller = new AbortController();
const stop = () => controller.abort();
process.once('SIGINT', stop);
process.once('SIGTERM', stop);

try {
	const ui = await createUI({
		signal: controller.signal,
		input: process.stdin,
		output: process.stdout,
		width: process.stdout.columns ?? 80,
		height: process.stdout.rows ?? 24,
	});

	// A root can be mounted on any Clack element, not just the document root.
	const mount = ui.document.createElement('div');
	ui.document.documentElement!.appendChild(mount);
	try {
		render(<Greeting />, mount);
		await ui.main();
	} finally {
		render(null, mount);
	}
} finally {
	controller.abort();
	process.off('SIGINT', stop);
	process.off('SIGTERM', stop);
}
