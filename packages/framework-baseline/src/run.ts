import { createRequire } from 'node:module';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

/** Records one framework's DOM usage; prints `{ framework, version, members }` as JSON. */
const framework = process.argv[2];
if (!framework) {
	process.stderr.write('usage: node src/run.ts <framework>\n');
	process.exit(2);
}

// Record what ships: development builds add warning-only DOM reads.
process.env.NODE_ENV = 'production';
// Frameworks read the environment at module evaluation, so globals precede their import.
GlobalRegistrator.register({ url: 'http://localhost/' });
const { instrumentDocument, recorded } = await import('./recorder.ts');
instrumentDocument(document);
const { driver } = await import(`./drivers/${framework}.ts`);
const { runScenario } = await import('./scenario.ts');
await runScenario(driver, document);

const { version } = createRequire(import.meta.url)(
	`${framework === 'solid' ? 'solid-js' : framework}/package.json`,
);
const members = Object.fromEntries([...recorded].toSorted(([a], [b]) => a.localeCompare(b)));
// Exit rather than unregister: framework schedulers may still fire against the window.
process.stdout.write(`${JSON.stringify({ framework, version, members })}\n`, () => process.exit(0));
