// @clack/ui-preact — Preact binding for @clack/ui. Owns scheduling: it wires
// Preact's reconciler/effect timing to the base host's commit contract (INV-4).
export * from './scheduler.ts';
export {act} from './react-shim.ts';

// Generic, unopinionated components in the CSS-subset vocabulary, emitting the
// neutral host tags. @clack/ui-shrink re-skins these with ink defaults.
export {Box} from './components/Box.tsx';
export {Text} from './components/Text.tsx';
export {Spacer} from './components/Spacer.tsx';
export {Newline} from './components/Newline.tsx';
export {Transform} from './components/Transform.tsx';
