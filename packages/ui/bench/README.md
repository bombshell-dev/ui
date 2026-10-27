# UI render benchmarks

Run the full Vitest `createUI` frame benchmark matrix with:

```sh
pnpm bench
```

The same command runs in CodSpeed on pushes to `main` and pull requests. CI uses
walltime for elapsed time, including async frame output, then runs the benchmarks
again with memory tracking to report allocations and peak memory.

`createUI()` and fixture construction are outside the timed
sample. The initial-render comparison measures starting `ui.main()` through its first
output callback. Each update workload compares six tree shapes at 100, 500, 1,000, and
2,000 component elements:

- **Grass:** one root with all components as direct children.
- **Bamboo:** a single deep component chain.
- **Bush:** a broad shape that branches into up to two children at each step.
- **Evergreen:** a strong central trunk with side branches along its length.
- **Maple:** one trunk, four main branches, sixteen smaller branches, then leaves
  distributed across those branches.
- **Sequoia:** a trunk chain containing three quarters of the components, with a
  branching crown of four main branches, sixteen smaller branches, and leaves.

Each component also has a text leaf. Update workloads are:
- one value update
- 100 batched value updates
- adding one component, 
- and adding a 100-component subtree.

New components and their text nodes are constructed inside the timed mutation,
not during fixture setup to mimic that work being done in a normal TUI setup. 
Measurements are not written to a terminal and do not include that timing.
