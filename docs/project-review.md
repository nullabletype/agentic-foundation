# Lessons from dot-orbit and dot-finance

Source review on **27 September 2026**, against clean local checkouts whose HEADs were confirmed through GitHub's `commits/main` API:

- dot-orbit: [`4d464fed486841da02eaec9d70d277f0f8afb055`](https://github.com/nullabletype/dot-orbit/tree/4d464fed486841da02eaec9d70d277f0f8afb055).
- dot-finance: [`6ee5c52dc07b23f3ba2e6a4acaab6353758c7160`](https://github.com/nullabletype/dot-finance/tree/6ee5c52dc07b23f3ba2e6a4acaab6353758c7160).

This review inspected guidance, workflows, verification entry points and controller/smoke implementation. It did not rerun either application's test matrix, audit live branch settings or inspect current storage billing. “Present in source” is not a claim that a hosted run passed. Neither source repository was modified.

## Findings that shape this foundation

| Area | Observed setup | Decision here |
| --- | --- | --- |
| Screenshot privacy | Orbit's loop and PR template request screenshots. Finance's native prototype helpers explicitly render windows to PNG. Artifact-upload restrictions do not prevent local capture. | Ban desktop/native capture at generation, including hidden test helpers; disable capture tools and use human observation. |
| Publication | Orbit explicitly allows automatic non-UI push/PR publication and requires local human approval for UI/UX. Finance has broader human checkpoints but no equally explicit per-change pre-push rule. | Adopt Orbit's distinction and define UI/UX by behavioural effect. Keep merge/release authority separate. |
| Independent review | Orbit says “when available/practical”; Finance requires it before acceptance. | Require a separate verifying agent; unavailable review remains pending. |
| Artifact control | Both restrict uploaded artifacts. Orbit assembles and validates release archives; routine PR runs upload nothing. Finance rebuilds each backup job and sends synthetic encrypted backup data through job outputs. | Keep release-only uploads, add explicit generation/size/retention budgets, and prevent artifact-like workarounds. |
| Evidence | Orbit has a canonical gate with detached-snapshot checks for the expected SHA and clean source tree. Finance's controller trial ties receipts to a clean commit and invalidates changed evidence. | Bind validation and review to the candidate, including the distinction between head and PR merge commits. |
| Bounded recovery | Finance's controller trial exercises interruption, process deadlines, corrections, state and ambiguous remote writes. Orbit's prose asks for bounded corrections without a numeric task budget. | Require an explicit budget and compact resumable state; start with a manual loop. |
| Scope and maintenance | Orbit's delivery guide retains a “suggested first issue sequence” after those foundations have substantially evolved. Finance labels some limits proposed and its controller deliberately manual. | Separate historical rationale, active contracts and future work. Remove stale planning text at milestones. |

### Privacy evidence

Orbit's [PR template](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/.github/pull_request_template.md) requests screenshots, and its [delivery loop](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/docs/development/agent-loop.md) includes them as evidence. Finance's [LaunchEvidence.cs](https://github.com/nullabletype/dot-finance/blob/6ee5c52dc07b23f3ba2e6a4acaab6353758c7160/prototypes/DesktopShell/LaunchEvidence.cs) renders `window.png` and workflow images. These are app-rendered captures; this review does not claim those helpers capture the whole desktop. The stricter foundation policy intentionally covers both.

### What to retain from Orbit

The [verification implementation](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/tools/DotOrbit.Verification/VerificationGate.cs) and [definition of done](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/docs/development/definition-of-done.md) connect restore, formatting, build, tests and native smoke with commit-bound evidence. Its [build workflow](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/.github/workflows/build.yml) calls the same gate on three operating systems, with read-only permissions, timeouts and concurrency cancellation.

The [release workflow](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/.github/workflows/release-packages.yml) separates package verification from manual upload and uses seven-day retention. Its [branch-protection guide](https://github.com/nullabletype/dot-orbit/blob/4d464fed486841da02eaec9d70d277f0f8afb055/docs/development/main-branch-protection.md) correctly distinguishes checked-in workflows from live settings. The reusable lesson is evidence and enforcement separation, not a requirement that every project adopts its .NET verifier.

### What to retain from Finance

The [development workflow](https://github.com/nullabletype/dot-finance/blob/6ee5c52dc07b23f3ba2e6a4acaab6353758c7160/development-workflow.md) treats experiments as disposable, separates synthetic development from private trials, and keeps product and architecture decisions explicit. Its [controller trial](https://github.com/nullabletype/dot-finance/blob/6ee5c52dc07b23f3ba2e6a4acaab6353758c7160/prototypes/ControllerTrial/README.md) is unusually clear about what its recovery experiments prove and what remains unsafe for unattended use. This foundation retains that honesty without requiring a controller implementation in every new repository.

The [validation workflow](https://github.com/nullabletype/dot-finance/blob/6ee5c52dc07b23f3ba2e6a4acaab6353758c7160/.github/workflows/prototype.yml) contains no artifact upload/download steps. The desktop job has a timeout, but the backup jobs lack explicit job timeouts and the workflow has no concurrency cancellation. Its backup-producing PowerShell steps write base64 output without an explicit payload-size check. The foundation therefore requires bounded transport rather than copying this mechanism unchanged.

## The storage lesson

The maintainer reported an earlier pattern of three roughly 200 MB platform bundles being retained between test stages. The current source no longer uses that artifact transport. These figures describe the motivating incident, not current usage, and the bundles should not be described as verified full OS images. The same policy also prohibits OS images and container filesystems, which would be an even more expensive way to transport test state.

The correction is to decide what may be generated, where it may live, how large it may become and when it is removed **before** the harness runs. Release-only uploads are one boundary; bounded local generation and transport are separate boundaries.

## Follow-up candidates for the source projects

These are recommendations, not changes delivered by this repository:

1. Remove screenshot requests and native PNG generation from routine verification; configure capture denial in the actual harness.
2. Make independent verification and UI/UX pre-publication approval consistent in guidance, templates and implementation.
3. Add explicit size checks for Finance's synthetic cross-job payload, job timeouts and suitable concurrency control.
4. Review active budgets, stale planning sections and live enforcement status at the next milestone.

Do not introduce a new controller, board taxonomy or policy framework merely to apply these small corrections.
