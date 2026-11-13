import assert from 'node:assert/strict';

/** Props the scenario changes from outside the app between stages. */
export interface Props {
	items: string[];
	show: boolean;
	className: string;
	color: string;
	html: string;
	radius: number;
	/** Whether `#ping` has a click handler. */
	listen: boolean;
}

/**
 * Each framework renders the same app into `container`:
 *
 * ```html
 * <div id="app" class={className} style="color: {color}">
 *   <button id="inc" onclick={count++}>{count}</button>        <!-- count starts at 0 -->
 *   <button id="ping" onclick={listen ? pings++ : none}>{pings}</button> <!-- handler added and removed -->
 *   <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
 *   {show && <p id="cond">shown</p>}
 *   <div id="html" innerHTML={html}></div>
 *   <input id="text" value={text} oninput={text = value} />   <!-- two-way -->
 *   <span id="echo">{text}</span>
 *   <textarea id="area" value={area} oninput={area = value} /> <!-- two-way -->
 *   <span id="area-echo">{area}</span>
 *   <input id="check" type="checkbox" checked={checked} onchange={checked = target.checked} />
 *   <span id="check-echo">{checked ? 'on' : 'off'}</span>
 *   <select id="choice" value={choice} onchange={choice = value}>
 *     <option value="a">A</option><option value="b">B</option>
 *   </select>
 *   <span id="choice-echo">{choice}</span>                   <!-- choice starts at 'a' -->
 *   <svg><circle r={radius} /></svg>
 * </div>
 * ```
 */
export interface Driver {
	mount(container: HTMLElement, props: Props): Promise<App>;
}

export interface App {
	/** Re-render with new props; resolves once the DOM reflects them. */
	update(props: Props): Promise<void>;
	/** Resolves once framework state updates from DOM events have been committed. */
	flush(): Promise<void>;
	unmount(): Promise<void>;
}

const initial: Props = {
	items: ['a', 'b', 'c'],
	show: true,
	className: 'one',
	color: 'red',
	html: '<b>bold</b>',
	radius: 1,
	listen: true,
};

function $(container: HTMLElement, selector: string): HTMLElement {
	const found = container.querySelector<HTMLElement>(selector);
	assert.ok(found, `missing ${selector}`);
	return found;
}

function text(container: HTMLElement, selector: string): string {
	return $(container, selector).textContent ?? '';
}

/** User input changes the value beneath any instance accessor a framework installs (React's value tracker). */
function type(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
	Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')!.set!.call(input, value);
	input.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Mount, interact, update, and unmount; asserts the resulting DOM at each stage. */
export async function runScenario(driver: Driver, document: Document): Promise<void> {
	const container = document.createElement('div');
	document.body.appendChild(container);
	let props = { ...initial };
	const app = await driver.mount(container, props);
	const update = async (patch: Partial<Props>): Promise<void> => {
		props = { ...props, ...patch };
		await app.update(props);
	};

	assert.equal(text(container, '#inc'), '0');
	assert.deepEqual(
		[...container.querySelectorAll('li')].map((li) => li.textContent),
		['a', 'b', 'c'],
	);

	$(container, '#inc').click();
	$(container, '#inc').click();
	await app.flush();
	assert.equal(text(container, '#inc'), '2');

	$(container, '#ping').click();
	await app.flush();
	assert.equal(text(container, '#ping'), '1');
	await update({ listen: false });
	$(container, '#ping').click();
	await app.flush();
	assert.equal(text(container, '#ping'), '1', 'removed handler does not run');
	await update({ listen: true });
	$(container, '#ping').click();
	await app.flush();
	assert.equal(text(container, '#ping'), '2', 'restored handler runs');

	const [a, b, c] = [...container.querySelectorAll('li')];
	await update({ items: ['c', 'b', 'a'] });
	assert.deepEqual([...container.querySelectorAll('li')], [c, b, a], 'keyed reverse keeps nodes');
	await update({ items: ['c', 'x', 'b', 'a'] });
	await update({ items: ['x', 'a'] });
	assert.deepEqual(
		[...container.querySelectorAll('li')].map((li) => li.textContent),
		['x', 'a'],
	);
	assert.equal(container.querySelectorAll('li')[1], a);

	await update({ show: false });
	assert.equal(container.querySelector('#cond'), null);
	await update({ show: true });
	assert.equal(text(container, '#cond'), 'shown');

	await update({ className: 'two', color: 'blue' });
	assert.equal($(container, '#app').className, 'two');
	assert.equal($(container, '#app').style.color, 'blue');

	await update({ html: '<i>italic</i>' });
	assert.equal($(container, '#html').innerHTML, '<i>italic</i>');

	type($(container, '#text') as HTMLInputElement, 'hello');
	await app.flush();
	assert.equal(text(container, '#echo'), 'hello');

	type($(container, '#area') as HTMLTextAreaElement, 'multi\nline');
	await app.flush();
	assert.equal(text(container, '#area-echo'), 'multi\nline');

	$(container, '#check').click();
	await app.flush();
	assert.equal(text(container, '#check-echo'), 'on');
	assert.equal(($(container, '#check') as HTMLInputElement).checked, true);

	const select = $(container, '#choice') as HTMLSelectElement;
	select.value = 'b';
	select.dispatchEvent(new Event('change', { bubbles: true }));
	await app.flush();
	assert.equal(text(container, '#choice-echo'), 'b');

	await update({ radius: 5 });
	assert.equal($(container, 'circle').getAttribute('r'), '5');

	$(container, '#text').focus();
	assert.equal(document.activeElement, $(container, '#text'));

	await app.unmount();
	// Some frameworks leave empty anchor text nodes or comments behind.
	assert.equal(container.children.length, 0, 'unmount removes rendered elements');
	assert.equal(container.textContent, '', 'unmount removes rendered text');
	container.remove();
}
