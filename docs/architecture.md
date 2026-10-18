# Architecture decisions and diagrams

Record consequential choices before implementation. Use an ADR when changing direction would be costly, the reasoning would otherwise be surprising, and there was a genuine trade-off. Routine, reversible choices belong in the task or project contract; do not create an ADR for every library or edit.

Create `docs/adr/` when the first decision needs it. Use sequential names such as `0001-storage-boundary.md` and the [ADR template](../templates/adr.md). Keep context, decision and rationale concise; include alternatives and consequences when useful. Mark proposed decisions clearly. When an accepted decision changes, add a superseding record and link both ways rather than silently rewriting history. Tasks and reviews link the relevant decisions.

## Required LikeC4 consideration

Before accepting the project contract or declaring architecture work ready, record **adopt / defer / not needed** for LikeC4, with the reason, owner, date and a revisit trigger. Missing consideration blocks readiness. This is a human/independent-review gate; the documentation checker does not understand or authenticate architectural judgement.

Consider LikeC4 when system boundaries, integrations, deployment or important flows benefit from a maintained model. A small script may reasonably record “not needed: no meaningful system relationships; reconsider when an external service is added”. A deferral must name the uncertainty and the event that resolves it. Existing accepted decisions can be reused until the architecture changes; no repeated decision ceremony for routine fixes.

If adopted, keep model source under `architecture/`, link views to relevant ADRs, and update the model with changes to the relationships it describes. Pin a currently supported LikeC4 version and runtime as development tooling with a lockfile, following the [support policy](support-policy.md). Record exact validation/build commands verified against the installed CLI's help in the project contract. The [official CLI reference](https://likec4.dev/tooling/cli/) describes validation, formatting checks and static-site generation; check the selected version before configuring them.

Run model validation and the agreed build for affected architecture changes. A successful build proves syntax and generation, not that a diagram matches the implementation; the independent reviewer checks that correspondence. Bound generated output paths, bytes and retention under [controls](controls.md), clean transient output, and do not upload routine CI artifacts. Desktop/native capture remains prohibited; image exports need the separate configured page-only allowance. Do not install LikeC4 merely to fill in this decision.

## Check useful boundaries

Review architectural impact for each change. Where meaningful boundaries could drift, add focused checks against the actual evaluated dependency graph: for example, domain calculations must not reference a UI/database adapter, and production must not compile disposable prototype code. Include resolved project/package references and relevant bypass routes such as linked source, direct assembly references or build configuration overrides where the ecosystem exposes them. Keep the command and applicable configurations in the project contract. Small projects without consequential boundaries can rely on source review; no standard project layout or architecture-test framework is required.

Prove each selected rule with an allowed synthetic graph and a deliberately forbidden edge or bypass; the check must fail for the expected reason. Recheck diagram/ADR correspondence independently. Graph validation and lexical API scans cannot prove runtime network denial, credential isolation or every dynamic dependency. Dependency security, upstream support and maintainability review remain required under [support policy](support-policy.md), even when all architecture checks pass. See [boundary examples](../examples/verification-boundaries.md#architecture-boundaries).
