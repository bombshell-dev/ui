import { restoreScriptNodes } from '../../../shared/restore-scripts.ts';
import type { CompatibilityExpect } from '../../../shared/context.ts';
import { createRangeEnvironment } from '../common.js.ts';

// Original script nodes remain part of the document traversed by these cases.
const scripts = [
	'<script src=../common.js></script>',
	`<script>
"use strict";

// This script only exists because we want to evaluate the range endpoints
// in each iframe using that iframe's local variables set up by common.js.  It
// just creates the range and does nothing else.  The data is returned via
// window.testRange, and if an exception is thrown, it's put in
// window.unexpectedException.
window.unexpectedException = null;

function run() {
  try {
    window.unexpectedException = null;

    if (typeof window.testNodeInput != "undefined") {
      window.testNode = eval(window.testNodeInput);
    }

    var rangeEndpoints;
    if (typeof window.testRangeInput == "undefined") {
      // Use the hash (old way of doing things, bad because it requires
      // navigation)
      if (location.hash == "") {
        return;
      }
      rangeEndpoints = eval(location.hash.substr(1));
    } else {
      // Get the variable directly off the window, faster and can be done
      // synchronously
      rangeEndpoints = eval(window.testRangeInput);
    }

    var range;
    if (rangeEndpoints == "detached") {
      range = document.createRange();
      range.detach();
    } else {
      range = ownerDocument(rangeEndpoints[0]).createRange();
      range.setStart(rangeEndpoints[0], rangeEndpoints[1]);
      range.setEnd(rangeEndpoints[2], rangeEndpoints[3]);
    }

    window.testRange = range;
  } catch(e) {
    window.unexpectedException = e;
  }
}

testDiv.style.display = "none";
</script>`,
] as const;

// Written by Aryeh Gregor <ayg@aryeh.name>
export type RangeTestWindow = Window &
	typeof globalThis & {
		setupRangeTests(): void;
		run(): void;
		testRangeInput?: string;
		testNodeInput?: string;
		testRange: Range;
		testNode: Node;
		unexpectedException: unknown;
	};
export type RangeTestFrame = HTMLIFrameElement & {
	contentWindow: RangeTestWindow;
	contentDocument: Document;
};

// Install the upstream helper in its own iframe document without a resource server.
export async function installRangeFrame(
	iframe: RangeTestFrame,
	expect: CompatibilityExpect,
): Promise<void> {
	const document = iframe.contentDocument;
	const window = iframe.contentWindow;
	document.open();
	const loaded = new Promise<void>((resolve) => {
		iframe.addEventListener('load', () => resolve(), { once: true });
	});
	document.write(
		'<!doctype html>\n<title>Range test iframe</title>\n<link rel="author" title="Aryeh Gregor" href=ayg@aryeh.name>\n<meta name=timeout content=long>\n<body>\n<script></script>\n<script></script>\n',
	);
	document.close();
	restoreScriptNodes(document, scripts);
	const state = createRangeEnvironment(document, window, expect);
	window.setupRangeTests = state.setupRangeTests;
	window.unexpectedException = null;
	window.run = function run() {
		try {
			window.unexpectedException = null;
			if (typeof window.testNodeInput != 'undefined')
				window.testNode = state.resolve(window.testNodeInput);
			let rangeEndpoints;
			if (typeof window.testRangeInput == 'undefined') {
				if (window.location.hash == '') return;
				rangeEndpoints = state.resolve(window.location.hash.substr(1));
			} else rangeEndpoints = state.resolve(window.testRangeInput);
			let range;
			if (rangeEndpoints == 'detached') {
				range = document.createRange();
				range.detach();
			} else {
				range = state.ownerDocument(rangeEndpoints[0]).createRange();
				range.setStart(rangeEndpoints[0], rangeEndpoints[1]);
				range.setEnd(rangeEndpoints[2], rangeEndpoints[3]);
			}
			window.testRange = range;
		} catch (error) {
			window.unexpectedException = error;
		}
	};
	state.testDiv.style.display = 'none';
	document.body.setAttribute('onload', 'run()');
	await loaded;
}
