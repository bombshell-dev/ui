import process from 'node:process';
import type { Platform, Size } from '../platform.ts';
import type { UIOptions } from '../ui.ts';

/** Signals that stop a UI when the caller didn't pass its own `signal`. */
const interrupts: readonly NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

/** Bind a UI to a Node-compatible process: Node, Bun, or Deno. */
export function createNodePlatform(options: UIOptions): Platform {
	const output: UIOptions['output'] & { columns?: number; rows?: number } =
		options.output ?? process.stdout;
	const signals = options.signal ? [] : interrupts;

	const size = (): Size => ({
		width: options.width ?? output.columns ?? 80,
		height: options.height ?? output.rows ?? 24,
	});

	return {
		size,
		write(bytes) {
			const result = Promise.withResolvers<void>();
			output.write(bytes, (error) => (error ? result.reject(error) : result.resolve()));
			return result.promise;
		},
		listen(events, signal) {
			const resize = (): void => events.resize(size());
			const interrupt = (): void => events.interrupt();

			output.on('resize', resize);
			for (const name of signals) process.on(name, interrupt);
			// Signal listeners don't keep Node's event loop alive; the UI should until it stops.
			const alive = setInterval(() => {}, 2 ** 30);

			signal.addEventListener(
				'abort',
				() => {
					clearInterval(alive);
					output.off('resize', resize);
					for (const name of signals) process.off(name, interrupt);
				},
				{ once: true },
			);
		},
	};
}
