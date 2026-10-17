# Changelog

## 0.2.0-draft.4 — 17 October 2026

Unpublished follow-up; safety, authority and verification gates are unchanged.

- Task-type routing selects additional reading while entry instructions, the active contract and controls remain required at session start.
- Discovery and task preparation move to a separate document; routine delivery/resumption reads the shorter workflow.
- Both agent entry points and adoption include the shared routing/discovery documents. Unchanged material already in context can be reused; changes invalidate that reuse.

## 0.2.0-draft.3 — 17 October 2026

Unpublished follow-up; no runtime, evidence-schema or permission changes.

- Project contracts name dedicated synthetic generation/launch commands, representative states and collision/missing-data rejection for reviewable applications.
- Security-audit guidance validates report schema, findings, expected scope and completion rather than exit status alone; lifecycle support remains a separate check.
- Synthetic worked examples show required launch/audit decisions without claiming runtime enforcement. Adoption copies the new example alongside the existing guidance.

## 0.2.0-draft.2 — 17 October 2026

Unpublished draft; no evidence-schema or permission changes.

- Optional manual delivery-agent evaluation pack, independent grading key, bounded aggregate record and reevaluation guidance. No executable agent runner or new required CI gate.
- Explicit readiness admission separates scope acceptance and dependency integration from form completion, issue closure and board labels.
- PR and independent-review templates map acceptance criteria to evidence or explicit gaps.
- Adoption includes the evaluation guidance, template and synthetic cases without configuring tools or permissions.
- Grader calibration v2 separates inputs from operator answers; historical grades from answer-exposed calibration are marked unvalidated. Records distinguish measured counts from unobserved boundaries and guidance comparisons require exact supplied inputs.

## 0.2.0-draft.1 — 27 September 2026

Draft follow-up to 0.1; not a tagged or published release.

- Publication preflight explicitly includes untracked files, even when Git is configured to hide them from status.
- Implementer and reviewer identities are compared after trimming surrounding whitespace, rejecting accidental self-review while accepting distinct reviewers.
- Regression tests reproduce both defects and verify that clean candidates and distinct reviewers still pass.

The evidence schema remains version 1. Identity values remain case-sensitive; local attestations still do not authenticate a reviewer's identity.

## 0.1.0-draft.1 — 27 September 2026

Initial draft, prepared for the first push. Not a tagged or published release.

- Discovery, disposable HTML prototyping, architecture decisions and bounded delivery loop.
- Human UI/UX approval before publication and independent implementation review.
- Explicit privacy, artifact/storage, supported-dependency and scope boundaries.
- ADR template and required consideration of LikeC4.
- Safe adoption helper, publication evidence preflight and bounded Docker verifier.
- Retained regression checks, synthetic negative controls and pilot evidence.
- MIT licensing with provenance retained during adoption.

Validation and limits are recorded in [the pilot](examples/pilot.md). Real product adoption, hosted CI, host permission enforcement and an authenticated publisher remain unproven here.

## Versioning

[VERSION](VERSION) is the canonical foundation version. Use `0.2.0-draft.N` for revisions of the current draft; remove the prerelease suffix only when the owner approves the corresponding release. Update this changelog alongside VERSION. Tags and releases require separate authority.

Adopters record the version they copied and review later changes deliberately; adoption never silently upgrades or overwrites project guidance. While below 1.0, check the changelog and contract/schema changes before every update; do not assume compatibility.
