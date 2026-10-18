# Focused verification choices

Choose checks that exercise the task's important failure modes. Record selected commands, environments and when they are required in the project contract. These techniques supplement acceptance tests, [architecture review](architecture.md) and [support/security checks](support-policy.md); they add no test framework or mandatory mutation suite. Candidate execution follows the isolation, process and output limits in [controls](controls.md).

## Targeted mutation checks

Use a few deliberate faults when ordinary tests may miss a consequential calculation, permission rule or state transition. For example, invert a comparison protecting a minimum balance or remove a required acknowledgement. Prefer plausible defects in the changed rules over a coverage target.

1. Run the unmodified candidate's relevant tests and require a passing baseline.
2. Apply one fault at a time in a disposable synthetic copy; preserve the source checkout and identify the candidate, mutation and expected detecting test. Verify the intended mutation was actually applied.
3. Run the relevant tests. Count the mutation as detected only when an actual assertion/behaviour failure exposes the intended fault. Compilation errors, missing tools, timeout, unavailable platforms and other infrastructure failures provide no successful detection evidence. A passing test run means the fault survived and exposes a test gap; an equivalent/non-behavioural mutation needs a recorded explanation rather than a claimed detection.
4. Improve meaningful assertions or behaviour coverage, restore a fresh copy between faults, rerun the clean baseline and affected checks, and record detected/survived/unresolved outcomes. Keep the first result and correction count. Remove only the run's owned scratch data within the configured limits.

Use existing tooling if suitable and supported; a small hand-selected experiment is enough. A clean baseline plus detected mutations proves only the selected faults were caught. Mutation score or coverage alone cannot establish correctness. See [synthetic decisions](../examples/verification-boundaries.md#mutation-outcomes).

## Selective CI

When CI selects checks by changed paths, labels, event type or manual input, test that selection policy as well as the jobs. Keep a reliable core gate for every relevant candidate and name the additional checks required for acceptance. An always-run workflow needs no selection layer.

Where selection is used, extract a small testable decision function or exercise equivalent workflow behaviour. Cover positive and negative cases: sensitive versus unrelated paths, mixed changes, renames/deletions, workflow/toolchain/shared-build changes, review-label transitions, new commits, manual overrides and unavailable/malformed diff input. Unknown scope must select the safe superset or block with an explicit reason; it cannot silently mean no changes. Prove the actual workflow uses the tested policy, not a separate unconnected copy. Update selection rules and their tests together when source boundaries change.

Check required-status names and live branch rules against the event/selection combinations. A skipped job is not evidence that its behaviour passed. A required check selected later must complete for the current candidate before acceptance; removing a label, using a manual override or reusing evidence from an older SHA cannot waive it. Preserve head versus synthetic merge-SHA identity when combining runs. Avoid path-filtered required workflows that never report a status, and use an always-reporting acceptance gate where needed to distinguish intentional skips from missing required evidence.

Record the applicable matrix and platform gaps in the contract/work record. Run the classifier tests when its rules or callers change; they do not establish that platform checks ran, that live branch protection is configured, or that a human accepted the result. See [selection examples](../examples/verification-boundaries.md#ci-selection).
