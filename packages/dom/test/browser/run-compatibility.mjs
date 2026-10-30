// Development-only Playwright runner for the shared compatibility suite.
// Usage: node test/browser/run-compatibility.mjs [--input-only] [--no-input]
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

class BrowserAutomationError extends Error {
	constructor(message, details = {}) {
		super(message);
		this.name = 'BrowserAutomationError';
		this.details = details;
	}
}

const args = new Set(process.argv.slice(2));
for (const arg of args) {
	if (!['--input-only', '--no-input'].includes(arg))
		throw new BrowserAutomationError(`Unknown argument: ${arg}`);
}
if (args.has('--input-only') && args.has('--no-input'))
	throw new BrowserAutomationError('--input-only and --no-input cannot be combined');

function inputSession(page) {
	const heldKeys = new Set();
	const heldButtons = new Set();
	const buttonNames = ['left', 'middle', 'right'];
	async function keyDown(key) {
		// Track before awaiting so reset also attempts release after an input failure.
		heldKeys.add(key);
		await page.keyboard.down(key);
	}
	async function keyUp(key) {
		await page.keyboard.up(key);
		heldKeys.delete(key);
	}
	async function mouseDown(button) {
		heldButtons.add(button);
		await page.mouse.down({ button });
	}
	async function mouseUp(button) {
		await page.mouse.up({ button });
		heldButtons.delete(button);
	}
	return async (command) => {
		switch (command.type) {
			case 'keyDown':
				return keyDown(command.key);
			case 'keyUp':
				return keyUp(command.key);
			case 'insertText':
				return page.keyboard.insertText(command.text);
			case 'move':
				return page.mouse.move(command.x, command.y);
			case 'down':
			case 'up': {
				const button = buttonNames[command.button];
				if (!button) throw new BrowserAutomationError('Invalid mouse button', { command });
				return command.type === 'down' ? mouseDown(button) : mouseUp(button);
			}
			case 'reset': {
				const failures = [];
				async function release(operation) {
					try {
						await operation();
					} catch (error) {
						failures.push(error);
					}
				}
				for (const button of heldButtons) await release(() => mouseUp(button));
				for (const key of [...heldKeys].toReversed()) await release(() => keyUp(key));
				await release(() => page.mouse.move(1200, 800));
				if (failures.length)
					throw new BrowserAutomationError('Could not release all browser input', { failures });
				return;
			}
			default:
				throw new BrowserAutomationError(`Unknown input command: ${command.type}`);
		}
	};
}

let server;
let browser;
let context;
try {
	server = await createServer({
		configFile: fileURLToPath(new URL('./vite.config.mjs', import.meta.url)),
		server: { host: '127.0.0.1', open: false, hmr: false },
		logLevel: 'error',
	});
	await server.listen();
	browser = await chromium.launch({
		headless: true,
		...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),
	});
	context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
	const page = await context.newPage();
	await page.bringToFront();
	if (!args.has('--no-input')) {
		const sendInput = inputSession(page);
		let queue = Promise.resolve();
		await page.exposeBinding('__domInput', (_source, command) => {
			const operation = queue.then(() => sendInput(command));
			// A rejected operation must not prevent subsequent cleanup commands.
			queue = operation.catch(() => {});
			return operation;
		});
	}
	const url = new URL('compatibility.html', server.resolvedUrls.local[0]);
	if (!args.has('--no-input')) url.searchParams.set('input', 'playwright');
	if (args.has('--input-only')) url.searchParams.set('input-only', '');
	await page.goto(url.href);
	try {
		await page.waitForFunction(
			() => document.documentElement.dataset.complete === 'true',
			undefined,
			{ timeout: 120_000 },
		);
	} catch (cause) {
		const report = await page.locator('#results').textContent();
		throw new BrowserAutomationError(`Browser suite timed out. Last report: ${report}`, { cause });
	}
	const summary = JSON.parse(await page.locator('#results').textContent());
	process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
	if (summary.failed || summary.aborted || summary.notRun || !summary.results.length)
		process.exitCode = 1;
} finally {
	// Closing the context also terminates pending input after a case timeout.
	try {
		await context?.close();
	} finally {
		try {
			await browser?.close();
		} finally {
			await server?.close();
		}
	}
}
