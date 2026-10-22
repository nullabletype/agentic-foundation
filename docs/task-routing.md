# Required reading by task

At session start, read the current agent entry instructions, the active project contract and [controls](controls.md). For foundation maintenance, use the accepted task/scope; the example contract grants no authority. These safety/authority requirements apply to every route.

Then load the matching rows below. Routes are additive: a UI dependency change needs both. Read referenced sections when specified, rather than every linked document. Reuse unchanged material already in context; reread when its source, scope or relevant evidence changes. If classification is uncertain, inspect the affected boundary before acting.

| Task or trigger | Additional reading |
| --- | --- |
| Implement an accepted ready task, including routine repairs | [Delivery loop](workflow.md), task acceptance criteria and relevant source/decisions |
| Resume interrupted work | [Delivery/resumption](workflow.md), current [handoff](../templates/handoff.md), actual Git and pending remote state |
| Explore a new or uncertain product flow | [Discovery stages 1–4](discovery.md), [brief](../templates/brief.md) |
| Prepare/split tasks, triage scope or reassess dependencies | [Task preparation and readiness](discovery.md#5-prepare-sensible-tasks), [task template](../.github/ISSUE_TEMPLATE/task.md) |
| Review implementation independently | [Review record](../templates/independent-review.md), task/specification and actual candidate diff |
| Choose tests for consequential rules or change conditional CI selection | [Targeted mutation checks and selective CI](testing.md), affected acceptance criteria and workflow callers |
| Set up owner-operated inspection of a private external format | Controls' [optional inspection boundary](controls.md#optional-owner-operated-private-data-inspection), contract's private-data setup decision |
| Change architecture or accept architecture readiness | [Architecture/LikeC4 decision](architecture.md), relevant ADRs |
| Select/update dependencies or tools; support review becomes due | [Support and security policy](support-policy.md), affected inventory and lockfiles |
| Design, implement, launch or review UI, interaction or accessibility changes | The accepted project UI contract or [UI contract template](../templates/ui-contract.md), Controls' authority/privacy sections and the contract's synthetic launch/walkthrough configuration |
| Stage, push or create/update a PR | Controls' pre-publication privacy check, [publication steps](workflow.md), exact candidate evidence |
| Change generation, storage, isolation or permissions | Controls' affected boundary, configured limits and rejection evidence |
| Materially change agent guidance, templates, models or orchestration | [Evaluation procedure](agent-evaluation.md) to decide affected cases or record why reevaluation is unnecessary; keep keys out of candidate/calibration inputs |
| Adopt the foundation or complete a contract | [Adoption](adoption.md), [contract template](../templates/project-contract.md) |

Research, historical reviews and pilot receipts are background evidence. Read them when investigating rationale or a specific prior result; they are not required for an ordinary implementation task.
