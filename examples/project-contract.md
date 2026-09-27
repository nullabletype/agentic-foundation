# Completed example: foundation automation pilot

**Illustrative completed contract, not publication authority for another project.** This records the bounded task exercised while improving this foundation. It is a documentation/tooling project, so the existing scope and these acceptance scenarios replace a new HTML experiment.

- Outcome: install self-contained guidance without overwriting existing work; verify candidate evidence and isolation through small repeatable tools.
- Non-goals: application framework, agent scheduler, automated publisher, merge/release, desktop access or OS permission changes.
- Product and policy owner: repository owner. Human approval of a UI/UX candidate would be required; this slice has no product UI change.
- Architecture/LikeC4 consideration: not needed for this bounded Python tooling pilot; the scripts have no service topology requiring a diagram. Reconsider when external integrations or a multi-component runner are introduced. Proposed by the implementing agent on 27 September 2026; owner acceptance remains pending for real adoption.
- Support policy: [supported dependencies only](../docs/support-policy.md). This historical pilot records tested versions, not a completed lifecycle inventory; live support evidence for every selected tool remains required before accepting a real project contract.
- Work record: this bounded task and [pilot results](pilot.md).
- Local gate: `python3 scripts/verify.py` from the foundation root, using maintained Python 3.
- Isolation gate: `python3 scripts/pilot_isolation.py`, using the digest pinned in `scripts/isolated_verify.py` and a maintained Linux Docker engine.
- Independent review: separate read-only agent; any candidate-controlled execution uses the isolated reference profile, without publication credentials.
- Source snapshot: at most 100 files / 1 MiB, content digest reported by the trusted wrapper.
- Scratch: 16 MiB `/tmp` plus 1 MiB shared memory, removed with each container. No retained candidate output; 64 KiB output cap.
- Runtime: 128 MiB memory, one CPU, 64 processes, 30-second candidate timeout (maximum 60); ten seconds each for Docker setup and cleanup.
- Corrections: at most three correction cycles per finding and 90 active minutes before scope/budget review. These illustrative bounds are not an assertion that this example grants the live session new authority.
- CI artifact uploads and releases: disabled. One digest-pinned Python runtime image is retained in the local Docker store; no images, test state or receipts are uploaded.
- Checkpoints: concise sanitised task notes; no environment dump or workspace image. Fixture directories use temporary storage and are deleted by tests.

| Boundary | Status and evidence |
| --- | --- |
| Read-only candidate, no network/desktop mounts or inherited credential variables | Tested in the Linux reference profile; see pilot record |
| Scratch, time and output limits | Tested through real failing candidates |
| Documentation/adoption regression checks | Automated by the local/CI gate |
| Publication evidence freshness and UI approval | Automated preflight; attestation authenticity remains external |
| Independent reviewer calibration | Human/agent judgement exercise; results recorded separately |
| Interactive host capture permissions | Must be configured by the host owner; not enforced by this repository |
| Real GitHub publisher, branch settings, human identity | Not provisioned or verified; no publication authority inferred |

At the first real product adoption, replace this example with that project's actual scope, commands, limits and owner acceptance. Keep hard privacy and publication boundaries; tune investigation budgets from evidence.
