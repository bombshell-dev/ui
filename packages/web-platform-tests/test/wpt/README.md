# Adapted Web Platform Tests

[WPT_REVISION](../../WPT_REVISION) is the shared upstream revision. Adaptations live
under `src/wpt/` at the upstream path with `.ts` appended. Removing that final
suffix identifies the source used for test selection. Case names and input
matrices remain alongside ordinary `context.test` and `expect` calls.

Copyright web-platform-tests contributors. The upstream [BSD-3-Clause license](LICENSE)
applies to the adaptations; original author notices are retained in the source.
The harness and browser tooling use the package's [MIT license](../../LICENSE).
