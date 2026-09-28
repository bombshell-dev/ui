# TODO

## Middleware And Events

- [ ] Decide whether raw terminal events and semantic host events need a shared event context.
- [x] Return an explicit `handled` result from raw dispatch.
- [x] Return an explicit `handled` and `stopped` result from semantic event emission.
- [x] Add documented public middleware entry points for advanced event policies.

## Render Requests

- [x] Treat `requestRender()` as invalidation and scheduling, never immediate drawing.
- [x] Coalesce requests into one scheduled frame.
- [ ] Propagate invalidation through retained-tree ancestors.
- [x] Cache packed layout fragments for unchanged retained subtrees.
- [ ] Invalidate both old and new focus nodes.
- [ ] Add explicit invalidation reasons to layout-boundary policy.

## Terminal Rendering

- [x] Preserve full-tree layout as the correctness fallback during each frame.
- [x] Reuse the tty backend's retained frame state when rendering operation lists.
- [ ] Add application-level region metadata before attempting independent subtree output.
- [ ] Add region-level terminal updates for fixed-size independent regions.
- [ ] Add region-level updates for isolated dynamic flow boundaries.
- [ ] Add region-level updates when dynamic flow repositions siblings.

## Verification

- [x] Add deterministic frame-stream tests for request coalescing and disposal.
- [x] Add integration coverage for event bursts that cause one frame request.
