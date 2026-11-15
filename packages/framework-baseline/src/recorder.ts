import { fileURLToPath } from 'node:url';

/** Packages whose stack frames count as framework code. */
const FRAMEWORK_FRAME =
	/\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(?:react-dom|react|scheduler|preact|vue|@vue\/[^/]+|solid-js|svelte)\//;
/** Svelte components compile into this directory; their frames are framework output too. */
export const COMPILED_DIR = fileURLToPath(new URL('../.compiled/', import.meta.url));
const SELF = fileURLToPath(import.meta.url);

type Access = 'get' | 'set' | 'call';

/** `Interface#member` accesses made directly by framework code, with counts. */
export const recorded = new Map<string, number>();

function frameworkCaller(): boolean {
	const limit = Error.stackTraceLimit;
	Error.stackTraceLimit = 8;
	const stack = new Error().stack ?? '';
	Error.stackTraceLimit = limit;
	for (const line of stack.split('\n').slice(1)) {
		if (line.includes(SELF)) continue;
		// The first non-recorder frame is the direct caller; happy-dom internals and driver code are ignored.
		return FRAMEWORK_FRAME.test(line) || line.includes(COMPILED_DIR);
	}
	return false;
}

function record(member: string, access: Access): void {
	if (!frameworkCaller()) return;
	const entry = `${member} ${access}`;
	recorded.set(entry, (recorded.get(entry) ?? 0) + 1);
}

const patched = new WeakSet<object>();

/** Wrap every own accessor and method on each prototype in the object's chain. */
export function instrument(target: object): void {
	for (
		let proto = Object.getPrototypeOf(target);
		proto && proto !== Object.prototype;
		proto = Object.getPrototypeOf(proto)
	) {
		if (patched.has(proto)) continue;
		patched.add(proto);
		const owner: string = proto.constructor?.name || 'Anonymous';
		for (const key of Object.getOwnPropertyNames(proto)) {
			if (key === 'constructor') continue;
			const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;
			if (!descriptor.configurable) continue;
			if (descriptor.get || descriptor.set) {
				const { get, set } = descriptor;
				Object.defineProperty(proto, key, {
					...descriptor,
					get:
						get &&
						function (this: unknown) {
							record(`${owner}#${key}`, 'get');
							return get.call(this);
						},
					set:
						set &&
						function (this: unknown, value: unknown) {
							record(`${owner}#${key}`, 'set');
							set.call(this, value);
						},
				});
			} else if (typeof descriptor.value === 'function') {
				const method = descriptor.value as (...args: unknown[]) => unknown;
				Object.defineProperty(proto, key, {
					...descriptor,
					value: function (this: unknown, ...args: unknown[]) {
						record(`${owner}#${key}`, 'call');
						return method.apply(this, args);
					},
				});
			}
		}
	}
}

/** Instrument the prototype chains of every node and helper type frameworks reach. */
export function instrumentDocument(document: Document): void {
	const window = document.defaultView!;
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const samples: object[] = [
		document,
		document.createDocumentFragment(),
		document.createTextNode(''),
		document.createComment(''),
		svg,
		document.createElementNS('http://www.w3.org/2000/svg', 'circle'),
		document.createElement('div').style,
		document.createElement('div').classList,
		document.createElement('div').attributes,
		document.createElement('div').childNodes,
		document.createElement('div').children,
		new window.MutationObserver(() => {}),
		new window.Event('x'),
		new window.MouseEvent('x'),
		new window.KeyboardEvent('x'),
		new window.InputEvent('x'),
		new window.FocusEvent('x'),
	];
	for (const tag of [
		'div',
		'span',
		'button',
		'input',
		'textarea',
		'select',
		'option',
		'template',
		'ul',
		'li',
		'p',
		'a',
		'label',
		'form',
		'style',
		'head',
	])
		samples.push(document.createElement(tag));
	for (const sample of samples) instrument(sample);
}
