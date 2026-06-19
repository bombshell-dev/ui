import {
	createTerm,
	createInput,
	text,
	open,
	close,
	rgba,
	type Op,
	settings,
	alternateBuffer,
	cursor,
	mouseTracking,
} from '@bomb.sh/tty';
import { type Operation, main, until, useScope, exit, suspend, ensure } from 'effection';

let { stdout, stdin } = process;
let write = (bytes: Uint8Array) => stdout.write(bytes);

await main(function* program(): Operation<void> {
	let w = stdout.columns ?? 80;
	let h = stdout.rows ?? 24;
	let term = yield* until(createTerm({ width: w, height: h }));
	let input = yield* until(createInput());
	let scope = yield* useScope();

	let setup = settings(alternateBuffer({ clear: true }), cursor(false), mouseTracking());
	write(setup.apply);
	if (stdin.isTTY) stdin.setRawMode(true);

	let counts = new Map<string, number>();
	let hoverX = -1;
	let hoverY = -1;

	let onResize = () => {
		let nw = stdout.columns ?? 80;
		let nh = stdout.rows ?? 24;
		if (nw !== w || nh !== h) {
			w = nw;
			h = nh;
			scope.run(function* () {
				term = yield* until(createTerm({ width: w, height: h }));
				render();
			});
		}
	};

	if (stdout.isTTY) stdout.on('resize', onResize);

	let render = () => {
		let ops: Op[] = [];
		ops.push(
			open('root', {
				layout: { width: { type: 'grow' }, height: { type: 'grow' }, direction: 'ttb', gap: 0 },
			}),
		);

		for (let y = 0; y < h; y++) {
			let line = '';
			for (let x = 0; x < w; x++) {
				line += String((counts.get(`${x},${y}`) ?? 0) % 10);
			}
			ops.push(text(line, { color: rgba(80, 140, 80) }));
		}
		ops.push(close());

		let result = term.render(ops, { mode: 'line' });
		write(result.output);
	};

	stdin.on('data', function onData(data: Buffer) {
		let result = input.scan(data);
		for (let event of result.events) {
			if (
				event.type === 'keydown' &&
				(event.code === 'Escape' || (event.ctrl && event.code === 'c'))
			) {
				scope.run(() => exit(0));
				return;
			}
			if (event.type === 'resize') {
				let nw = event.width;
				let nh = event.height;
				if (nw > 0 && nh > 0 && (nw !== w || nh !== h)) {
					w = nw;
					h = nh;
					scope.run(function* () {
						term = yield* until(createTerm({ width: w, height: h }));
						render();
					});
				}
				continue;
			}
			if (event.type === 'mousemove' || event.type === 'mousedown') {
				let mx = event.x;
				let my = event.y;
				if (mx > 0) mx -= 1;
				if (my > 0) my -= 1;
				if (mx >= 0 && mx < w && my >= 0 && my < h && (mx !== hoverX || my !== hoverY)) {
					hoverX = mx;
					hoverY = my;
					counts.set(`${hoverX},${hoverY}`, (counts.get(`${hoverX},${hoverY}`) ?? 0) + 1);
					render();
				}
			}
		}
		if (result.pending) {
			setTimeout(() => onData(Buffer.alloc(0)), result.pending.delay);
		}
	});

	yield* ensure(function* cleanup() {
		if (stdout.isTTY) stdout.off('resize', onResize);
		if (stdin.isTTY) stdin.setRawMode(false);
		write(setup.revert);
	});

	render();
	yield* suspend();
});
