# Project contract

Status: **draft — fill and accept before using publication authority**

This file configures the [workflow](../docs/workflow.md) and [controls](../docs/controls.md); it does not grant permissions by itself. When copied, update links to their adopted locations. Record actual values, not placeholders presented as working controls.

## Product and ownership

- Product/spec and accepted scope:
- UI style and interaction contract: accepted path and revision / not applicable; UI/UX owner and next review:
- UI implementation rule: each candidate names the accepted semantic resources and shared patterns it reuses; a genuinely new reusable pattern updates the UI contract and production implementation in that same candidate.
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
| UI-contract conformance checks | To configure / manual-only | To configure | UI implementation changes |
| Human UI/UX walkthrough | Steps to configure | Local synthetic build | Any UI/UX impact |

- Dependency/runtime pins, lockfiles and update owner:
- [Support inventory](../docs/support-policy.md): exact versions, upstream evidence, checked date, end-of-support dates/recheck dates and migration owner; no unsupported components:
- Required hosted check names and live ruleset audit evidence:
- Evidence record location (SHA, commands/results, run URLs, limitations):
- Optional synthetic UI reference surface command and supported themes/sizes, or not used:

Configure these where useful; universal dependency support/security review remains required:

- [Architecture boundaries](../docs/architecture.md#check-useful-boundaries): consequential rules, evaluated graph/configurations, positive/negative checks and command, or source review sufficient with reason:
- [Targeted mutation checks](../docs/testing.md#targeted-mutation-checks): selected critical rules/faults, baseline/detecting tests, command and scratch/time limits, or not selected:
- [Selective CI](../docs/testing.md#selective-ci), if used: core/conditional acceptance matrix, selector and workflow-integration tests, unknown-scope handling, current-candidate evidence and live required-status audit; otherwise always-run:

### Optional private-data inspection setup

Ask at setup: does understanding an external format require owner-operated private-data inspection? Default disabled/not needed. A yes identifies proposed setup, not permission to inspect. Follow the [inspection boundary](../docs/controls.md#optional-owner-operated-private-data-inspection); keep private inputs and derived output out of agent context and development evidence.

- Decision: disabled / not needed / proposed / owner-accepted; purpose and owner:
- If needed: reviewed procedure/tool, isolated local environment/network/telemetry controls, dependency preparation, private storage/access, byte/time/cleanup limits and residual risks:
- Human acceptance reference/date/revision, permitted sanitised outcome and independent synthetic reproduction path; no agent access to private files:

### Synthetic review workspace

For applications with a reviewable user flow, configure these before launching a build for human review. Otherwise record not applicable with the reason. Follow the existing privacy and output budgets; no capture allowance is implied.

- Synthetic data-generation and explicit review-launch commands, verified against source/help:
- Dedicated destination, refusal of existing data/recovery-file collisions, and how the launch proves it selected synthetic data (no fallback to a personal/default workspace):
- Scenario coverage (empty, failure/recovery, long/Unicode content and relevant date/order states); fixed clock/date/seed when useful:
- Production domain/store APIs used to keep generated data invariant-valid, or why a simpler fixture is sufficient; validate before use:
- Owned generated paths, byte/count limits, retention and cleanup reference; no generated database bytes committed:

### Structured security checks

Where supported by the ecosystem, record the agreed scanner/audit command, supported tool version, approved package/advisory sources and direct/transitive scope. Apply the [result-validation guidance](../docs/support-policy.md#validate-security-results); no generic scanner or runtime is installed by this contract.

- Exact command/environment, expected report schema/version, candidate/lockfile identity and expected dependency/project coverage:
- Failure conditions, applicable security policy and treatment of unavailable/incomplete reports:
- Dated lifecycle/support recheck, deadline and update owner; missing automation or unsupported scan coverage explicitly pending/manual:
- Sanitised outcome location; report generation/output limits and cleanup reference (no routine report upload):

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
