import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { features, frameworks, type DOMFeature, type Framework } from '@bomb.sh/web-platform-tests';

/**
 * Members frameworks are recorded touching that deliberately have no feature profile entry.
 * Each needs a reason; anything else unmapped fails the audit.
 */
const untracked: Readonly<Record<string, string>> = {};

/** Solid and Svelte resolve their server builds without the browser condition. */
const conditions: Partial<Record<Framework, string[]>> = {
	solid: ['--conditions=browser'],
	svelte: ['--conditions=browser'],
};

interface Recording {
	framework: Framework;
	version: string;
	/** `Owner#member access` → count. */
	members: Record<string, number>;
}

interface Report {
	framework: Framework;
	version: string;
	/** Observed features absent from the framework's profile. */
	missing: DOMFeature[];
	/** Observed members with no feature and no `untracked` reason. */
	unmapped: string[];
	/** Required features the scenario never observed (informational). */
	unobserved: DOMFeature[];
}

const byMember = new Map<string, DOMFeature[]>();
for (const name of Object.keys(features) as DOMFeature[]) {
	const member = name.includes('#') ? name.slice(name.indexOf('#') + 1) : name;
	byMember.set(member, [...(byMember.get(member) ?? []), name]);
}

/** Owners differ between happy-dom prototypes and spec mixins; the interface name only breaks ties. */
function featureFor(owner: string, member: string): DOMFeature | undefined {
	const candidates = byMember.get(member) ?? [];
	if (candidates.length === 1) return candidates[0];
	const match = candidates.find((name) => name.startsWith(`${owner}#`));
	// Event object fields fall under the event model unless a member has its own feature.
	return match ?? (owner.endsWith('Event') ? 'Event' : undefined);
}

function record(framework: Framework): Recording {
	const run = fileURLToPath(new URL('run.ts', import.meta.url));
	const output = execFileSync(
		process.execPath,
		[...(conditions[framework] ?? []), run, framework],
		{
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'inherit'],
		},
	);
	return JSON.parse(output.trim().split('\n').at(-1)!) as Recording;
}

function audit({ framework, version, members }: Recording): Report {
	const { required, optional } = frameworks[framework];
	const profile = new Set<DOMFeature>([...required, ...Object.values(optional).flat()]);
	const observed = new Set<DOMFeature>();
	const unmapped = new Set<string>();
	for (const entry of Object.keys(members)) {
		const qualified = entry.slice(0, entry.indexOf(' '));
		const [owner, member] = qualified.split('#') as [string, string];
		const feature = featureFor(owner, member);
		if (feature) observed.add(feature);
		else if (!(qualified in untracked)) unmapped.add(qualified);
	}
	return {
		framework,
		version,
		missing: [...observed].filter((name) => !profile.has(name)),
		unmapped: [...unmapped],
		unobserved: [...new Set(required)].filter((name) => !observed.has(name)),
	};
}

const named = process.argv.slice(2).filter((arg) => !arg.startsWith('-')) as Framework[];
const selected = named.length ? named : (Object.keys(frameworks) as Framework[]);
const reports = selected.map((framework) => audit(record(framework)));

function summary(report: Report): string {
	const status = report.missing.length || report.unmapped.length ? 'drift' : 'ok';
	const lines = [`${report.framework}@${report.version}: ${status}`];
	if (report.missing.length) lines.push(`  missing from profile: ${report.missing.join(', ')}`);
	if (report.unmapped.length) lines.push(`  no feature: ${report.unmapped.join(', ')}`);
	if (report.unobserved.length)
		lines.push(`  not observed (info): ${report.unobserved.join(', ')}`);
	return lines.join('\n');
}

process.stdout.write(
	process.argv.includes('--json')
		? `${JSON.stringify(reports, null, '\t')}\n`
		: `${reports.map(summary).join('\n\n')}\n`,
);

if (reports.some((report) => report.missing.length || report.unmapped.length)) process.exitCode = 1;
