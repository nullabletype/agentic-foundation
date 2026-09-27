# Changelog

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
