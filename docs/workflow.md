# Delivery and resumption

Use this loop for an accepted, ready task. For uncertain product flows or preparing new tasks, use the relevant [discovery/preparation route](task-routing.md). Routine repairs reuse accepted decisions; they do not restart discovery.

## Execute one bounded loop

1. Read the ready task, contract, relevant decisions and current checkout. Confirm the base against the remote. Use a fresh branch or suitable isolated worktree; preserve unrelated work.
2. Restate the outcome and non-goals. Implement the smallest complete change and meaningful checks. Reproduce a defect before fixing it where practical.
3. Run focused checks, then the agreed gate. Commit the intended candidate locally and verify that exact tree; record the SHA, commands, results and environment. Any subsequent change invalidates affected evidence.
4. Give an independent agent the task, base and candidate SHA, diff and validation instructions. It inspects source, tests and failure cases, reproduces relevant checks and returns the [review record](../templates/independent-review.md). A different session of the same model can review; model diversity is optional. The implementer's summary alone is insufficient input.
5. Address findings within the remaining budget. Re-run affected checks and request review of the corrected candidate. Classify infrastructure failure separately; a missing check stays pending.
6. Apply the publication gate in [controls](controls.md). Verified non-UI changes can be pushed and opened as a PR under the accepted contract. UI/UX changes wait for human local approval first. Record the approval's scope and SHA; relevant later changes require renewed review.
7. Observe required CI for the published candidate. Distinguish branch-head SHA from a synthetic PR merge SHA; retain both when applicable. New commits invalidate affected check/review results. Hosted-only failures return to correction within the same budget.
8. Report “ready for merge” only when required CI, independent review and human gates are satisfied. Merge and release use their separate authority. Close the task only after integration and any required post-merge checks.

If the reviewer is unavailable, leave verification pending; do not silently self-approve. Non-UI PR publication can precede hosted-only checks, but never bypass locally runnable required checks. A failed hosted check cannot become a successful result through a rewritten summary.

When several acceptance criteria need separate proof, map each to its evidence or explicit gap in the review/PR record. Reuse concise evidence references instead of copying logs. For material changes to agent instructions, templates or orchestration, assess whether the optional [agent-behaviour evaluation](agent-evaluation.md) is useful; a documentation gate does not measure agent behaviour.

## Stop and resume

Use the contract's correction and active-time limits. Count a correction cycle when changing the candidate to address failed validation or review. Persist counters across context resets and restarts. Human wait and hosted queue time do not consume active work, but unattended processes still need wall-clock timeouts.

Stop on exhausted budget, repeated unexplained failure, scope ambiguity, missing required review or an attempted permission expansion. Leave a [handoff](../templates/handoff.md) with the next safe action. Only the human can renew a budget or revise scope; starting a new chat does not reset either.

Humans may simplify a gate that costs more than it proves. Record the reason and replacement evidence, then change the policy separately from the failing implementation. Never weaken a check merely to turn it green.
