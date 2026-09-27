# Agent guidance

This repository maintains a stack-neutral development playbook and reusable templates. Keep it small enough to use on a real project. Do not introduce an application stack, autonomous controller or new mandatory ceremony without an agreed need.

## Hard boundaries

- Never capture the desktop, native application windows, screen recordings or ambient screen context. Do not call tools that implicitly capture them. Use source inspection, screenshot-free tests and human observation. Read [controls](docs/controls.md) before any visual or UI verification.
- Before staging or publishing, inspect all intended files and outgoing history for secrets, private personal data and local-only output. Resolve findings without echoing sensitive values; follow the pre-publication privacy check in [controls](docs/controls.md).
- Use synthetic data. Keep credentials, private records and raw environment dumps out of agent context, version control and public evidence.
- Generated output follows [controls](docs/controls.md): no routine CI artifact uploads or test-state transport through artifacts.
- Never introduce or continue using out-of-support libraries, projects, runtimes or tooling. Verify current upstream support for the selected version; unknown status blocks adoption. Follow [support policy](docs/support-policy.md).
- Record the LikeC4 consideration and rationale before architecture readiness; follow [architecture decisions](docs/architecture.md).
- Preserve unrelated work. Inspect Git state before changes and staging. Destructive operations, merge and release require explicit authority.
- UI/UX changes require human review of the local result before pushing or creating/updating a PR. Independent agent review cannot approve styling or replace this gate.

## Working loop

For implementation, publication or resumption, read [workflow](docs/workflow.md) and the adopting project's completed contract. Work on one ready task, run its agreed checks, and obtain independent verification from an agent that did not implement the change. Use a read-only reviewer; concurrent writers need separate worktrees.

For policy changes, test the affected boundary and obtain human approval before applying broader permissions or weaker gates. Resolve routine implementation details within the accepted scope without repeated permission requests. Escalate only the blocked decision and continue independent safe work.

Use `python3 scripts/verify.py` for this repository's local documentation and regression gate. Record what was actually checked and any unverified boundary. Do not claim that prose, a passing documentation check or a PR checkbox enforces runtime controls.

## Where to look

- Adopting this foundation: [adoption](docs/adoption.md) and [project contract](templates/project-contract.md).
- Product discovery or a disposable HTML experiment: [brief](templates/brief.md).
- Resuming or handing off work: [handoff](templates/handoff.md).
- Reviewing implementation: [independent review](templates/independent-review.md).
- Changing rationale or attribution: [project review](docs/project-review.md), [research](docs/research.md), [credits](CREDITS.md).

For adoption tooling, isolated verification or publication preflight changes, read [automation](docs/automation.md). Run `python3 scripts/pilot_isolation.py` when changing the isolation boundary, using Docker with the configured image; never fall back to executing an untrusted candidate on the host.
