# Optional agent evaluation toolkit

Give a coding agent small synthetic jobs, check the resulting files, and record first-pass success, corrections, execution failures and optional independent review. Use this to investigate changes to guidance or agent configuration. It does not test an application's quality or grant publication authority.

This toolkit is maintained here rather than copied into adopting projects. The normal playbook and Python verification command work without Node or this toolkit. `scripts/adopt.py` does not install it. No real agent runs automatically in CI.

## Requirements

Use Git and Node.js **24.21.0**, the reproducible reference runtime pinned in [.node-version](.node-version). There are no npm dependencies or install step. Node's bundled dependencies ship with that runtime. Checked 19 October 2026 against the [24.21.0 LTS release](https://nodejs.org/en/blog/release/v24.21.0) and [support schedule](https://github.com/nodejs/Release#release-schedule); Node 24 is supported through 30 April 2028. Maintainers own updates; recheck by 19 November 2026 or before changing the runtime. CI uses the existing pinned setup-node action from dot-orbit; [upstream release](https://github.com/actions/setup-node/releases/tag/v7.0.0). Ubuntu 24.04 is the existing reference runner.

## Start with the scripted check

From a clean, committed agentic-foundation checkout, run:

```sh
node --test toolkits/agent-evaluation/harness.test.mjs toolkits/agent-evaluation/budget-broker.test.mjs
node toolkits/agent-evaluation/run.mjs \
  --repo . --cases toolkits/agent-evaluation/cases \
  --candidate node \
  --candidate-arg toolkits/agent-evaluation/reference-candidate.mjs \
  --candidate-identity scripted-reference \
  --trials 2 --max-corrections 0 \
  --results /tmp/foundation-reference.json
```

Choose a fresh result filename outside the target repository; an existing file is never overwritten. The example completes eight attempts: four cases, twice each. The reference candidate writes known solutions. Passing proves the runner and graders work together; it provides no evidence about AI performance. Temporary test repositories/worktrees are cleaned by their owning run. Results are aggregate-only local records; select a bounded private location and cleanup owner for retained runs. CI uploads no artifacts.

The included cases cover list reordering, calendar-date regression repair, stale command documentation, and supported dependency pins using an offline synthetic catalogue. Product-specific cases belong to their product repository. dot-orbit retains its issue-readiness and Avalonia recovery cases; follow its [case-pack instructions](https://github.com/nullabletype/dot-orbit/tree/main/evaluations/agent-loop).

## Evaluate another repository

Keep the toolkit in this checkout. Commit the target's case pack and instructions first, then pass its repository and case directory explicitly:

```sh
node /path/to/agentic-foundation/toolkits/agent-evaluation/run.mjs \
  --repo /path/to/project --cases evaluations/agent-loop/cases \
  --candidate /path/to/restricted-agent-launcher \
  --candidate-identity reviewed-agent-configuration \
  --trials 2 --max-corrections 1 \
  --results /private/evaluation-results/project.json
```

`--repo` selects the clean source checkout; `--cases` selects a directory inside it. Each case is a subdirectory containing a version-1 `case.json` manifest with repository-relative starting files, allowed edit paths, a task prompt, expected outcomes, checks and a rubric. See the [ordering example](cases/bounded-ordering/case.json). Packs may contain one to ten cases. The candidate works in a fresh detached checkout per case/trial. Candidate script paths are relative to that checkout unless absolute.

The launcher receives the task on standard input and must finish with exit zero. Environment fields `AGENT_EVAL_CASE_ID`, `AGENT_EVAL_WORKTREE` and `AGENT_EVAL_ALLOWED_PATHS` identify the case, temporary checkout and colon-separated permitted paths. These are hints, not security controls. Graders support command checks, required/forbidden text and changed-file scope. Every required check must pass; points cannot average away failure.

Add `--reviewer /path/to/restricted-review-launcher` and repeated `--reviewer-arg` values for independent review. The reviewer receives a prompt naming the actual case manifest, inspects the diff without editing, and exits zero to approve. No reviewer is recorded as unavailable; it does not block the runner's success but does not satisfy a project's independent-review gate.

## Before running a real agent

Configure and test the execution boundary under the [evaluation guidance](../../docs/agent-evaluation.md) and [controls](../../docs/controls.md). The CLI launches host processes, forwards the host environment and provides temporary checkouts, not a sandbox. A trusted external launcher must restrict credentials, network, desktop access, unrelated data, output, scratch and budgets. Candidate/reviewer restrictions alone do not restrict command graders: use `runEvaluation` with both `processRunner` and `commandRunner` adapters for executable agent trials. Run only reviewed synthetic commands directly on the host.

The CLI has a ten-minute invocation timeout and bounded correction count. It does not enforce a whole-run token budget or provision a restricted real-agent launcher. Optional [subscription budget controls](budget-controls.md) provide a provider-specific broker/ledger API for a separately reviewed launcher. They are not required for the generic toolkit or manual evaluation procedure.

Cases and scripted answers are visible in the repository: this is a transparent regression signal, not a blind benchmark. Keep trusted grading and acceptance controls outside candidate control when using results as acceptance evidence.

## Read the results

New results use `agentic-foundation-agent-evaluation:v1`. They separate deterministic check success, valid execution, first-pass check success and independent review. A crash, timeout or spawn failure invalidates execution even if files pass. Configured review must approve; omitted review is unavailable. Corrections retain earlier failures and stop at the declared limit. Raw stdout/stderr, transcripts and reviewer prose are discarded.

Results record the target commit, instruction fingerprint, case/workflow fingerprint (`harnessVersion`), and separate content fingerprint of the executing toolkit (`toolkitVersion`). The toolkit fingerprint includes its source, tests, docs and bundled cases. External skills, user instructions and model identity still require an honest candidate label. Fingerprints identify inputs; the tool does not automatically compare runs or attribute changes to guidance.

Orbit's historical `dot-orbit-agent-evaluation:v1`/`:v2` results remain historical. The extracted packs and toolkit identity start a new comparison series. After material guidance, case, grading or orchestration changes, validate the scripted reference, then run at least two real-agent trials per affected case before making performance claims. Missing real trials remain pending.

## Provenance

Extracted from dot-orbit commit `28a6c01`, with target/case selection and separate toolkit fingerprinting added. The [MIT notice](LICENSE) accompanies the extracted code. The original Orbit baseline stays with Orbit. This toolkit adds no agent scheduler, application stack, permission change or mandatory adopter gate.
