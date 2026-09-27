# Project contract

Status: **draft — fill and accept before using publication authority**

This file configures the [workflow](../docs/workflow.md) and [controls](../docs/controls.md); it does not grant permissions by itself. When copied, update links to their adopted locations. Record actual values, not placeholders presented as working controls.

## Product and ownership

- Product/spec and accepted scope:
- Domain and architecture decisions (see [architecture guidance](../docs/architecture.md)):
- LikeC4 decision: adopt / defer / not needed; rationale, decision date/owner and revisit trigger (required before acceptance):
- Owner for product, UI/UX, policy and budget decisions:
- Authoritative queue and ready criteria:
- Supported platforms and upstream support evidence/date:

## Reproducible validation

List exact commands verified against checked-in source or generated help.

| Check | Command from repository root | Environment | Required when |
| --- | --- | --- | --- |
| Canonical gate | To configure | To configure | Every candidate |
| Focused tests | To configure | To configure | Affected behaviour |
| Native/browser smoke without capture | To configure | To configure | Affected flows |
| Human UI/UX walkthrough | Steps to configure | Local synthetic build | Any UI/UX impact |

- Dependency/runtime pins, lockfiles and update owner:
- [Support inventory](../docs/support-policy.md): exact versions, upstream evidence, checked date, end-of-support dates/recheck dates and migration owner; no unsupported components:
- Required hosted check names and live ruleset audit evidence:
- Evidence record location (SHA, commands/results, run URLs, limitations):

## Authority and boundaries

- Non-UI branch push and PR creation/update: enabled after local checks and independent verification **only when this contract is accepted**.
- UI/UX branch push and PR creation/update: human approval of the actual local candidate required first.
- Merge, tag, deploy and release: separate explicit human authority.
- Independent verification agent/session, isolated execution mechanism and initial calibration evidence:
- Tool allowlist and network/credential scope:
- Desktop/native capture and ambient screen inspection: disabled before the first agent session, including supervised work; record how:
- Browser-page image generation: disabled by default; any synthetic page-only allowance, paths and limits:
- Human approval record location and rules for invalidation:

## Execution and output budgets

Suggested starting limits are three correction cycles and 90 active minutes per task, whichever is reached first. These are tunable investigation bounds, not delivery estimates. Adopt or replace them explicitly.

- Accepted correction limit, active-time limit and optional monetary ceiling:
- Per-process/CI wall-clock timeout and cancellation behaviour:
- Checkpoint path, maximum bytes, cleanup and crash/restart accounting:
- Generated scratch paths, aggregate byte ceiling, retention and cleanup owner:
- Dependency caching: disabled unless configured with purpose, bounds and retention:
- Routine CI uploads: **zero files / zero bytes**.
- Release uploads: disabled until manifest, target platforms, maximum file count/bytes, retention days and release authority are configured.
- Cross-job synthetic state: disabled unless payload, producer/consumer byte limits and exposure are configured.

## Acceptance and enforcement status

Record each control as configured-and-tested, manual-only, or pending. Do not infer enforcement from this document.

- Negative-control results from the [adoption checks](../docs/adoption.md):
- Human contract acceptance, date and revision:
- Next review: first completed slice, then each milestone or demonstrated failure.

Unattended execution remains disabled until its tool permissions, budgets, recovery and rejection behaviour have been tested and explicitly accepted.
