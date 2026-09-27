# Independent verification

Give this record to an agent that did not implement the candidate. Provide read-only access to source and a disposable verification checkout if commands generate output. The reviewer must not change implementation or policy. Execute candidate-controlled commands only in an isolated environment without publication credentials, host desktop access or unrelated private data; apply the project’s time/output/storage limits. Read-only files alone do not isolate a process. Use synthetic data and no desktop/native-window capture.

- Task and acceptance criteria:
- Base and candidate SHA (or content manifest before the first commit):
- Reviewer/session identity and confirmation it did not author the change:
- Diff and relevant specification/decision links:
- Commands independently run, environments and results:

## Findings

Inspect the actual implementation and test behaviour. Try an important boundary/failure case; consider whether a plausible defect would escape the tests. Check the pre-publication privacy sweep and inspect intended files/outgoing history for overlooked sensitive content. Check scope, data exposure, implicit screenshotting, generated output and UI/UX classification. Verify commands against source/help. For architecture changes, check relevant ADRs and diagram consistency, and require the recorded LikeC4 consideration. For dependency/toolchain changes, verify current upstream support evidence against the selected versions; unsupported or unknown status blocks acceptance. Review the relevant controls rather than adding a new universal checklist.

For each actionable finding: severity, file/line, concrete failure, evidence and required correction. Distinguish blockers from suggestions. A clean review should still state what was inspected and what could not be verified.

## Verdict

Accept / changes required / blocked.

- Acceptance criteria with evidence or explicit gaps:
- Human UI/UX review: required / not required, with reason; approval belongs to the human:
- Residual risks and unavailable checks:
- Re-review scope after corrections:

The implementer may respond below the review; it cannot replace the reviewer verdict. New changes invalidate affected evidence.

At first adoption, after a significant model change or after an escaped defect, calibrate the reviewer against a few known failing and valid cases before relying on its verdicts. Record false acceptances and unnecessary blocks; do not supply the expected answers in its initial context.
