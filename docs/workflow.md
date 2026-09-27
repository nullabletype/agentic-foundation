# From discovery to delivery

Use the full discovery and HTML sequence for a new or uncertain user flow. For established behaviour, maintenance or non-interactive components, record the already-accepted requirements and architecture and choose the smallest relevant experiment. A routine repair does not restart product discovery. The human owns any material change of direction.

## 1. Interrogate the problem

Start with the [brief](../templates/brief.md). Ask about the user, desired outcome, existing workflow, constraints and non-goals. Challenge assumptions with concrete scenarios, including failure and recovery. Ask the next question that can change the decision, rather than presenting a long generic questionnaire.

Matt Pocock's **grilling** skill supplies a useful approach; see [credits](../CREDITS.md). A skill helps conduct the conversation; it does not make product decisions for the owner.

**Exit:** the human agrees a bounded problem and the questions the prototype must answer. Uncertain implementation details can remain open.

## 2. Prototype the flow in HTML

Build the smallest local HTML/CSS/JavaScript prototype that tests those questions. Use synthetic fixtures, minimal dependencies and explicit fake behaviour. Exercise the happy path, an important failure, an empty state and recovery where relevant. Ask a human to operate it and judge usability, wording and visual presentation.

Record the hypothesis, observed outcome and retain/rework/discard decision in the brief. A prototype that disproves an idea is successful research. Do not promote its code or technology choices into production by accident. Desktop capture remains prohibited; browser verification follows [controls](controls.md).

**Exit:** the human has tested the core concepts and flows; limitations and failed assumptions are recorded.

## 3. Refine and re-grill

Revisit the brief using what people actually did. Resolve the assumptions the experiment exposed. Avoid polishing the prototype beyond the question it answers. If uncertainty remains, run a smaller experiment before planning the full product.

**Exit:** the owner accepts the flow and revised scope, or chooses to stop. An accepted HTML flow is not approval of an unseen native implementation.

## 4. Agree requirements and architecture

Turn accepted scenarios into testable requirements. Choose the production platform only now, against deployment, privacy, accessibility, maintenance and support constraints. Record consequential decisions with context, alternatives, decision and consequences; a short [ADR](architecture.md) is enough. Record a LikeC4 adopt/defer/not-needed decision with rationale before architecture readiness. Apply the [support policy](support-policy.md): unsupported components are prohibited, and unknown support must be resolved before selection.

Complete the [project contract](../templates/project-contract.md). Name the canonical validation command, supported environments, artifact limits, publication authority, reviewer and correction/time budgets. A manual loop is the starting point; an unattended controller is a separate decision.

**Exit:** material product and architecture questions are settled, commands are verified against source/help, and the human accepts the contract. Missing enforcement is explicitly marked pending.

## 5. Prepare sensible tasks

Use the [task template](../.github/ISSUE_TEMPLATE/task.md). Prefer end-to-end slices that leave the project runnable. Include acceptance scenarios, non-goals, dependencies, validation and UI/UX impact. Keep one authoritative work queue; a local checkpoint is not a second backlog.

Split tasks when they require different decisions or rollback boundaries. Combine small changes when they share acceptance criteria and validation. Avoid both giant autonomous assignments and a separate ticket for every mechanical edit.

**Exit:** at least one task is ready, with dependencies satisfied and no unresolved decision that could change its implementation.

## 6. Execute one bounded loop

1. Read the ready task, contract, relevant decisions and current checkout. Confirm the base against the remote. Use a fresh branch or suitable isolated worktree; preserve unrelated work.
2. Restate the outcome and non-goals. Implement the smallest complete change and meaningful checks. Reproduce a defect before fixing it where practical.
3. Run focused checks, then the agreed gate. Commit the intended candidate locally and verify that exact tree; record the SHA, commands, results and environment. Any subsequent change invalidates affected evidence.
4. Give an independent agent the task, base and candidate SHA, diff and validation instructions. It inspects source, tests and failure cases, reproduces relevant checks and returns the [review record](../templates/independent-review.md). A different session of the same model can review; model diversity is optional. The implementer's summary alone is insufficient input.
5. Address findings within the remaining budget. Re-run affected checks and request review of the corrected candidate. Classify infrastructure failure separately; a missing check stays pending.
6. Apply the publication gate in [controls](controls.md). Verified non-UI changes can be pushed and opened as a PR under the accepted contract. UI/UX changes wait for human local approval first. Record the approval's scope and SHA; relevant later changes require renewed review.
7. Observe required CI for the published candidate. Distinguish branch-head SHA from a synthetic PR merge SHA; retain both when applicable. New commits invalidate affected check/review results. Hosted-only failures return to correction within the same budget.
8. Report “ready for merge” only when required CI, independent review and human gates are satisfied. Merge and release use their separate authority. Close the task only after integration and any required post-merge checks.

If the reviewer is unavailable, leave verification pending; do not silently self-approve. Non-UI PR publication can precede hosted-only checks, but never bypass locally runnable required checks. A failed hosted check cannot become a successful result through a rewritten summary.

## Stop and resume

Use the contract's correction and active-time limits. Count a correction cycle when changing the candidate to address failed validation or review. Persist counters across context resets and restarts. Human wait and hosted queue time do not consume active work, but unattended processes still need wall-clock timeouts.

Stop on exhausted budget, repeated unexplained failure, scope ambiguity, missing required review or an attempted permission expansion. Leave a [handoff](../templates/handoff.md) with the next safe action. Only the human can renew a budget or revise scope; starting a new chat does not reset either.

Humans may simplify a gate that costs more than it proves. Record the reason and replacement evidence, then change the policy separately from the failing implementation. Never weaken a check merely to turn it green.
