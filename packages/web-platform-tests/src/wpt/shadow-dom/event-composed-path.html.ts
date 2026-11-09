import type { CompatibilityContext } from '../../shared/context.ts';
import { createTestTree } from './resources/shadow-dom.js.ts';

export function register(context: CompatibilityContext): void {
	const { expect } = context.runner;
	type EventPath = [string, string, string | null, string[], string?];
	function dispatchEventWithLog(
		nodes: Record<string, Node>,
		target: Node,
		event: Event,
		options?: { capture: boolean },
	) {
		function labelFor(e: EventTarget | null) {
			return (e as Element).id || (e as Element).tagName;
		}

		let log: EventPath[] = [];
		let attachedNodes: Node[] = [];
		for (let label in nodes) {
			let startingNode = nodes[label]!;
			for (let node: Node | null = startingNode; node; node = node.parentNode) {
				if (attachedNodes.indexOf(node) >= 0) continue;
				let id = (node as Element).id;
				if (!id) continue;
				attachedNodes.push(node);
				if (options && options.capture) {
					// Record [currentTarget, target, relatedTarget, composedPath(), 'capture' | 'non-capture']
					// TODO: Support registering listeners in different orders.
					// e.g. Register a non-capture listener at first, then register a capture listener.
					node.addEventListener(
						event.type,
						(e) => {
							log.push([
								id,
								labelFor(e.target),
								(e as MouseEvent).relatedTarget ? labelFor((e as MouseEvent).relatedTarget) : null,
								e.composedPath().map((n) => {
									return labelFor(n);
								}),
								'capture',
							]);
						},
						true,
					);
					node.addEventListener(event.type, (e) => {
						log.push([
							id,
							labelFor(e.target),
							(e as MouseEvent).relatedTarget ? labelFor((e as MouseEvent).relatedTarget) : null,
							e.composedPath().map((n) => {
								return labelFor(n);
							}),
							'non-capture',
						]);
					});
				} else {
					// Record [currentTarget, target, relatedTarget, composedPath()]
					node.addEventListener(event.type, (e) => {
						log.push([
							id,
							labelFor(e.target),
							(e as MouseEvent).relatedTarget ? labelFor((e as MouseEvent).relatedTarget) : null,
							e.composedPath().map((n) => {
								return labelFor(n);
							}),
						]);
					});
				}
			}
		}
		target.dispatchEvent(event);
		return log;
	}
	function assert_event_path_equals(actual: EventPath[], expected: EventPath[]) {
		expect(actual.length).toBe(expected.length);
		for (let i = 0; i < actual.length; ++i) {
			expect(actual[i]!.length).toBe(expected[i]!.length);
			expect(actual[i]![0], 'currentTarget at ' + i + ' should be same').toBe(expected[i]![0]);
			expect(actual[i]![1], 'target at ' + i + ' should be same').toBe(expected[i]![1]);
			expect(actual[i]![2], 'relatedTarget at ' + i + ' should be same').toBe(expected[i]![2]);
			{
				const actualPath = actual[i]![3];
				const expectedPath = expected[i]![3];
				expect(actualPath.length, 'composedPath at ' + i + ' should be same').toBe(
					expectedPath.length,
				);
				for (let index = 0; index < expectedPath.length; index++)
					expect(actualPath[index], 'composedPath at ' + i + ' should be same').toBe(
						expectedPath[index],
					);
			}
			if (actual[i]![4]) {
				expect(actual[i]![4], 'listener type should be same at ' + i).toBe(expected[i]![4]);
			}
		}
	}
	context.test('Event Path without ShadowRoots.', ({ document, Event }) => {
		document.body.innerHTML =
			'<div id="test1">\n  <div id="d1">\n    <div id="target"></div>\n  </div>\n</div>';

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test1')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'd1', 'test1'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['d1', 'target', null, path],
			['test1', 'target', null, path],
		]);
	});
	context.test('Event Path with an open ShadowRoot.', ({ document, Event }) => {
		document.body.innerHTML =
			'<div id="test2">\n  <div id="host">\n    <template id="sr" data-mode="open">\n      <div id="target"></div>\n    </template>\n  </div>\n</div>';

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test2')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'sr', 'host', 'test2'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['sr', 'target', null, path],
			['host', 'host', null, path],
			['test2', 'host', null, path],
		]);
	});
	context.test('Event Path with a closed ShadowRoot.', ({ document, Event }) => {
		document.body.innerHTML =
			'<div id="test3">\n  <div id="host">\n    <template id="sr" data-mode="closed">\n      <div id="target"></div>\n    </template>\n  </div>\n</div>';

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test3')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'sr', 'host', 'test3'];
		let path1 = ['host', 'test3'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['sr', 'target', null, path],
			['host', 'host', null, path1],
			['test3', 'host', null, path1],
		]);
	});
	context.test('Event Path with nested ShadowRoots: open > open.', ({ document, Event }) => {
		document.body.innerHTML = `<div id="test4">
  <div id="host1">
    <template id="sr1" data-mode="open">
      <div id="host2">
        <template id="sr2" data-mode="open">
          <div id="target"></div>
        </template>
      </div>
    </template>
  </div>
</div>`;

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test4')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'sr2', 'host2', 'sr1', 'host1', 'test4'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['sr2', 'target', null, path],
			['host2', 'host2', null, path],
			['sr1', 'host2', null, path],
			['host1', 'host1', null, path],
			['test4', 'host1', null, path],
		]);
	});
	context.test('Event Path with nested ShadowRoots: open > closed.', ({ document, Event }) => {
		document.body.innerHTML = `<div id="test5">
  <div id="host1">
    <template id="sr1" data-mode="open">
      <div id="host2">
        <template id="sr2" data-mode="closed">
          <div id="target"></div>
        </template>
      </div>
    </template>
  </div>
</div>`;

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test5')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'sr2', 'host2', 'sr1', 'host1', 'test5'];
		let path1 = ['host2', 'sr1', 'host1', 'test5'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['sr2', 'target', null, path],
			['host2', 'host2', null, path1],
			['sr1', 'host2', null, path1],
			['host1', 'host1', null, path1],
			['test5', 'host1', null, path1],
		]);
	});
	context.test('Event Path with nested ShadowRoots: closed > open.', ({ document, Event }) => {
		document.body.innerHTML = `<div id="test6">
  <div id="host1">
    <template id="sr1" data-mode="closed">
      <div id="host2">
        <template id="sr2" data-mode="open">
          <div id="target"></div>
        </template>
      </div>
    </template>
  </div>
</div>`;

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test6')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'sr2', 'host2', 'sr1', 'host1', 'test6'];
		let path1 = ['host1', 'test6'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['sr2', 'target', null, path],
			['host2', 'host2', null, path],
			['sr1', 'host2', null, path],
			['host1', 'host1', null, path1],
			['test6', 'host1', null, path1],
		]);
	});
	context.test('Event Path with nested ShadowRoots: closed > closed.', ({ document, Event }) => {
		document.body.innerHTML = `<div id="test7">
  <div id="host1">
    <template id="sr1" data-mode="closed">
      <div id="host2">
        <template id="sr2" data-mode="closed">
          <div id="target"></div>
        </template>
      </div>
    </template>
  </div>
</div>`;

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test7')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'sr2', 'host2', 'sr1', 'host1', 'test7'];
		let path1 = ['host2', 'sr1', 'host1', 'test7'];
		let path2 = ['host1', 'test7'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['sr2', 'target', null, path],
			['host2', 'host2', null, path1],
			['sr1', 'host2', null, path1],
			['host1', 'host1', null, path2],
			['test7', 'host1', null, path2],
		]);
	});
	context.test('Event Path with a slot in an open Shadow Root.', ({ document, Event }) => {
		document.body.innerHTML =
			'<div id="test8">\n  <div id="host1">\n    <template id="sr1" data-mode="open">\n      <slot id="slot"></slot>\n    </template>\n    <div id="target"></div>\n  </div>\n</div>';

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test8')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'slot', 'sr1', 'host1', 'test8'];
		assert_event_path_equals(log, [
			['target', 'target', null, path],
			['slot', 'target', null, path],
			['sr1', 'target', null, path],
			['host1', 'target', null, path],
			['test8', 'target', null, path],
		]);
	});
	context.test('Event Path with a slot in a closed Shadow Root.', ({ document, Event }) => {
		document.body.innerHTML =
			'<div id="test9">\n  <div id="host1">\n    <template id="sr1" data-mode="closed">\n      <slot id="slot"></slot>\n    </template>\n    <div id="target"></div>\n  </div>\n</div>';

		let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test9')!);
		let log = dispatchEventWithLog(
			n,
			n.target,
			new Event('my-event', { bubbles: true, composed: true }),
		);
		let path = ['target', 'slot', 'sr1', 'host1', 'test9'];
		let path1 = ['target', 'host1', 'test9'];
		assert_event_path_equals(log, [
			['target', 'target', null, path1],
			['slot', 'target', null, path],
			['sr1', 'target', null, path],
			['host1', 'target', null, path1],
			['test9', 'target', null, path1],
		]);
	});
	context.test(
		'Event Path with slots in nested ShadowRoots: open > open.',
		({ document, Event }) => {
			document.body.innerHTML = `<div id="test10">
  <div id="host1">
    <template id="sr1" data-mode="open">
      <div id="host2">
        <template id="sr2" data-mode="open">
          <slot id="slot2"></slot>
        </template>
        <slot id="slot1"></slot>
      </div>
    </template>
    <div id="target"></div>
  </div>
</div>`;

			let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test10')!);
			let log = dispatchEventWithLog(
				n,
				n.target,
				new Event('my-event', { bubbles: true, composed: true }),
			);
			let path = ['target', 'slot1', 'slot2', 'sr2', 'host2', 'sr1', 'host1', 'test10'];
			assert_event_path_equals(log, [
				['target', 'target', null, path],
				['slot1', 'target', null, path],
				['slot2', 'target', null, path],
				['sr2', 'target', null, path],
				['host2', 'target', null, path],
				['sr1', 'target', null, path],
				['host1', 'target', null, path],
				['test10', 'target', null, path],
			]);
		},
	);
	context.test(
		'Event Path with slots in nested ShadowRoots: closed > closed.',
		({ document, Event }) => {
			document.body.innerHTML = `<div id="test11">
  <div id="host1">
    <template id="sr1" data-mode="closed">
      <div id="host2">
        <template id="sr2" data-mode="closed">
          <slot id="slot2"></slot>
        </template>
        <slot id="slot1"></slot>
      </div>
    </template>
    <div id="target"></div>
  </div>
</div>`;

			let n = createTestTree<{ target: HTMLElement }>(document, document.getElementById('test11')!);
			let log = dispatchEventWithLog(
				n,
				n.target,
				new Event('my-event', { bubbles: true, composed: true }),
			);
			let path = ['target', 'slot1', 'slot2', 'sr2', 'host2', 'sr1', 'host1', 'test11'];
			let path1 = ['target', 'slot1', 'host2', 'sr1', 'host1', 'test11'];
			let path2 = ['target', 'host1', 'test11'];
			assert_event_path_equals(log, [
				['target', 'target', null, path2],
				['slot1', 'target', null, path1],
				['slot2', 'target', null, path],
				['sr2', 'target', null, path],
				['host2', 'target', null, path1],
				['sr1', 'target', null, path1],
				['host1', 'target', null, path2],
				['test11', 'target', null, path2],
			]);
		},
	);
}
