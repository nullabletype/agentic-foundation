# Discovery and task preparation

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

## 4. Agree requirements, UI contract and architecture

Turn accepted scenarios into testable requirements. Choose the production platform only now, against deployment, privacy, accessibility, maintenance and support constraints. Record consequential decisions with context, alternatives, decision and consequences; a short [ADR](architecture.md) is enough. Record a LikeC4 adopt/defer/not-needed decision with rationale before architecture readiness. Apply the [support policy](support-policy.md): unsupported components are prohibited, and unknown support must be resolved before selection.

For a product with UI work, accept a small [UI style and interaction contract](../templates/ui-contract.md) before the first production UI slice. Transfer the prototype's accepted visual language, interaction states, content conventions, accessibility behaviour and responsive boundaries without treating prototype implementation as production source. Name the production semantic resources and shared patterns agents must reuse. A non-UI project records the contract as not applicable.

Complete the [project contract](../templates/project-contract.md). Name the canonical validation command, supported environments, artifact limits, publication authority, reviewer and correction/time budgets. A manual loop is the starting point; an unattended controller is a separate decision.

For reviewable applications, record the synthetic generation/launch commands and representative scenarios. Launch explicitly against that dedicated data; if it is missing or invalid, stop and generate/validate it rather than falling back to a real/default workspace. Use production domain/store APIs where needed to preserve invariants, with fixed dates/seeds for repeatable semantics where useful; encrypted bytes need not be deterministic. Refuse destination collisions and keep generated data local within the configured limits. Human observation and screenshot-free checks remain the verification path. A sample workspace complements focused tests; it is not acceptance evidence on its own.

**Exit:** material product, UI and architecture questions are settled, commands are verified against source/help, and the human accepts the applicable contracts. Missing enforcement is explicitly marked pending.

## 5. Prepare sensible tasks

Use the [task template](../.github/ISSUE_TEMPLATE/task.md). Prefer end-to-end slices that leave the project runnable. Include acceptance scenarios, non-goals, dependencies, validation and UI/UX impact. A UI task names the accepted pattern it reuses or the new pattern and contract change it proposes. Keep one authoritative work queue; a local checkpoint is not a second backlog.

Split tasks when they require different decisions or rollback boundaries. Combine small changes when they share acceptance criteria and validation. Avoid both giant autonomous assignments and a separate ticket for every mechanical edit.

### Readiness admission

A submitted form is a proposal, not acceptance of its scope. Before first admission to the ready queue, record the owner's accepted outcome and the readiness decision. An accepted contract and previously agreed scope can supply that authority for routine repairs; do not request repeated approval for each mechanical step.

Use one explicit dependency field in the task. A closed dependency is a signal to recheck readiness, not proof that its acceptance criteria passed or that the required change was integrated. Check the needed result and integration evidence before starting dependent work. Reopening a dependency, losing required evidence or adding a material open decision removes readiness until reassessed. A board column or label alone cannot override these conditions.

Readiness automation is optional. If adopted, explicitly admit its tasks, preserve manual holds and unrelated work, use one canonical dependency field, reject missing/malformed references and cycles, and provide a read-only preview. Dependency transitions may maintain a previously accepted task; they cannot accept product scope or grant publication authority. Test reopening, malformed inputs and manual overrides before enabling writes. No particular tracker, label set or issue parser is required here.

**Exit:** at least one task is ready, with dependencies satisfied and no unresolved decision that could change its implementation.
