# Agentic Foundation

**Draft 0.1** — current version: [VERSION](VERSION). Prepared for initial publication; real-project validation remains pending. See [changes and versioning](CHANGELOG.md).

A practical starting point for development with coding agents: discover the problem, test the flow, agree the architecture, then deliver through a bounded implementation and verification loop.

The aim is useful autonomy with a small number of clear human decisions. Agents can implement, test, correct and publish reviewed non-UI work. Humans own product scope, UI/UX acceptance and permission to merge or release.

This is a stack-neutral playbook and set of templates, informed by [dot-orbit and dot-finance](docs/project-review.md). It is not an autonomous runner. Copying these files does not configure tool permissions, GitHub rulesets or an independent reviewer.

## Start here

1. Use the [discovery brief](templates/brief.md) to interrogate the problem and its assumptions. Matt Pocock's **grilling** skill is a useful optional companion to this “Grill-Me” stage.
2. Build a disposable HTML prototype with synthetic data. Exercise the core flows with a human, record what failed, then refine and re-grill.
3. Agree the requirements and consequential [architecture decisions](docs/architecture.md), recording ADRs where warranted and an explicit LikeC4 consideration. Configure the [project contract](templates/project-contract.md) with actual commands, permissions and limits.
4. Break the work into [bounded tasks](.github/ISSUE_TEMPLATE/task.md). Run the [delivery loop](docs/workflow.md), with an independent agent verifying each implementation.
5. Apply the [controls](docs/controls.md) at the tool and repository boundaries before enabling unattended execution.

Use the [adoption command and verification tools](docs/automation.md) to preview a safe copy, run regression checks and test a bounded Linux verifier. The [completed example](examples/project-contract.md) and [pilot record](examples/pilot.md) show concrete limits and their evidence.

For established behaviour, maintenance or non-interactive work, reuse accepted decisions and choose the smallest relevant experiment; the full HTML discovery sequence is for new or uncertain user flows.

Start small: one brief, one project contract and one ready task. Add records only when they preserve a decision or evidence someone needs. [Adoption](docs/adoption.md) explains what to copy, configure and prove.

## Non-negotiable defaults

- **Supported dependencies only:** no out-of-support libraries, runtimes, projects or tooling; verify exact-version upstream support under the [support policy](docs/support-policy.md).
- **No desktop capture:** disable desktop and native application screenshots, screen recording and ambient screen inspection. Use human observation and screenshot-free tests.
- **No routine CI artifacts:** release packages are the only permitted uploaded artifacts. Test state, logs, screenshots, caches and OS/container images are not artifact payloads.
- **Human UI/UX review before publication:** layout, copy, navigation, interaction and accessibility changes require approval of the actual local result before branch push or PR creation/update.
- **Independent verification:** another agent checks the implementation, tests and acceptance evidence. Self-review is useful but does not fulfil this gate.
- **Bounded autonomy:** stop for scope decisions, exhausted budgets or repeated failures; preserve enough state to resume.

These are the defaults of this foundation, not claims that every project or research source prescribes them. The detailed authority and evidence rules live in [controls](docs/controls.md).

## What is verified here

Run from the repository root with a maintained Python 3 installation:

```sh
python3 scripts/verify.py
```

The gate validates documentation and runs retained regression tests for adoption, snapshots and publication decisions. It does **not** enforce agent permissions, review quality, external link availability or the behaviour of a future application. Adoption includes separate negative controls for those boundaries.

See the [source review](docs/project-review.md), [primary-source research](docs/research.md) and [credits](CREDITS.md) for evidence and provenance.

## Licence and attribution

[MIT licensed](LICENSE), copyright 2026 nullabletype. Retain the copyright and licence notice in copies or substantial portions. A visible backlink is welcome but not an additional licence condition. Suggested credit: “Based on [Agentic Foundation by nullabletype](https://github.com/nullabletype/agentic-foundation).” Preserve the upstream attribution in [CREDITS.md](CREDITS.md).
