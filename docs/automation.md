# Small automation tools

These tools automate adoption, regression checking and verification. None schedules an agent, pushes a branch, authenticates a human approval or changes desktop permissions.

## Adopt without overwriting

From this foundation checkout:

```sh
python3 scripts/adopt.py /absolute/path/to/project
python3 scripts/adopt.py /absolute/path/to/project --apply
```

Preview is the default. Keep the destination quiescent during adoption. All destination paths are checked before writes; existing files and symlink paths block the operation. Unrelated files are preserved. The copied `AGENTS.md` is the adopter version, `PROJECT.md` is a draft contract, and the copied guidance has no dependency on this repository's checker. The foundation MIT notice is copied under `LICENSES/` and CREDITS.md records the source version. The application licence is unchanged. Nothing changes CI, Git state, installed skills or permissions. On a populated project, compare the preview and merge existing guidance deliberately rather than overwriting it.

## Run retained regression checks

```sh
python3 scripts/verify.py
```

Uses Python's standard library. This runs the documentation check and tests for broken links, escaping paths, adoption collisions, candidate snapshots and publication decisions. Tests write only disposable synthetic temporary files. The [CI workflow](../.github/workflows/docs.yml) runs the same entry point.

## Check publication evidence

```sh
python3 scripts/publication_check.py /path/outside/repo/evidence.json --repository /path/to/project
```

The tool checks a clean Git candidate, current local validation, a different reviewer, explicit UI/UX classification and, when required, approval for that exact SHA. Missing, malformed and stale evidence fail. Local validation requires nonblank `command`, `environment` and `evidence_ref` strings; independent review requires a nonblank `evidence_ref` pointing to its review record, including independently run checks and limitations. References may identify a sanitised local record or hosted run. The checker validates their presence, not their contents or authenticity; it never executes a recorded command or fetches a reference. A successful preflight does not push anything and does not override the project's publication authority.

The JSON format is demonstrated in [publication evidence](../examples/publication-evidence.json). That file is synthetic and must never be used as approval. Local JSON is an **operator-attested record, not authenticated authority**: a malicious writer can forge it. In an unattended publisher, trusted approvals must come from an external authority the candidate cannot edit; the publisher must independently check the candidate and control its own credentials. This foundation does not provision that publisher.

## Verify in an isolated Linux process

Requires a maintained Docker engine using Linux containers. The image is a deliberately configured development runtime in the local engine, never an uploaded artifact. Pull it explicitly once:

```sh
docker pull python:3.14.7-slim-trixie@sha256:51dafde81dbdb6ebde285137a295cf18a47ca95234fe388a343719cb97305b3d
python3 scripts/isolated_verify.py examples/isolated-candidate
python3 scripts/pilot_isolation.py
```

The input is a **reviewed public/synthetic source export**, with a root `verify.py` that may import sibling modules/packages, at most 100 regular files, 200 filesystem entries and 1 MiB total. Git metadata, common credential directories and symlinks are rejected. These checks are not a secret scanner: review the export before handing it to any agent. The tool copies a bounded snapshot and reports its SHA-256 identity. Keep the source quiescent during export.

The Linux reference profile uses a non-root user, Docker networking disabled and no active interfaces except loopback (dormant kernel tunnel devices may exist), no capabilities, no privilege escalation, a read-only filesystem and candidate snapshot, 128 MiB memory, one CPU and 64 processes. Writable scratch is 16 MiB at `/tmp` plus 1 MiB shared memory. No host home, desktop integration, Docker socket, publication credential or environment forwarding is mounted. Raw candidate output is discarded and capped at 64 KiB. Candidate execution defaults to 30 seconds, with a hard maximum of 60; Docker setup and cleanup each have separate ten-second bounds. Only this run's container and snapshot are removed. The pulled image stays in the engine; no blanket pruning occurs.

Before candidate execution, a trusted probe checks isolation, inherited environment, readonly paths and scratch bounds without attempting screen capture. The pilot also proves rejection of a failing candidate, candidate writes, scratch overflow, timeout and excessive output. Containers reduce exposure but are not a guarantee against a kernel/container-runtime vulnerability. This profile verifies small dependency-free Python candidates; it is not a sandbox for the entire interactive agent or a native application UI test.

A host agent must separately have capture/ambient-screen tools disabled **before its first run**, including supervised work. Removing one named screenshot tool does not block equivalent shell commands. Use an isolated environment without desktop access for candidate execution, and restrict the interactive agent's tool surface. This repository cannot revoke the host application's permissions by writing Markdown.

## Calibrate the reviewer

At first adoption, after a significant model change or after an escaped defect, give a separate reviewer only [the candidate pack](../examples/calibration/candidates.md). Request verdicts and evidence, then compare against [the answer key](../examples/calibration/answer-key.md). Measure false acceptances and unnecessary blocks; do not optimise for approving every case. The exercise tests judgement, not just whether an agent can read the expected answers.

Use the [completed example contract](../examples/project-contract.md) and [pilot record](../examples/pilot.md) as evidence of what was exercised here. They grant no permissions to another project.

Sources: [Docker run isolation and constraints](https://docs.docker.com/engine/containers/run/), [official Python image](https://hub.docker.com/_/python), and [Python support status](https://devguide.python.org/versions/), checked 27 September 2026. The pinned image uses maintained Python 3.14.7 on Debian trixie. Recheck support and refresh the digest when updating the reference profile.
